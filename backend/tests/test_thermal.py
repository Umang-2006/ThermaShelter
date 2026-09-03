from app.thermal.materials import get_materials_db, calculate_layer_r_value, calculate_composite_u_value
from app.thermal.conduction import calculate_conductive_heat_flow
from app.thermal.solar import get_orientation_solar_factor, calculate_window_solar_gain

def test_materials_database_loading():
    """Test loading materials from JSON dataset."""
    db = get_materials_db()
    assert "brick" in db
    assert "mineral_wool" in db
    assert db["brick"].thermal_conductivity > 0.5
    assert db["mineral_wool"].thermal_conductivity < 0.05

def test_thermal_resistance_r_value():
    """Test R-value calculation (R = thickness / k)."""
    r_brick = calculate_layer_r_value(0.23, 0.72)
    assert abs(r_brick - (0.23 / 0.72)) < 1e-4

def test_composite_u_value():
    """Test composite U-value calculation with surface resistances."""
    db = get_materials_db()
    brick = db["brick"]
    insul = db["mineral_wool"]
    
    layers = [(brick, 0.23), (insul, 0.10)]
    u_val = calculate_composite_u_value(layers)
    
    expected_r = 0.13 + (0.23 / 0.72) + (0.10 / 0.038) + 0.04
    expected_u = 1.0 / expected_r
    assert abs(u_val - expected_u) < 1e-4

def test_conductive_heat_flow():
    """Test Q_cond = U * A * delta_T."""
    q_loss = calculate_conductive_heat_flow(u_value=0.5, area=20.0, temp_inside=20.0, temp_outside=0.0)
    assert q_loss == 200.0  # 0.5 * 20.0 * 20.0 = 200 Watts

def test_orientation_solar_factor():
    """Test South vs North orientation solar factors."""
    factor_south = get_orientation_solar_factor(12, 180.0)  # Midday South
    factor_north = get_orientation_solar_factor(12, 0.0)    # Midday North
    assert factor_south > factor_north
