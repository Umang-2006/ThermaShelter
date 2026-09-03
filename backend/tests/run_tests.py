import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from tests.test_geometry import test_floor_area_and_volume, test_wall_areas, test_roof_area_types, test_net_areas_with_cutouts
from tests.test_thermal import test_materials_database_loading, test_thermal_resistance_r_value, test_composite_u_value, test_conductive_heat_flow, test_orientation_solar_factor
from tests.test_simulation import test_full_24h_thermal_simulation, test_insulation_impact, test_thermal_mass_damping
from tests.test_api import test_root_endpoint, test_get_materials, test_get_locations, test_get_climate, test_simulate_endpoint, test_optimize_endpoint

def main():
    print("=" * 60)
    print("RUNNING THERMASHELTER BACKEND PHYSICS & API UNIT TESTS")
    print("=" * 60)

    tests = [
        ("Geometry: Floor Area & Volume", test_floor_area_and_volume),
        ("Geometry: Wall Areas", test_wall_areas),
        ("Geometry: Roof Types", test_roof_area_types),
        ("Geometry: Cutout Calculations", test_net_areas_with_cutouts),
        ("Thermal: Materials Database", test_materials_database_loading),
        ("Thermal: R-value", test_thermal_resistance_r_value),
        ("Thermal: Composite U-value", test_composite_u_value),
        ("Thermal: Conductive Heat Flow", test_conductive_heat_flow),
        ("Thermal: Solar Orientation Factor", test_orientation_solar_factor),
        ("Simulation: 24h Dynamic Simulation", test_full_24h_thermal_simulation),
        ("Simulation: Insulation Impact", test_insulation_impact),
        ("Simulation: Thermal Mass Damping", test_thermal_mass_damping),
        ("API: Root Endpoint", test_root_endpoint),
        ("API: Get Materials", test_get_materials),
        ("API: Get Locations", test_get_locations),
        ("API: Get Climate Dataset", test_get_climate),
        ("API: Dynamic Simulation Endpoint", test_simulate_endpoint),
        ("API: Design Optimization Endpoint", test_optimize_endpoint),
    ]

    passed = 0
    failed = 0

    for name, test_func in tests:
        try:
            test_func()
            print(f"  [PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {name}: {str(e)}")
            failed += 1

    print("=" * 60)
    print(f"TEST RESULTS SUMMARY: {passed} PASSED, {failed} FAILED")
    print("=" * 60)
    
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
