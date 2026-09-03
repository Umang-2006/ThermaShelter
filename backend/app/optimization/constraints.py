from app.models.schemas import ShelterDesign
from typing import Dict, List, Any

def is_physically_valid(design: ShelterDesign) -> bool:
    """Check if the design values are physically possible (positive)."""
    if design.wall_thickness <= 0 or design.roof_thickness <= 0:
        return False
    if design.window_area < 0 or design.overhang_depth < 0:
        return False
    return True

def validate_design(design: ShelterDesign, min_thickness: float = 0.05, max_thickness: float = 0.5) -> bool:
    """Validate design against practical construction constraints."""
    if not is_physically_valid(design):
        return False
    if not (min_thickness <= design.wall_thickness <= max_thickness):
        return False
    if not (min_thickness <= design.roof_thickness <= max_thickness):
        return False
    return True

def generate_design_space(materials: List[str]) -> Dict[str, Any]:
    """Generate search space parameters for optimization."""
    return {
        "wall_material_id": materials,
        "roof_material_id": materials,
        "wall_thickness": [0.1, 0.2, 0.3, 0.4],
        "roof_thickness": [0.1, 0.2, 0.3, 0.4],
        "window_area": [1.0, 2.0, 3.0],
        "overhang_depth": [0.0, 0.5, 1.0]
    }
