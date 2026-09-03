import math
from typing import Dict, Tuple

def calculate_floor_area(length: float, width: float) -> float:
    """Calculates floor area in square meters."""
    return length * width

def calculate_volume(length: float, width: float, height: float) -> float:
    """Calculates internal building volume in cubic meters."""
    return length * width * height

def calculate_wall_areas(length: float, width: float, height: float) -> Dict[str, float]:
    """
    Calculates gross wall areas by cardinal orientation.
    Assuming orientation:
    - Length runs East-West (North & South walls have width dimension)
    - Width runs North-South (East & West walls have length dimension)
    """
    return {
        "north": width * height,
        "south": width * height,
        "east": length * height,
        "west": length * height
    }

def calculate_roof_area(length: float, width: float, roof_type: str = "sloped") -> float:
    """
    Calculates roof area in square meters.
    If sloped, assumes standard 25 degree pitch multiplier (1/cos(25deg) ≈ 1.1034).
    """
    base_area = length * width
    if roof_type.lower() == "sloped":
        return base_area * 1.1034
    return base_area

def get_net_areas(
    length: float,
    width: float,
    height: float,
    roof_type: str,
    window_area: float,
    window_orientation: float,
    door_area: float
) -> Dict[str, float]:
    """
    Returns net conductive surface areas for all building envelopes:
    gross wall areas minus window/door cutouts.
    """
    floor_area = calculate_floor_area(length, width)
    volume = calculate_volume(length, width, height)
    roof_area = calculate_roof_area(length, width, roof_type)
    gross_walls = calculate_wall_areas(length, width, height)
    total_gross_wall = sum(gross_walls.values())
    
    # Ensure window area doesn't exceed total gross wall area
    max_glazing_allowed = total_gross_wall * 0.45
    clamped_window_area = min(window_area, max_glazing_allowed)
    clamped_door_area = min(door_area, 4.0)
    
    net_wall_area = max(0.0, total_gross_wall - clamped_window_area - clamped_door_area)
    
    return {
        "floor_area": floor_area,
        "volume": volume,
        "roof_area": roof_area,
        "gross_wall_area": total_gross_wall,
        "net_wall_area": net_wall_area,
        "window_area": clamped_window_area,
        "door_area": clamped_door_area
    }
