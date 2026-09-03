import math

def air_density_at_altitude(altitude_m: float) -> float:
    """Calculate air density (kg/m3) based on altitude (m) using standard atmosphere."""
    p0 = 101325.0  # Sea level standard atmospheric pressure (Pa)
    t0 = 288.15    # Sea level standard temperature (K)
    g = 9.80665    # Earth-surface gravitational acceleration (m/s2)
    l = 0.0065     # Temperature lapse rate (K/m)
    r = 8.31447    # Universal gas constant (J/(mol·K))
    m = 0.0289644  # Molar mass of dry air (kg/mol)
    
    temperature_at_alt = t0 - l * altitude_m
    pressure_at_alt = p0 * math.pow(1 - (l * altitude_m) / t0, (g * m) / (r * l))
    
    # density = P / (R_specific * T)
    r_specific = r / m
    density = pressure_at_alt / (r_specific * temperature_at_alt)
    return density

def ventilation_heat_loss(
    ach: float, 
    volume: float, 
    temp_inside: float, 
    temp_outside: float, 
    altitude_m: float = 0.0
) -> float:
    """
    Calculate heat loss/gain due to ventilation and infiltration.
    ach: Air Changes per Hour
    volume: Air volume of the zone (m3)
    Returns heat transfer in Watts. Positive is heat loss.
    """
    density = air_density_at_altitude(altitude_m)
    specific_heat_air = 1005.0  # J/(kg·K)
    
    # Flow rate in m3/s
    flow_rate_m3_s = (ach * volume) / 3600.0
    mass_flow_rate = flow_rate_m3_s * density
    
    heat_transfer_watts = mass_flow_rate * specific_heat_air * (temp_inside - temp_outside)
    return heat_transfer_watts
