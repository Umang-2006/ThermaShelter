from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union

class Material(BaseModel):
    id: str
    name: str
    thermal_conductivity: float = Field(..., description="W/m.K")
    density: float = Field(..., description="kg/m^3")
    specific_heat: float = Field(..., description="J/kg.K")
    solar_absorptance: float = Field(0.6, description="0 to 1 fraction")
    emissivity: float = Field(0.9, description="0 to 1 fraction")
    estimated_cost_per_m3: float = Field(..., description="Cost in INR per m^3")
    category: str = Field("structural", description="structural, insulation, glazing, thermal_mass")

class Location(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    elevation: Optional[float] = None
    region: Optional[str] = "Ladakh"
    description: Optional[str] = None

class HourlyClimate(BaseModel):
    hour: int
    temperature: float = Field(..., description="Outdoor ambient temp in °C")
    solar_radiation: float = Field(..., description="Global solar radiation in W/m^2")
    humidity: float = Field(50.0, description="Relative humidity %")
    wind_speed: float = Field(2.0, description="Wind speed in m/s")

class ClimateProfile(BaseModel):
    location_id: str
    location_name: str
    season: str = "Winter"
    hourly_data: List[HourlyClimate]

class Layer(BaseModel):
    material_id: str
    thickness: float = Field(..., gt=0, description="Thickness in meters")

class ShelterDesign(BaseModel):
    name: Optional[str] = "Custom Shelter Design"
    length: float = Field(6.0, gt=0, description="Length in meters")
    width: float = Field(4.0, gt=0, description="Width in meters")
    height: float = Field(3.0, gt=0, description="Height in meters")
    orientation: float = Field(180.0, ge=0, le=360, description="0=North, 90=East, 180=South, 270=West")
    
    wall_material_id: str = Field("brick", description="Primary wall material")
    wall_thickness: float = Field(0.23, gt=0, description="Wall thickness in meters")
    
    roof_material_id: str = Field("concrete", description="Primary roof material")
    roof_thickness: float = Field(0.15, gt=0, description="Roof thickness in meters")
    roof_type: str = Field("sloped", description="flat or sloped")
    
    floor_material_id: str = Field("concrete", description="Primary floor material")
    floor_thickness: float = Field(0.15, gt=0, description="Floor thickness in meters")
    
    insulation_material_id: str = Field("mineral_wool", description="Insulation material")
    insulation_thickness: float = Field(0.10, ge=0, description="Insulation thickness in meters")
    
    window_area: float = Field(4.0, ge=0, description="Total window area in m^2")
    window_orientation: float = Field(180.0, ge=0, le=360, description="Glazing orientation")
    window_glazing_type: str = Field("double_pane", description="single_pane, double_pane, triple_pane")
    
    door_area: float = Field(2.0, ge=0, description="Total door area in m^2")
    thermal_mass_kg: float = Field(1500.0, ge=0, description="Additional thermal mass in kg")
    thermal_mass_material_id: str = Field("stone", description="Thermal mass material ID")
    
    ach: float = Field(0.5, ge=0.1, le=10.0, description="Air changes per hour")

class SimulationRequest(BaseModel):
    location_id: str
    design: ShelterDesign
    simulation_days: int = Field(1, ge=1, le=7)
    initial_indoor_offset: float = Field(0.0, description="Initial T_indoor - T_outdoor offset")
    comfort_min: float = Field(18.0, description="Lower comfort threshold in °C")
    comfort_max: float = Field(27.0, description="Upper comfort threshold in °C")

class HourlySimulationStep(BaseModel):
    hour: int
    outside_temperature: float
    inside_temperature: float
    solar_radiation: float
    solar_gain: float
    wall_loss: float
    roof_loss: float
    floor_loss: float
    window_loss: float
    door_loss: float
    ventilation_loss: float
    net_heat: float

class SimulationSummary(BaseModel):
    average_temperature: float
    min_temperature: float
    max_temperature: float
    comfort_hours: float
    total_simulation_hours: int
    comfort_percentage: float
    solar_gain_kwh: float
    heat_loss_kwh: float
    net_heat_kwh: float
    estimated_cost: float
    thermal_score: float
    wall_u_value: float
    roof_u_value: float
    floor_area: float
    volume: float
    heat_loss_breakdown: Dict[str, float]

class SimulationResult(BaseModel):
    hourly: List[HourlySimulationStep]
    summary: SimulationSummary
    design: ShelterDesign

class OptimizationRequest(BaseModel):
    location_id: str = "leh"
    purpose: str = Field("agricultural", description="agricultural, livestock, worker, storage, community, emergency, custom")
    min_area: float = Field(20.0, ge=5.0)
    max_area: float = Field(30.0, le=200.0)
    max_budget: float = Field(150000.0, gt=0)
    available_materials: List[str] = Field(default_factory=list)
    priority: str = Field("balanced", description="comfort, heat_loss, cost, solar, balanced")
    weight_comfort: float = Field(0.50, ge=0, le=1.0)
    weight_heat_loss: float = Field(0.20, ge=0, le=1.0)
    weight_cost: float = Field(0.20, ge=0, le=1.0)
    weight_solar: float = Field(0.10, ge=0, le=1.0)
    comfort_min: float = Field(18.0)
    comfort_max: float = Field(27.0)

class DesignRecommendation(BaseModel):
    rank: int
    category: str
    design: ShelterDesign
    simulation_result: SimulationResult
    why_explanation: List[str]

class OptimizationResult(BaseModel):
    recommended_design: DesignRecommendation
    top_designs: List[DesignRecommendation]
    total_searched: int
    climate_location: str

class ComparisonRequest(BaseModel):
    location_id: str
    designs: List[ShelterDesign]
    labels: Optional[List[str]] = None

class ComparisonItem(BaseModel):
    label: str
    design: ShelterDesign
    simulation_result: SimulationResult

class ComparisonResult(BaseModel):
    items: List[ComparisonItem]

class WhatIfRequest(BaseModel):
    location_id: str
    base_design: ShelterDesign
    parameter: str
    new_value: Any

class WhatIfResult(BaseModel):
    parameter_changed: str
    old_value: Any
    new_value: Any
    original_result: SimulationResult
    new_result: SimulationResult
    delta_summary: Dict[str, float]
    impact_bullets: List[str]

class SensitivityResult(BaseModel):
    parameter: str
    sensitivity_score: float
    impact_description: str

class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None

