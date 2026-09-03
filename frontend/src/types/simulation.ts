import { ShelterDesign } from './shelter';

export interface HourlySimulationStep {
  hour: number;
  outside_temperature: number;
  inside_temperature: number;
  solar_radiation: number;
  solar_gain: number;
  wall_loss: number;
  roof_loss: number;
  floor_loss: number;
  window_loss: number;
  door_loss: number;
  ventilation_loss: number;
  net_heat: number;
}

export interface SimulationSummary {
  average_temperature: number;
  min_temperature: number;
  max_temperature: number;
  comfort_hours: number;
  total_simulation_hours: number;
  comfort_percentage: number;
  solar_gain_kwh: number;
  heat_loss_kwh: number;
  net_heat_kwh: number;
  estimated_cost: number;
  thermal_score: number;
  wall_u_value: number;
  roof_u_value: number;
  floor_area: number;
  volume: number;
  heat_loss_breakdown: Record<string, number>;
}

export interface SimulationResult {
  hourly: HourlySimulationStep[];
  summary: SimulationSummary;
  design: ShelterDesign;
}

export interface SimulationRequest {
  location_id: string;
  design: ShelterDesign;
  simulation_days?: number;
  initial_indoor_offset?: number;
  comfort_min?: number;
  comfort_max?: number;
}
