import os
import json
from typing import Dict, List, Optional
from app.models.schemas import Material

_MATERIALS_CACHE: Optional[Dict[str, Material]] = None

def get_materials_db() -> Dict[str, Material]:
    """Loads materials from materials.json and returns a dictionary keyed by material ID."""
    global _MATERIALS_CACHE
    if _MATERIALS_CACHE is not None:
        return _MATERIALS_CACHE

    json_path = os.path.join(os.path.dirname(__file__), "..", "data", "materials.json")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    materials_map = {}
    for item in data:
        mat = Material(**item)
        materials_map[mat.id] = mat

    _MATERIALS_CACHE = materials_map
    return _MATERIALS_CACHE

def calculate_layer_r_value(thickness: float, thermal_conductivity: float) -> float:
    """Calculates thermal resistance R = thickness / thermal_conductivity."""
    if thermal_conductivity <= 0:
        return 0.0
    return thickness / thermal_conductivity

def calculate_composite_u_value(
    layers: List[tuple[Material, float]],
    r_inside: float = 0.13,
    r_outside: float = 0.04
) -> float:
    """
    Calculates overall heat transfer coefficient U (W/m²K) for a multilayer construction.
    U = 1 / (R_in + R_1 + R_2 + ... + R_out)
    """
    r_total = r_inside + r_outside
    for mat, thickness in layers:
        r_total += calculate_layer_r_value(thickness, mat.thermal_conductivity)
    
    return 1.0 / r_total if r_total > 0 else 1.0

def calculate_assembly_cost(layers: List[tuple[Material, float]], surface_area: float) -> float:
    """Calculates material cost in INR for a given surface area."""
    total_cost = 0.0
    for mat, thickness in layers:
        volume = surface_area * thickness
        total_cost += volume * mat.estimated_cost_per_m3
    return total_cost
