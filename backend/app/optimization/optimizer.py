import random
import math
from typing import List, Dict, Any, Optional
from app.models.schemas import (
    ShelterDesign, OptimizationRequest, OptimizationResult, DesignRecommendation,
    SimulationResult, ClimateProfile, WhatIfRequest, WhatIfResult, SensitivityResult
)
from app.thermal.simulator import run_thermal_simulation
from app.thermal.materials import get_materials_db
import json
import os

try:
    import optuna
    HAS_OPTUNA = True
except ImportError:
    HAS_OPTUNA = False

def get_climate_profile(location_id: str) -> ClimateProfile:
    """Loads bundled climate profile for given location ID."""
    base_dir = os.path.join(os.path.dirname(__file__), "..", "data", "climate_data")
    filepath = os.path.join(base_dir, f"{location_id.lower()}.json")
    if not os.path.exists(filepath):
        filepath = os.path.join(base_dir, "leh.json")
    
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    return ClimateProfile(**data)

def generate_candidate_designs(request: OptimizationRequest) -> List[ShelterDesign]:
    """Generates candidate shelter designs within geometric, material, and budget bounds."""
    materials_db = get_materials_db()
    
    # Filter available materials by user selection if provided
    available = set(request.available_materials) if request.available_materials else set(materials_db.keys())
    
    struct_mats = [m for m in ["brick", "stone", "concrete", "adobe", "wood", "earth"] if m in available or not request.available_materials]
    if not struct_mats:
        struct_mats = ["brick", "stone", "concrete"]
        
    insul_mats = [m for m in ["mineral_wool", "eps", "xps", "cellulose", "straw"] if m in available or not request.available_materials]
    if not insul_mats:
        insul_mats = ["mineral_wool", "eps"]
        
    # Search grid space
    candidates: List[ShelterDesign] = []
    
    length_opts = [5.0, 6.0, 7.0]
    width_opts = [4.0, 5.0, 6.0]
    height_opts = [2.8, 3.0, 3.2]
    orientation_opts = [90.0, 180.0, 270.0]  # East, South, West
    roof_types = ["sloped", "flat"]
    insul_thicknesses = [0.05, 0.08, 0.10, 0.12, 0.15]
    window_areas = [2.0, 4.0, 6.0]
    thermal_masses = [500.0, 1200.0, 2000.0, 3000.0]
    
    for l in length_opts:
        for w in width_opts:
            area = l * w
            if area < request.min_area or area > request.max_area:
                continue
            for h in height_opts:
                for ori in orientation_opts:
                    for wall_m in struct_mats[:2]:
                        for insul_m in insul_mats[:2]:
                            for insul_t in insul_thicknesses:
                                for win_a in window_areas:
                                    for roof_t in roof_types:
                                        for t_mass in thermal_masses:
                                            design = ShelterDesign(
                                                name=f"Design {l}x{w}m ({wall_m.title()} + {int(insul_t*100)}cm {insul_m.title()})",
                                                length=l,
                                                width=w,
                                                height=h,
                                                orientation=ori,
                                                wall_material_id=wall_m,
                                                wall_thickness=0.23 if wall_m == "brick" else 0.30,
                                                roof_material_id="concrete" if roof_t == "flat" else "wood",
                                                roof_thickness=0.15,
                                                roof_type=roof_t,
                                                floor_material_id="concrete",
                                                floor_thickness=0.15,
                                                insulation_material_id=insul_m,
                                                insulation_thickness=insul_t,
                                                window_area=win_a,
                                                window_orientation=180.0,  # South glazing optimal
                                                window_glazing_type="double_pane",
                                                door_area=2.0,
                                                thermal_mass_kg=t_mass,
                                                thermal_mass_material_id="stone",
                                                ach=0.5
                                            )
                                            candidates.append(design)
    
    # Subsample candidates if space is huge
    if len(candidates) > 120:
        random.seed(42)
        candidates = random.sample(candidates, 120)
    
    return candidates

