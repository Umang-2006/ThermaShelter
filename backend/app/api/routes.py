from fastapi import APIRouter, HTTPException
from typing import List
import os
import json

from app.models.schemas import (
    Material, Location, ClimateProfile, ShelterDesign, SimulationRequest, SimulationResult, 
    OptimizationRequest, OptimizationResult, ComparisonRequest, ComparisonResult, ComparisonItem,
    WhatIfRequest, WhatIfResult, SensitivityResult, ErrorResponse
)
from app.thermal.materials import get_materials_db
from app.thermal.simulator import run_thermal_simulation
from app.optimization.optimizer import (
    get_climate_profile, run_optimization, run_what_if_analysis, run_sensitivity_analysis
)

router = APIRouter()

def load_locations_db() -> List[Location]:
    """Loads location metadata from data/locations.json."""
    json_path = os.path.join(os.path.dirname(__file__), "..", "data", "locations.json")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [Location(**item) for item in data]

@router.get("/materials", response_model=List[Material])
def get_materials():
    """Returns list of construction materials with thermal properties and estimated costs."""
    materials_map = get_materials_db()
    return list(materials_map.values())

@router.get("/locations", response_model=List[Location])
def get_locations():
    """Returns supported location profiles in high-altitude cold desert regions."""
    return load_locations_db()

@router.get("/climate/{location_id}", response_model=ClimateProfile, responses={404: {"model": ErrorResponse}})
def get_climate(location_id: str):
    """Returns hourly ambient climate dataset for specified location."""
    try:
        return get_climate_profile(location_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Climate dataset for location '{location_id}' not found: {str(e)}")

@router.post("/simulate", response_model=SimulationResult, responses={500: {"model": ErrorResponse}})
def simulate(request: SimulationRequest):
    """Simulates dynamic hourly thermal indoor temperature and heat balance breakdown for a shelter design."""
    try:
        climate = get_climate_profile(request.location_id)
        return run_thermal_simulation(
            design=request.design,
            climate=climate,
            simulation_days=request.simulation_days,
            initial_indoor_offset=request.initial_indoor_offset,
            comfort_min=request.comfort_min,
            comfort_max=request.comfort_max
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

@router.post("/optimize", response_model=OptimizationResult, responses={500: {"model": ErrorResponse}})
def optimize(request: OptimizationRequest):
    """
    Searches candidate designs matching requirements, budget, and local materials,
    and returns Top 5 recommendations with transparent 'Why this design?' explanations.
    """
    try:
        return run_optimization(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization error: {str(e)}")

@router.post("/compare", response_model=ComparisonResult, responses={500: {"model": ErrorResponse}})
def compare(request: ComparisonRequest):
    """Compares thermal performance, heat loss, solar gain, and costs across multiple shelter designs."""
    try:
        climate = get_climate_profile(request.location_id)
        items: List[ComparisonItem] = []
        
        for idx, design in enumerate(request.designs):
            label = request.labels[idx] if (request.labels and idx < len(request.labels)) else f"Design {idx + 1}"
            sim_res = run_thermal_simulation(design=design, climate=climate)
            items.append(ComparisonItem(
                label=label,
                design=design,
                simulation_result=sim_res
            ))
            
        return ComparisonResult(items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison error: {str(e)}")

@router.post("/what-if", response_model=WhatIfResult, responses={500: {"model": ErrorResponse}})
def what_if(request: WhatIfRequest):
    """Evaluates the immediate thermal and financial impact of modifying a single parameter."""
    try:
        return run_what_if_analysis(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"What-If evaluation error: {str(e)}")

@router.post("/sensitivity", response_model=List[SensitivityResult], responses={500: {"model": ErrorResponse}})
def sensitivity(request: SimulationRequest):
    """Calculates sensitivity factors showing which design parameters most influence performance."""
    try:
        return run_sensitivity_analysis(design=request.design, location_id=request.location_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sensitivity analysis error: {str(e)}")
