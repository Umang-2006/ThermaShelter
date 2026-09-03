from app.thermal.geometry import (
    calculate_floor_area, calculate_volume, calculate_wall_areas,
    calculate_roof_area, get_net_areas
)

def test_floor_area_and_volume():
    """Test standard rectangle floor area and internal volume."""
    assert calculate_floor_area(6.0, 4.0) == 24.0
    assert calculate_volume(6.0, 4.0, 3.0) == 72.0

def test_wall_areas():
    """Test gross wall area breakdown."""
    walls = calculate_wall_areas(6.0, 4.0, 3.0)
    assert walls["north"] == 12.0
    assert walls["south"] == 12.0
    assert walls["east"] == 18.0
    assert walls["west"] == 18.0
    assert sum(walls.values()) == 60.0

def test_roof_area_types():
    """Test flat vs sloped roof surface area."""
    flat = calculate_roof_area(6.0, 4.0, "flat")
    sloped = calculate_roof_area(6.0, 4.0, "sloped")
    assert flat == 24.0
    assert sloped > flat

def test_net_areas_with_cutouts():
    """Test net wall area subtraction for window and door cutouts."""
    net = get_net_areas(
        length=6.0, width=4.0, height=3.0,
        roof_type="sloped", window_area=4.0, window_orientation=180.0, door_area=2.0
    )
    assert net["floor_area"] == 24.0
    assert net["volume"] == 72.0
    assert net["gross_wall_area"] == 60.0
    assert net["net_wall_area"] == 54.0  # 60 - 4 - 2 = 54
    assert net["window_area"] == 4.0
    assert net["door_area"] == 2.0
