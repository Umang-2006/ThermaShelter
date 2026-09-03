import axios from 'axios';
import { Material, Location, ClimateProfile, ShelterDesign } from '../types/shelter';
import { SimulationResult, SimulationRequest } from '../types/simulation';
import { OptimizationRequest, OptimizationResult, ComparisonResult, WhatIfRequest, WhatIfResult, SensitivityResult } from '../types/optimization';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const getMaterials = async (): Promise<Material[]> => {
  try {
    const res = await api.get('/materials');
    return res.data;
  } catch (error) {
    console.warn('API offline - returning bundled material database');
    return [
      { id: 'brick', name: 'Standard Red Brick', thermal_conductivity: 0.72, density: 1920, specific_heat: 840, solar_absorptance: 0.65, emissivity: 0.90, estimated_cost_per_m3: 6500, category: 'structural' },
      { id: 'concrete', name: 'Reinforced Concrete', thermal_conductivity: 1.40, density: 2400, specific_heat: 880, solar_absorptance: 0.60, emissivity: 0.88, estimated_cost_per_m3: 7800, category: 'structural' },
      { id: 'stone', name: 'Local High-Altitude Stone', thermal_conductivity: 2.20, density: 2600, specific_heat: 790, solar_absorptance: 0.70, emissivity: 0.90, estimated_cost_per_m3: 4500, category: 'structural' },
      { id: 'adobe', name: 'Mud / Adobe Block', thermal_conductivity: 0.46, density: 1700, specific_heat: 1000, solar_absorptance: 0.55, emissivity: 0.92, estimated_cost_per_m3: 2800, category: 'structural' },
      { id: 'wood', name: 'Timber / Pine Wood', thermal_conductivity: 0.13, density: 500, specific_heat: 2400, solar_absorptance: 0.45, emissivity: 0.85, estimated_cost_per_m3: 18000, category: 'structural' },
      { id: 'mineral_wool', name: 'Mineral Wool Insulation', thermal_conductivity: 0.038, density: 50, specific_heat: 840, solar_absorptance: 0.30, emissivity: 0.90, estimated_cost_per_m3: 5200, category: 'insulation' },
      { id: 'eps', name: 'Expanded Polystyrene (EPS)', thermal_conductivity: 0.035, density: 25, specific_heat: 1400, solar_absorptance: 0.25, emissivity: 0.90, estimated_cost_per_m3: 4200, category: 'insulation' },
      { id: 'xps', name: 'Extruded Polystyrene (XPS)', thermal_conductivity: 0.030, density: 35, specific_heat: 1400, solar_absorptance: 0.20, emissivity: 0.90, estimated_cost_per_m3: 6800, category: 'insulation' },
      { id: 'straw', name: 'Straw Bale Insulation', thermal_conductivity: 0.060, density: 100, specific_heat: 1300, solar_absorptance: 0.40, emissivity: 0.90, estimated_cost_per_m3: 1800, category: 'insulation' },
      { id: 'glass_double', name: 'Double Glazed Low-E Glass', thermal_conductivity: 0.15, density: 2500, specific_heat: 840, solar_absorptance: 0.15, emissivity: 0.84, estimated_cost_per_m3: 25000, category: 'glazing' }
    ];
  }
};

export const getLocations = async (): Promise<Location[]> => {
  try {
    const res = await api.get('/locations');
    return res.data;
  } catch (error) {
    return [
      { id: 'leh', name: 'Leh, Ladakh', latitude: 34.1526, longitude: 77.5771, elevation: 3500, region: 'Ladakh Cold Desert', description: 'High altitude cold desert with sub-zero winter temperatures, intense solar radiation during clear days, and extreme diurnal variation.' },
      { id: 'kargil', name: 'Kargil, Ladakh', latitude: 34.5539, longitude: 76.1349, elevation: 2676, region: 'Ladakh River Valley', description: 'Trans-Himalayan valley region with heavy winter snow, severe cold snaps down to -20°C.' },
      { id: 'drass', name: 'Drass, Ladakh', latitude: 34.4294, longitude: 75.7513, elevation: 3280, region: 'Sub-Arctic Zone', description: 'Second coldest inhabited place in the world with severe heat loss conditions.' },
      { id: 'nubra', name: 'Nubra Valley, Ladakh', latitude: 34.6863, longitude: 77.5673, elevation: 3048, region: 'High Altitude Valley', description: 'Cold desert valley surrounded by high mountains.' },
      { id: 'changthang', name: 'Changthang Plateau, Ladakh', latitude: 33.4000, longitude: 78.5000, elevation: 4500, region: 'High Tibetan Plateau', description: 'Ultra-high altitude plateau with severe gale-force winds and intense solar radiation.' }
    ];
  }
};

export const getClimate = async (locationId: string): Promise<ClimateProfile | null> => {
  try {
    const res = await api.get(`/climate/${locationId}`);
    return res.data;
  } catch (error) {
    console.error('Failed to get climate profile', error);
    return null;
  }
};

export const simulateDesign = async (req: SimulationRequest): Promise<SimulationResult | null> => {
  try {
    const res = await api.post('/simulate', req);
    return res.data;
  } catch (error) {
    console.error('Simulation failed', error);
    return null;
  }
};

export const optimizeDesign = async (req: OptimizationRequest): Promise<OptimizationResult | null> => {
  try {
    const res = await api.post('/optimize', req);
    return res.data;
  } catch (error) {
    console.error('Optimization failed', error);
    return null;
  }
};

export const compareDesigns = async (locationId: string, designs: ShelterDesign[], labels?: string[]): Promise<ComparisonResult | null> => {
  try {
    const res = await api.post('/compare', { location_id: locationId, designs, labels });
    return res.data;
  } catch (error) {
    console.error('Comparison failed', error);
    return null;
  }
};

export const runWhatIf = async (req: WhatIfRequest): Promise<WhatIfResult | null> => {
  try {
    const res = await api.post('/what-if', req);
    return res.data;
  } catch (error) {
    console.error('What-if failed', error);
    return null;
  }
};

export const getSensitivity = async (locationId: string, design: ShelterDesign): Promise<SensitivityResult[]> => {
  try {
    const res = await api.post('/sensitivity', { location_id: locationId, design });
    return res.data;
  } catch (error) {
    console.error('Sensitivity analysis failed', error);
    return [];
  }
};