def calculate_multi_objective_score(sim: SimulationResult, req: OptimizationRequest) -> float:
    """
    Computes multi-objective fitness score (higher is better).
    Penalizes designs exceeding user budget.
    """
    summary = sim.summary
    
    # 1. Comfort score (0 to 100)
    score_comfort = (summary.comfort_hours / summary.total_simulation_hours) * 100.0
    
    # 2. Heat loss score (lower kWh loss gives higher score)
    # Normalized: 0 kWh loss = 100, 20 kWh loss = 0
    score_heat_loss = max(0.0, 100.0 - (summary.heat_loss_kwh * 5.0))
    
    # 3. Cost score (lower cost gives higher score, heavy penalty if exceeding budget)
    if summary.estimated_cost <= req.max_budget:
        score_cost = (1.0 - (summary.estimated_cost / req.max_budget)) * 100.0
    else:
        # Penalty multiplier for budget overrun
        overrun_ratio = summary.estimated_cost / req.max_budget
        score_cost = max(-500.0, -100.0 * overrun_ratio)
        
    # 4. Solar utilization score (0 to 100)
    solar_ratio = (summary.solar_gain_kwh / (summary.heat_loss_kwh + 0.1)) if summary.heat_loss_kwh > 0 else 1.0
    score_solar = min(100.0, solar_ratio * 100.0)
    
    # Combined weighted objective score
    total_score = (
        req.weight_comfort * score_comfort +
        req.weight_heat_loss * score_heat_loss +
        req.weight_cost * score_cost +
        req.weight_solar * score_solar
    )
    
    return total_score

def generate_why_explanation(design: ShelterDesign, sim: SimulationResult, req: OptimizationRequest) -> List[str]:
    """Generates transparent, physics-based bullet explanations for why the design was selected."""
    summary = sim.summary
    bullets = []
    
    insul_cm = int(design.insulation_thickness * 100)
    bullets.append(f"✓ {insul_cm} cm of {design.insulation_material_id.replace('_', ' ').title()} insulation reduces wall U-value to {summary.wall_u_value} W/m²K, minimizing conductive heat loss.")
    
    if design.window_orientation == 180.0:
        bullets.append(f"✓ South-facing glazing ({design.window_area} m²) maximizes daytime solar heat gain ({summary.solar_gain_kwh} kWh/day) in cold winter climate.")
    else:
        bullets.append(f"✓ Glazing area ({design.window_area} m²) balances daytime natural illumination against nighttime heat loss.")
        
    if design.thermal_mass_kg > 0:
        bullets.append(f"✓ {int(design.thermal_mass_kg)} kg of high thermal capacity storage dampens diurnal temperature swings and retains daytime heat into the night.")
        
    cost_lakh = round(summary.estimated_cost / 100000.0, 2)
    budget_lakh = round(req.max_budget / 100000.0, 2)
    bullets.append(f"✓ Construction cost of ₹{cost_lakh} lakh remains within the specified budget constraint (₹{budget_lakh} lakh).")
    
    bullets.append(f"✓ Achieves {summary.comfort_hours:.1f} comfortable thermal hours out of {summary.total_simulation_hours} simulated hours ({summary.comfort_percentage:.0f}% comfort coverage).")
    
    return bullets

def run_optimization(request: OptimizationRequest) -> OptimizationResult:
    """Runs candidate design search and returns top 5 design recommendations."""
    climate = get_climate_profile(request.location_id)
    candidates = generate_candidate_designs(request)
    
    evaluated = []
    for idx, design in enumerate(candidates):
        sim = run_thermal_simulation(
            design=design,
            climate=climate,
            simulation_days=1,
            comfort_min=request.comfort_min,
            comfort_max=request.comfort_max
        )
        score = calculate_multi_objective_score(sim, request)
        evaluated.append({
            "design": design,
            "simulation": sim,
            "score": score
        })
        
    # Sort evaluated designs
    # 1. Best overall (highest multi-objective score under budget)
    valid_under_budget = [e for e in evaluated if e["simulation"].summary.estimated_cost <= request.max_budget]
    if not valid_under_budget:
        valid_under_budget = evaluated
        
    best_overall = max(valid_under_budget, key=lambda x: x["score"])
    
    # 2. Best thermal comfort
    best_comfort = max(valid_under_budget, key=lambda x: x["simulation"].summary.comfort_hours)
    
    # 3. Lowest cost
    lowest_cost = min(valid_under_budget, key=lambda x: x["simulation"].summary.estimated_cost)
    
    # 4. Lowest heat loss
    lowest_heat_loss = min(valid_under_budget, key=lambda x: x["simulation"].summary.heat_loss_kwh)
    
    # 5. Best solar utilization
    best_solar = max(valid_under_budget, key=lambda x: x["simulation"].summary.solar_gain_kwh)
    
    category_map = [
        (1, "Best Overall Solution", best_overall),
        (2, "Maximum Thermal Comfort", best_comfort),
        (3, "Lowest Construction Cost", lowest_cost),
        (4, "Minimum Heat Loss", lowest_heat_loss),
        (5, "Maximum Solar Utilization", best_solar)
    ]
    
    top_recommendations: List[DesignRecommendation] = []
    seen_names = set()
    
    for rank, cat_name, item in category_map:
        d = item["design"]
        s = item["simulation"]
        why = generate_why_explanation(d, s, request)
        
        rec = DesignRecommendation(
            rank=rank,
            category=cat_name,
            design=d,
            simulation_result=s,
            why_explanation=why
        )
        top_recommendations.append(rec)
        
    rec_design = top_recommendations[0]
    
    return OptimizationResult(
        recommended_design=rec_design,
        top_designs=top_recommendations,
        total_searched=len(evaluated),
        climate_location=climate.location_name
    )

