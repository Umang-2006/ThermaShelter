import math
from typing import Dict

def get_orientation_solar_factor(hour: int, surface_orientation: float) -> float:
    """
    Returns an orientation multiplier (0.0 to 1.0+) for incident solar radiation based on hour of day and surface orientation.
    0° = North, 90° = East, 180° = South, 270° = West.
    In northern hemisphere (Ladakh ~34°N winter), South-facing (180°) captures peak solar radiation around midday.
    """
    if hour < 6 or hour > 18:
        return 0.0

    # Solar position angle throughout the day (hour 6 = 90° East, 12 = 180° South, 18 = 270° West)
    solar_azimuth = 90.0 + (hour - 6) * 15.0
    
    # Angle difference between solar azimuth and surface orientation
    angle_diff = abs(solar_azimuth - surface_orientation)
    angle_diff_rad = math.radians(angle_diff)
    
    # Cosine incident factor (clamped at 0 for shaded hours)
    cos_factor = max(0.0, math.cos(angle_diff_rad))
    
    # Add diffuse radiation component (15% background sky radiation)
    return cos_factor * 0.85 + 0.15

def calculate_window_solar_gain(
    global_solar_radiation: float,
    window_area: float,
    window_orientation: float,
    hour: int,
    shgc: float = 0.65
) -> float:
    """
    Calculates solar heat gain in Watts through window glazing.
    Q_solar_win = Global_Solar * Window_Area * SHGC * OrientationFactor
    """
    if global_solar_radiation <= 0 or window_area <= 0:
        return 0.0
    
    orientation_factor = get_orientation_solar_factor(hour, window_orientation)
    return global_solar_radiation * window_area * shgc * orientation_factor

def calculate_opaque_solar_gain(
    global_solar_radiation: float,
    surface_area: float,
    surface_u_value: float,
    solar_absorptance: float,
    surface_orientation: float,
    hour: int,
    r_outside: float = 0.04
) -> float:
    """
    Calculates equivalent sol-air temperature solar heat gain in Watts conducted through opaque envelope surfaces.
    Q_opaque_solar = Global_Solar * Area * Absorptance * R_out * U_value * OrientationFactor
    """
    if global_solar_radiation <= 0 or surface_area <= 0 or surface_u_value <= 0:
        return 0.0
    
    orientation_factor = get_orientation_solar_factor(hour, surface_orientation)
    return global_solar_radiation * surface_area * solar_absorptance * r_outside * surface_u_value * orientation_factor
