from typing import List, Dict

def evaluate_thermal_comfort(
    indoor_temperatures: List[float],
    outdoor_temperatures: List[float],
    total_heat_loss_kwh: float,
    total_solar_gain_kwh: float,
    comfort_min: float = 18.0,
    comfort_max: float = 27.0
) -> Dict[str, float]:
    """
    Evaluates thermal comfort statistics and computes a transparent performance score (0-100).
    """
    total_hours = len(indoor_temperatures)
    if total_hours == 0:
        return {
            "comfort_hours": 0.0,
            "comfort_percentage": 0.0,
            "average_temperature": 0.0,
            "min_temperature": 0.0,
            "max_temperature": 0.0,
            "thermal_score": 0.0
        }
    
    comfort_hours = sum(1 for t in indoor_temperatures if comfort_min <= t <= comfort_max)
    comfort_percentage = (comfort_hours / total_hours) * 100.0
    
    avg_temp = sum(indoor_temperatures) / total_hours
    min_temp = min(indoor_temperatures)
    max_temp = max(indoor_temperatures)
    
    # 1. Comfort ratio score (50% weight)
    score_comfort = (comfort_hours / total_hours) * 50.0
    
    # 2. Temperature buffer score (30% weight) - rewarding higher indoor temperature elevation above freezing cold outside
    avg_outdoor = sum(outdoor_temperatures) / total_hours
    temp_elevation = max(0.0, avg_temp - avg_outdoor)
    score_temp = min(30.0, (temp_elevation / 25.0) * 30.0)
    
    # 3. Solar utilization ratio (20% weight) - solar gain offset of heat loss
    solar_ratio = (total_solar_gain_kwh / (total_heat_loss_kwh + 0.1)) if total_heat_loss_kwh > 0 else 1.0
    score_solar = min(20.0, solar_ratio * 20.0)
    
    thermal_score = round(score_comfort + score_temp + score_solar, 1)
    thermal_score = max(0.0, min(100.0, thermal_score))
    
    return {
        "comfort_hours": float(round(comfort_hours, 1)),
        "comfort_percentage": float(round(comfort_percentage, 1)),
        "average_temperature": float(round(avg_temp, 1)),
        "min_temperature": float(round(min_temp, 1)),
        "max_temperature": float(round(max_temp, 1)),
        "thermal_score": float(thermal_score)
    }
