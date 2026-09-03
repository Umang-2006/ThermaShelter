from typing import Dict

def calculate_conductive_heat_flow(u_value: float, area: float, temp_inside: float, temp_outside: float) -> float:
    """
    Calculates conductive heat loss (or gain) rate in Watts.
    Q_cond = U * A * (T_inside - T_outside)
    Positive value indicates net heat loss from shelter to outside.
    """
    if area <= 0 or u_value <= 0:
        return 0.0
    return u_value * area * (temp_inside - temp_outside)

def calculate_envelope_conduction(
    net_wall_area: float,
    wall_u: float,
    roof_area: float,
    roof_u: float,
    floor_area: float,
    floor_u: float,
    window_area: float,
    window_u: float,
    door_area: float,
    door_u: float,
    temp_inside: float,
    temp_outside: float
) -> Dict[str, float]:
    """
    Calculates conductive heat losses in Watts across all individual shelter components.
    """
    wall_loss = calculate_conductive_heat_flow(wall_u, net_wall_area, temp_inside, temp_outside)
    roof_loss = calculate_conductive_heat_flow(roof_u, roof_area, temp_inside, temp_outside)
    floor_loss = calculate_conductive_heat_flow(floor_u, floor_area, temp_inside, temp_outside)
    window_loss = calculate_conductive_heat_flow(window_u, window_area, temp_inside, temp_outside)
    door_loss = calculate_conductive_heat_flow(door_u, door_area, temp_inside, temp_outside)
    
    total_conduction = wall_loss + roof_loss + floor_loss + window_loss + door_loss
    
    return {
        "wall_loss": wall_loss,
        "roof_loss": roof_loss,
        "floor_loss": floor_loss,
        "window_loss": window_loss,
        "door_loss": door_loss,
        "total_conduction_loss": total_conduction
    }
