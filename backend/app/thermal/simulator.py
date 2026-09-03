from typing import List, Dict, Any, Optional
from app.models.schemas import (
    ShelterDesign, ClimateProfile, SimulationResult, SimulationSummary, HourlySimulationStep
)
from app.thermal.geometry import get_net_areas
from app.thermal.materials import get_materials_db, calculate_composite_u_value, calculate_assembly_cost
from app.thermal.solar import calculate_window_solar_gain, calculate_opaque_solar_gain
from app.thermal.conduction import calculate_envelope_conduction
from app.thermal.ventilation import ventilation_heat_loss
from app.thermal.thermal_mass import calculate_effective_heat_capacity, update_indoor_temperature
from app.thermal.comfort import evaluate_thermal_comfort

def run_thermal_simulation(
    design: ShelterDesign,
    climate: ClimateProfile,
    simulation_days: int = 1,
    initial_indoor_offset: float = 0.0,
    comfort_min: float = 18.0,
    comfort_max: float = 27.0
) -> SimulationResult:
    """
    Executes dynamic stateful time-stepped thermal simulation of the shelter.
    Returns hourly time-series data, breakdown of heat flows, summary statistics, and thermal score.
    """
    materials_db = get_materials_db()
    
    # 1. Geometry Cutouts & Net Areas
    net_areas = get_net_areas(
        length=design.length,
        width=design.width,
        height=design.height,
        roof_type=design.roof_type,
        window_area=design.window_area,
        window_orientation=design.window_orientation,
        door_area=design.door_area
    )
    
    # 2. Material Layer U-values
    wall_mat = materials_db.get(design.wall_material_id, materials_db["brick"])
    insulation_mat = materials_db.get(design.insulation_material_id, materials_db["mineral_wool"])
    roof_mat = materials_db.get(design.roof_material_id, materials_db["concrete"])
    floor_mat = materials_db.get(design.floor_material_id, materials_db["concrete"])
    glazing_mat = materials_db.get("glass_double", materials_db["brick"])
    door_mat = materials_db.get("wood", materials_db["wood"])
    
    # Composite Assemblies
    wall_layers = [(wall_mat, design.wall_thickness)]
    if design.insulation_thickness > 0:
        wall_layers.append((insulation_mat, design.insulation_thickness))
    
    roof_layers = [(roof_mat, design.roof_thickness)]
    if design.insulation_thickness > 0:
        roof_layers.append((insulation_mat, design.insulation_thickness))
        
    floor_layers = [(floor_mat, design.floor_thickness)]
    
    wall_u = calculate_composite_u_value(wall_layers)
    roof_u = calculate_composite_u_value(roof_layers)
    floor_u = calculate_composite_u_value(floor_layers)
    window_u = 2.2 if design.window_glazing_type == "double_pane" else (1.4 if design.window_glazing_type == "triple_pane" else 5.8)
    door_u = 2.0
    
    # 3. Cost Calculation in INR
    wall_cost = calculate_assembly_cost(wall_layers, net_areas["gross_wall_area"])
    roof_cost = calculate_assembly_cost(roof_layers, net_areas["roof_area"])
    floor_cost = calculate_assembly_cost(floor_layers, net_areas["floor_area"])
    window_cost = net_areas["window_area"] * 6500.0  # Approx window cost per m2
    door_cost = net_areas["door_area"] * 4500.0      # Approx door cost per m2
    
    mass_mat = materials_db.get(design.thermal_mass_material_id, materials_db["stone"])
    mass_cost = (design.thermal_mass_kg / mass_mat.density) * mass_mat.estimated_cost_per_m3
    
    total_cost = wall_cost + roof_cost + floor_cost + window_cost + door_cost + mass_cost
    
    # 4. Thermal Mass Capacitance
    wall_mass_kg = net_areas["gross_wall_area"] * design.wall_thickness * wall_mat.density
    roof_mass_kg = net_areas["roof_area"] * design.roof_thickness * roof_mat.density
    
    c_eff = calculate_effective_heat_capacity(
        volume=net_areas["volume"],
        wall_mass_kg=wall_mass_kg,
        wall_mat_id=design.wall_material_id,
        roof_mass_kg=roof_mass_kg,
        roof_mat_id=design.roof_material_id,
        additional_mass_kg=design.thermal_mass_kg,
        additional_mat_id=design.thermal_mass_material_id
    )
    
    # 5. Dynamic Simulation Loop
    hourly_steps: List[HourlySimulationStep] = []
    base_climate = climate.hourly_data
    
    # Set initial indoor temperature
    initial_t_out = base_climate[0].temperature
    t_indoor = initial_t_out + initial_indoor_offset
    
    indoor_temps: List[float] = []
    outdoor_temps: List[float] = []
    
    total_solar_joules = 0.0
    total_loss_joules = 0.0
    total_wall_loss_j = 0.0
    total_roof_loss_j = 0.0
    total_floor_loss_j = 0.0
    total_win_loss_j = 0.0
    total_door_loss_j = 0.0
    total_vent_loss_j = 0.0
    
    step_counter = 0
    for day in range(simulation_days):
        for climate_step in base_climate:
            hour = climate_step.hour
            t_out = climate_step.temperature
            rad = climate_step.solar_radiation
            
            # Solar Heat Gain (Glazing + Sol-air opaque)
            win_solar = calculate_window_solar_gain(
                global_solar_radiation=rad,
                window_area=net_areas["window_area"],
                window_orientation=design.window_orientation,
                hour=hour
            )
            
            roof_solar = calculate_opaque_solar_gain(
                global_solar_radiation=rad,
                surface_area=net_areas["roof_area"],
                surface_u_value=roof_u,
                solar_absorptance=roof_mat.solar_absorptance,
                surface_orientation=design.orientation,
                hour=hour
            )
            
            total_solar_watts = win_solar + roof_solar
            
            # Conductive Heat Transfer Rates (Watts)
            cond = calculate_envelope_conduction(
                net_wall_area=net_areas["net_wall_area"],
                wall_u=wall_u,
                roof_area=net_areas["roof_area"],
                roof_u=roof_u,
                floor_area=net_areas["floor_area"],
                floor_u=floor_u,
                window_area=net_areas["window_area"],
                window_u=window_u,
                door_area=net_areas["door_area"],
                door_u=door_u,
                temp_inside=t_indoor,
                temp_outside=t_out
            )
            
            # Ventilation Heat Loss (Watts)
            vent_watts = ventilation_heat_loss(
                ach=design.ach,
                volume=net_areas["volume"],
                temp_inside=t_indoor,
                temp_outside=t_out,
                altitude_m=3500.0
            )
            
            # Net Instantaneous Heat Rate (Watts)
            # Positive net_heat means heat is accumulating in shelter
            net_heat_watts = total_solar_watts - cond["total_conduction_loss"] - vent_watts
            
            # Store hourly step record
            step_record = HourlySimulationStep(
                hour=step_counter,
                outside_temperature=round(t_out, 2),
                inside_temperature=round(t_indoor, 2),
                solar_radiation=round(rad, 1),
                solar_gain=round(total_solar_watts / 1000.0, 3),        # kW
                wall_loss=round(cond["wall_loss"] / 1000.0, 3),          # kW
                roof_loss=round(cond["roof_loss"] / 1000.0, 3),          # kW
                floor_loss=round(cond["floor_loss"] / 1000.0, 3),        # kW
                window_loss=round(cond["window_loss"] / 1000.0, 3),      # kW
                door_loss=round(cond["door_loss"] / 1000.0, 3),        # kW
                ventilation_loss=round(vent_watts / 1000.0, 3),         # kW
                net_heat=round(net_heat_watts / 1000.0, 3)               # kW
            )
            hourly_steps.append(step_record)
            
            indoor_temps.append(t_indoor)
            outdoor_temps.append(t_out)
            
            # Energy tracking (Joules over 1 hour timestep = 3600 seconds)
            total_solar_joules += max(0.0, total_solar_watts) * 3600.0
            total_wall_loss_j += max(0.0, cond["wall_loss"]) * 3600.0
            total_roof_loss_j += max(0.0, cond["roof_loss"]) * 3600.0
            total_floor_loss_j += max(0.0, cond["floor_loss"]) * 3600.0
            total_win_loss_j += max(0.0, cond["window_loss"]) * 3600.0
            total_door_loss_j += max(0.0, cond["door_loss"]) * 3600.0
            total_vent_loss_j += max(0.0, vent_watts) * 3600.0
            
            total_loss_joules += (
                max(0.0, cond["total_conduction_loss"]) + max(0.0, vent_watts)
            ) * 3600.0
            
            # State Update for next timestep
            t_indoor = update_indoor_temperature(
                current_temp=t_indoor,
                net_heat_watts=net_heat_watts,
                capacitance_j_k=c_eff,
                timestep_seconds=3600.0
            )
            step_counter += 1

    # Convert Joules to kWh (1 kWh = 3.6e6 J)
    solar_kwh = round(total_solar_joules / 3.6e6, 2)
    heat_loss_kwh = round(total_loss_joules / 3.6e6, 2)
    net_heat_kwh = round((total_solar_joules - total_loss_joules) / 3.6e6, 2)
    
    # Comfort Evaluation
    comfort_stats = evaluate_thermal_comfort(
        indoor_temperatures=indoor_temps,
        outdoor_temperatures=outdoor_temps,
        total_heat_loss_kwh=heat_loss_kwh,
        total_solar_gain_kwh=solar_kwh,
        comfort_min=comfort_min,
        comfort_max=comfort_max
    )
    
    summary = SimulationSummary(
        average_temperature=comfort_stats["average_temperature"],
        min_temperature=comfort_stats["min_temperature"],
        max_temperature=comfort_stats["max_temperature"],
        comfort_hours=comfort_stats["comfort_hours"],
        total_simulation_hours=step_counter,
        comfort_percentage=comfort_stats["comfort_percentage"],
        solar_gain_kwh=solar_kwh,
        heat_loss_kwh=heat_loss_kwh,
        net_heat_kwh=net_heat_kwh,
        estimated_cost=round(total_cost, 0),
        thermal_score=comfort_stats["thermal_score"],
        wall_u_value=round(wall_u, 3),
        roof_u_value=round(roof_u, 3),
        floor_area=round(net_areas["floor_area"], 1),
        volume=round(net_areas["volume"], 1),
        heat_loss_breakdown={
            "wall_kwh": round(total_wall_loss_j / 3.6e6, 2),
            "roof_kwh": round(total_roof_loss_j / 3.6e6, 2),
            "floor_kwh": round(total_floor_loss_j / 3.6e6, 2),
            "window_kwh": round(total_win_loss_j / 3.6e6, 2),
            "door_kwh": round(total_door_loss_j / 3.6e6, 2),
            "ventilation_kwh": round(total_vent_loss_j / 3.6e6, 2)
        }
    )
    
    return SimulationResult(
        hourly=hourly_steps,
        summary=summary,
        design=design
    )