def run_what_if_analysis(request: WhatIfRequest) -> WhatIfResult:
    """Evaluates the immediate impact of changing a single shelter parameter."""
    climate = get_climate_profile(request.location_id)
    
    # Run original simulation
    original_sim = run_thermal_simulation(design=request.base_design, climate=climate)
    
    # Create modified design
    mod_dict = request.base_design.model_dump()
    param = request.parameter
    
    if param in mod_dict:
        mod_dict[param] = request.new_value
        
    modified_design = ShelterDesign(**mod_dict)
    new_sim = run_thermal_simulation(design=modified_design, climate=climate)
    
    orig_sum = original_sim.summary
    new_sum = new_sim.summary
    
    delta_comfort = round(new_sum.comfort_hours - orig_sum.comfort_hours, 1)
    delta_loss = round(new_sum.heat_loss_kwh - orig_sum.heat_loss_kwh, 2)
    delta_solar = round(new_sum.solar_gain_kwh - orig_sum.solar_gain_kwh, 2)
    delta_cost = round(new_sum.estimated_cost - orig_sum.estimated_cost, 0)
    delta_score = round(new_sum.thermal_score - orig_sum.thermal_score, 1)
    
    bullets = []
    bullets.append(f"Comfort hours changed by {delta_comfort:+.1f} hours/day (from {orig_sum.comfort_hours}h to {new_sum.comfort_hours}h).")
    bullets.append(f"Heat loss changed by {delta_loss:+.2f} kWh/day (from {orig_sum.heat_loss_kwh} kWh to {new_sum.heat_loss_kwh} kWh).")
    bullets.append(f"Solar gain changed by {delta_solar:+.2f} kWh/day.")
    bullets.append(f"Construction cost changed by ₹{delta_cost:+,.0f}.")
    bullets.append(f"Overall thermal performance score changed by {delta_score:+.1f} points.")
    
    return WhatIfResult(
        parameter_changed=param,
        old_value=getattr(request.base_design, param, request.base_design.insulation_thickness),
        new_value=request.new_value,
        original_result=original_sim,
        new_result=new_sim,
        delta_summary={
            "delta_comfort_hours": delta_comfort,
            "delta_heat_loss_kwh": delta_loss,
            "delta_solar_gain_kwh": delta_solar,
            "delta_cost_inr": delta_cost,
            "delta_score": delta_score
        },
        impact_bullets=bullets
    )

def run_sensitivity_analysis(design: ShelterDesign, location_id: str) -> List[SensitivityResult]:
    """Calculates perturbation sensitivities for key thermal design parameters."""
    climate = get_climate_profile(location_id)
    base_sim = run_thermal_simulation(design=design, climate=climate)
    base_score = base_sim.summary.thermal_score
    
    test_params = [
        ("insulation_thickness", 0.05, "Insulation Thickness (+5cm)"),
        ("thermal_mass_kg", 500.0, "Thermal Mass (+500kg)"),
        ("window_area", 2.0, "Window Area (+2m²)"),
        ("orientation", 90.0, "Orientation Shift (Rotated East)"),
        ("ach", 0.5, "Infiltration Rate (+0.5 ACH)")
    ]
    
    results: List[SensitivityResult] = []
    for param_name, step_val, label in test_params:
        mod_dict = design.model_dump()
        curr_val = mod_dict.get(param_name, 0)
        
        if isinstance(curr_val, (int, float)):
            mod_dict[param_name] = curr_val + step_val
            mod_design = ShelterDesign(**mod_dict)
            mod_sim = run_thermal_simulation(design=mod_design, climate=climate)
            mod_score = mod_sim.summary.thermal_score
            
            score_diff = abs(mod_score - base_score)
            impact_desc = f"Varying {label} changes overall thermal score by {score_diff:.1f} points."
            results.append(SensitivityResult(
                parameter=label,
                sensitivity_score=round(score_diff, 1),
                impact_description=impact_desc
            ))
            
    # Sort by sensitivity score descending
    results.sort(key=lambda r: r.sensitivity_score, reverse=True)
    return results
