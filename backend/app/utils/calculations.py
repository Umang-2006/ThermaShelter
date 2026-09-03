import math
from typing import List, Dict, Any

def calculate_r_value(thickness: float, conductivity: float) -> float:
    """Calculate thermal resistance (R-value)."""
    return thickness / conductivity if conductivity > 0 else 0.0

def calculate_u_value(r_value: float) -> float:
    """Calculate thermal transmittance (U-value)."""
    return 1.0 / r_value if r_value > 0 else 0.0

def calculate_sol_air_temp(t_out: float, solar_radiation: float, absorptivity: float, heat_transfer_coeff: float = 25.0) -> float:
    """Calculate sol-air temperature."""
    return t_out + (absorptivity * solar_radiation) / heat_transfer_coeff

def calculate_heat_transfer(u_value: float, area: float, delta_t: float) -> float:
    """Calculate total heat transfer across a surface."""
    return u_value * area * delta_t
