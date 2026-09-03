from app.models.schemas import ShelterDesign
from app.thermal.simulator import run_thermal_simulation
from app.optimization.optimizer import get_climate_profile, run_optimization

def test_full_24h_thermal_simulation():
    """Test dynamic 24h dynamic thermal simulation for Leh climate profile."""
    climate = get_climate_profile("leh")
    design = ShelterDesign(
        length=6.0,
        width=4.0,
        height=3.0,
        orientation=180.0,
        wall_material_id="brick",
        wall_thickness=0.23,
        roof_material_id="concrete",
        roof_thickness=0.15,
        roof_type="sloped",
        floor_material_id="concrete",
        floor_thickness=0.15,
        insulation_material_id="mineral_wool",
        insulation_thickness=0.10,
        window_area=4.0,
        window_orientation=180.0,
        door_area=2.0,
        thermal_mass_kg=1500.0,
        ach=0.5
    )
    
    result = run_thermal_simulation(design=design, climate=climate)
    
    assert len(result.hourly) == 24
    assert result.summary.average_temperature > climate.hourly_data[5].temperature
    assert result.summary.comfort_hours >= 0.0
    assert result.summary.estimated_cost > 0.0
    assert result.summary.wall_u_value < 0.5  # Insulated wall U-value check

def test_insulation_impact():
    """Sanity check: Increasing insulation thickness should reduce overall heat loss."""
    climate = get_climate_profile("leh")
    base_design = ShelterDesign(insulation_thickness=0.02)
    insulated_design = ShelterDesign(insulation_thickness=0.12)
    
    res_base = run_thermal_simulation(design=base_design, climate=climate)
    res_insul = run_thermal_simulation(design=insulated_design, climate=climate)
    
    assert res_insul.summary.heat_loss_kwh < res_base.summary.heat_loss_kwh

def test_thermal_mass_damping():
    """Sanity check: Higher thermal mass should reduce diurnal indoor temperature min/max spread."""
    climate = get_climate_profile("leh")
    low_mass = ShelterDesign(thermal_mass_kg=100.0)
    high_mass = ShelterDesign(thermal_mass_kg=4000.0)
    
    res_low = run_thermal_simulation(design=low_mass, climate=climate)
    res_high = run_thermal_simulation(design=high_mass, climate=climate)
    
    spread_low = res_low.summary.max_temperature - res_low.summary.min_temperature
    spread_high = res_high.summary.max_temperature - res_high.summary.min_temperature
    
    assert spread_high <= spread_low
