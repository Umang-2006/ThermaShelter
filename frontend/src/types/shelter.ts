export interface Material {
  id: string;
  name: string;
  thermal_conductivity: number;
  density: number;
  specific_heat: number;
  solar_absorptance: number;
  emissivity: number;
  estimated_cost_per_m3: number;
  category: string;
}

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  region?: string;
  description?: string;
}

export interface HourlyClimate {
  hour: number;
  temperature: number;
  solar_radiation: number;
  humidity: number;
  wind_speed: number;
}

export interface ClimateProfile {
  location_id: string;
  location_name: string;
  season: string;
  hourly_data: HourlyClimate[];
}

export interface ShelterDesign {
  name?: string;
  length: number;
  width: number;
  height: number;
  orientation: number; // 0=North, 90=East, 180=South, 270=West
  wall_material_id: string;
  wall_thickness: number;
  roof_material_id: string;
  roof_thickness: number;
  roof_type: string; // 'flat' | 'sloped'
  floor_material_id: string;
  floor_thickness: number;
  insulation_material_id: string;
  insulation_thickness: number;
  window_area: number;
  window_orientation: number;
  window_glazing_type: string;
  door_area: number;
  thermal_mass_kg: number;
  thermal_mass_material_id: string;
  ach: number;
}
