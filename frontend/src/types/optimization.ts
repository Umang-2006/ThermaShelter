import { ShelterDesign } from './shelter';
import { SimulationResult } from './simulation';

export interface OptimizationRequest {
  location_id: string;
  purpose: string;
  min_area: number;
  max_area: number;
  max_budget: number;
  available_materials: string[];
  priority: string;
  weight_comfort: number;
  weight_heat_loss: number;
  weight_cost: number;
  weight_solar: number;
  comfort_min?: number;
  comfort_max?: number;
}

export interface DesignRecommendation {
  rank: number;
  category: string;
  design: ShelterDesign;
  simulation_result: SimulationResult;
  why_explanation: string[];
}

export interface OptimizationResult {
  recommended_design: DesignRecommendation;
  top_designs: DesignRecommendation[];
  total_searched: number;
  climate_location: string;
}

export interface ComparisonItem {
  label: string;
  design: ShelterDesign;
  simulation_result: SimulationResult;
}

export interface ComparisonResult {
  items: ComparisonItem[];
}

export interface WhatIfRequest {
  location_id: string;
  base_design: ShelterDesign;
  parameter: string;
  new_value: any;
}

export interface WhatIfResult {
  parameter_changed: string;
  old_value: any;
  new_value: any;
  original_result: SimulationResult;
  new_result: SimulationResult;
  delta_summary: Record<string, number>;
  impact_bullets: string[];
}

export interface SensitivityResult {
  parameter: string;
  sensitivity_score: number;
  impact_description: string;
}
