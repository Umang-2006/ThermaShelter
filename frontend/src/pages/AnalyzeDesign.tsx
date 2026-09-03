import React, { useState, useEffect } from 'react';
import ShelterForm from '../components/forms/ShelterForm';
import TemperatureChart from '../components/charts/TemperatureChart';
import HeatFlowChart from '../components/charts/HeatFlowChart';
import SolarChart from '../components/charts/SolarChart';
import MetricCard from '../components/display/MetricCard';
import Shelter3D from '../components/visualization/Shelter3D';
import { ShelterDesign, Location, Material } from '../types/shelter';
import { SimulationResult } from '../types/simulation';
import { simulateDesign, getLocations, getMaterials } from '../services/api';
import { ShieldCheck, Flame, Sun, DollarSign, Thermometer, Loader2, Info } from 'lucide-react';

const AnalyzeDesign: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    getLocations().then(setLocations);
    getMaterials().then(setMaterials);
  }, []);

  const handleSimulate = async (locationId: string, design: ShelterDesign) => {
    setLoading(true);
    const res = await simulateDesign({
      location_id: locationId,
      design,
      simulation_days: 1,
    });
    if (res) {
      setResult(res);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 mb-2">MODE A – Analyze Existing Design</h1>
        <p className="text-slate-400 text-sm">
          Simulates indoor temperature trajectories, solar radiation gains, conductive heat losses, and thermal comfort hours over 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <ShelterForm locations={locations} materials={materials} onSubmit={handleSimulate} isLoading={loading} />
        </div>

        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-xl min-h-[500px] flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <Thermometer className="w-12 h-12 mb-3 text-slate-700 animate-pulse" />
              <p className="text-base font-semibold text-slate-400 mb-1">No Simulation Active</p>
              <p className="text-xs text-slate-500 max-w-md">
                Configure your shelter geometry, wall materials, and insulation thickness in the form on the left, then click "Simulate Shelter Design".
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
              <p className="text-base font-semibold text-slate-200">Executing Dynamic Thermal Simulation...</p>
              <p className="text-xs text-slate-400 mt-1">Calculating hourly solar radiation, conduction, and ventilation balance...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard
                  label="Thermal Score"
                  value={`${result.summary.thermal_score}/100`}
                  subValue={`${result.summary.comfort_percentage}% Comfort`}
                  icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
                  color="emerald"
                />
                <MetricCard
                  label="Average Temp"
                  value={`${result.summary.average_temperature}°C`}
                  subValue={`Min: ${result.summary.min_temperature}°C | Max: ${result.summary.max_temperature}°C`}
                  icon={<Thermometer className="w-5 h-5 text-amber-400" />}
                  color="amber"
                />
                <MetricCard
                  label="Total Heat Loss"
                  value={`${result.summary.heat_loss_kwh} kWh`}
                  subValue={`Wall U: ${result.summary.wall_u_value} W/m²K`}
                  icon={<Flame className="w-5 h-5 text-orange-400" />}
                  color="orange"
                />
                <MetricCard
                  label="Est. Cost"
                  value={`₹${(result.summary.estimated_cost / 100000).toFixed(2)} L`}
                  subValue={`Area: ${result.summary.floor_area} m²`}
                  icon={<DollarSign className="w-5 h-5 text-cyan-400" />}
                  color="cyan"
                />
              </div>

              {/* 3D Shelter Visualization */}
              <div className="h-80 w-full">
                <Shelter3D design={result.design} />
              </div>

              {/* Temperature Curve Chart */}
              <TemperatureChart hourly={result.hourly} />

              {/* Heat Flow Rates Chart */}
              <HeatFlowChart hourly={result.hourly} />

              {/* Solar Radiation Chart */}
              <SolarChart hourly={result.hourly} />

              {/* Component Heat Loss Breakdown Table */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Conduction & Ventilation Loss Breakdown</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {Object.entries(result.summary.heat_loss_breakdown).map(([k, v]) => (
                    <div key={k} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-400 capitalize">{k.replace('_kwh', '').replace('_', ' ')}</span>
                      <span className="font-semibold text-slate-200">{v} kWh/day</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyzeDesign;
