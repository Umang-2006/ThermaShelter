from typing import Dict
from app.thermal.materials import get_materials_db

def calculate_effective_heat_capacity(
    volume: float,
    wall_mass_kg: float,
    wall_mat_id: str,
    roof_mass_kg: float,
    roof_mat_id: str,
    additional_mass_kg: float,
    additional_mat_id: str,
    air_density: float = 1.0  # High altitude air density ~1.0 kg/m3 at 3500m
) -> float:
    """
    Calculates total effective building thermal capacitance C_eff (J/K).
    C_eff = C_air + C_walls + C_roof + C_thermal_mass
    """
    materials = get_materials_db()
    c_air = 1005.0
    air_capacity = volume * air_density * c_air
    
    # Internal active surface thermal participation (~20% of wall mass participates dynamically on hourly cycle)
    wall_cp = materials.get(wall_mat_id, materials["brick"]).specific_heat
    wall_capacity = wall_mass_kg * 0.25 * wall_cp
    
    roof_cp = materials.get(roof_mat_id, materials["concrete"]).specific_heat
    roof_capacity = roof_mass_kg * 0.25 * roof_cp
    
    mass_cp = materials.get(additional_mat_id, materials["stone"]).specific_heat
    additional_capacity = additional_mass_kg * mass_cp
    
    total_capacity = air_capacity + wall_capacity + roof_capacity + additional_capacity
    # Enforce a realistic minimum thermal inertia (at least 1.0 e6 J/K)
    return max(total_capacity, 1.0e6)

def update_indoor_temperature(
    current_temp: float,
    net_heat_watts: float,
    capacitance_j_k: float,
    timestep_seconds: float = 3600.0
) -> float:
    """
    Updates indoor temperature based on dynamic energy balance using explicit integration:
    T_next = T_current + (Q_net * dt) / C_eff
    """
    delta_t = (net_heat_watts * timestep_seconds) / capacitance_j_k
    return current_temp + delta_t
