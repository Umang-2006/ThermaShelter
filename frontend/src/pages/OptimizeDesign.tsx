import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import OptimizationForm from '../components/forms/OptimizationForm';
import RecommendationCard from '../components/display/RecommendationCard';
import ExplanationPanel from '../components/display/ExplanationPanel';
import MetricCard from '../components/display/MetricCard';
import TemperatureChart from '../components/charts/TemperatureChart';
import HeatFlowChart from '../components/charts/HeatFlowChart';
import SolarChart from '../components/charts/SolarChart';
import Shelter3D from '../components/visualization/Shelter3D';
import { OptimizationRequest, OptimizationResult, DesignRecommendation, WhatIfResult } from '../types/optimization';
import { Location, Material } from '../types/shelter';
import { optimizeDesign, getLocations, getMaterials, runWhatIf } from '../services/api';
import { ShieldCheck, Flame, Sun, DollarSign, Thermometer, Loader2, Sparkles, RefreshCw, Sliders } from 'lucide-react';

const OptimizeDesign: React.FC = () => {
  const locationState = useLocation().state as { loadDemo?: boolean } | null;
  const [locations, setLocations] = useState<Location[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [selectedDesignIndex, setSelectedDesignIndex] = useState<number>(0);

  // What-If State
  const [whatIfLoading, setWhatIfLoading] = useState<boolean>(false);
  const [whatIfInsulation, setWhatIfInsulation] = useState<number>(0.10);
  const [whatIfResult, setWhatIfResult] = useState<WhatIfResult | null>(null);

  const steps = [
    'Analyzing regional climate & solar radiation data...',
    'Generating 100+ candidate shelter geometries & material combinations...',
    'Running dynamic 24-hour dynamic heat-balance physics simulations...',
    'Evaluating hourly thermal comfort thresholds (18°C–27°C)...',
    'Applying construction budget constraints & cost optimization...',
    'Selecting Top 5 Pareto-efficient designs...',
  ];

  useEffect(() => {
    getLocations().then(setLocations);
    getMaterials().then(setMaterials);

    if (locationState?.loadDemo) {
      handleDemoOptimization();
    }
  }, [locationState]);

  const handleDemoOptimization = () => {
    handleOptimize({
      location_id: 'leh',
      purpose: 'agricultural',
      min_area: 20,
      max_area: 30,
      max_budget: 150000,
      available_materials: ['brick', 'stone', 'wood', 'concrete', 'mineral_wool', 'eps'],
      priority: 'comfort',
      weight_comfort: 0.5,
      weight_heat_loss: 0.2,
      weight_cost: 0.2,
      weight_solar: 0.1,
    });
  };

  const handleOptimize = async (req: OptimizationRequest) => {
    setLoading(true);
    setProgressStep(0);
    setResult(null);

    const stepInterval = setInterval(() => {
      setProgressStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 400);

    const res = await optimizeDesign(req);

    clearInterval(stepInterval);
    if (res) {
      setResult(res);
      setSelectedDesignIndex(0);
      setWhatIfInsulation(res.recommended_design.design.insulation_thickness);
    }
    setLoading(false);
  };

  const handleRunWhatIf = async (newThickness: number) => {
    if (!result) return;
    setWhatIfLoading(true);
    const activeDesign = result.top_designs[selectedDesignIndex].design;

    const res = await runWhatIf({
      location_id: result.climate_location.toLowerCase().includes('kargil') ? 'kargil' : 'leh',
      base_design: activeDesign,
      parameter: 'insulation_thickness',
      new_value: newThickness,
    });

    if (res) {
      setWhatIfResult(res);
    }
    setWhatIfLoading(false);
  };

  const activeRecommendation: DesignRecommendation | undefined = result?.top_designs[selectedDesignIndex];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 mb-2">MODE B – Smart Design Optimization</h1>
        <p className="text-slate-400 text-sm">
          Enter high-level requirements and budget constraints. The system automatically searches candidate designs to recommend area-specific shelters.
        </p>
      </div>

      {!result && !loading && (
        <OptimizationForm
          locations={locations}
          materials={materials}
          onSubmit={handleOptimize}
          onLoadDemo={handleDemoOptimization}
          isLoading={loading}
        />
      )}

      {loading && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-2xl">
          <Loader2 className="w-16 h-16 text-amber-400 animate-spin mb-6" />
          <h3 className="text-lg font-bold text-slate-100 mb-2">{steps[progressStep]}</h3>
          <div className="w-72 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 ease-out"
              style={{ width: `${((progressStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-4">Evaluating heat conduction, solar radiation, and thermal inertia...</p>
        </div>
      )}

      {result && activeRecommendation && !loading && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">Optimization Complete</span>
              <h2 className="text-xl font-bold text-slate-100">
                Evaluated {result.total_searched} Candidate Designs for {result.climate_location}
              </h2>
            </div>
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all shrink-0"
            >
              <RefreshCw className="w-4 h-4" /> Reset & Search Again
            </button>
          </div>

          {/* Top 5 Recommendation Cards Selector */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Top 5 Recommended Designs</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {result.top_designs.map((rec, idx) => (
                <RecommendationCard
                  key={idx}
                  recommendation={rec}
                  isSelected={idx === selectedDesignIndex}
                  onSelect={() => {
                    setSelectedDesignIndex(idx);
                    setWhatIfInsulation(rec.design.insulation_thickness);
                    setWhatIfResult(null);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Active Selected Design Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard
                  label="Thermal Score"
                  value={`${activeRecommendation.simulation_result.summary.thermal_score}/100`}
                  subValue={`${activeRecommendation.simulation_result.summary.comfort_percentage}% Comfort`}
                  icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
                  color="emerald"
                />
                <MetricCard
                  label="Average Temp"
                  value={`${activeRecommendation.simulation_result.summary.average_temperature}°C`}
                  subValue={`Min: ${activeRecommendation.simulation_result.summary.min_temperature}°C`}
                  icon={<Thermometer className="w-5 h-5 text-amber-400" />}
                  color="amber"
                />
                <MetricCard
                  label="Heat Loss"
                  value={`${activeRecommendation.simulation_result.summary.heat_loss_kwh} kWh`}
                  subValue={`U: ${activeRecommendation.simulation_result.summary.wall_u_value} W/m²K`}
                  icon={<Flame className="w-5 h-5 text-orange-400" />}
                  color="orange"
                />
                <MetricCard
                  label="Est. Cost"
                  value={`₹${(activeRecommendation.simulation_result.summary.estimated_cost / 100000).toFixed(2)} L`}
                  subValue={`Area: ${activeRecommendation.simulation_result.summary.floor_area} m²`}
                  icon={<DollarSign className="w-5 h-5 text-cyan-400" />}
                  color="cyan"
                />
              </div>

              {/* 3D Shelter Visualization */}
              <div className="h-80 w-full">
                <Shelter3D design={activeRecommendation.design} />
              </div>

              {/* Temperature Curve */}
              <TemperatureChart hourly={activeRecommendation.simulation_result.hourly} />

              {/* Heat Flow Chart */}
              <HeatFlowChart hourly={activeRecommendation.simulation_result.hourly} />

              {/* Solar Radiation Chart */}
              <SolarChart hourly={activeRecommendation.simulation_result.hourly} />
            </div>

            <div className="lg:col-span-5 space-y-6">
              {/* "Why This Design?" Explanation Panel */}
              <ExplanationPanel explanations={activeRecommendation.why_explanation} designName={activeRecommendation.category} />

              {/* What-If Interactive Analysis Box */}
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">WHAT-IF SENSITIVITY TEST</h3>
                    <p className="text-xs text-slate-400">Perturb insulation thickness live and observe physical temperature reaction.</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
                    <span>Insulation Thickness</span>
                    <span className="font-bold text-amber-400">{Math.round(whatIfInsulation * 100)} cm</span>
                  </div>
                  <input
                    type="range"
                    min={0.02}
                    max={0.25}
                    step={0.01}
                    value={whatIfInsulation}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setWhatIfInsulation(val);
                      handleRunWhatIf(val);
                    }}
                    className="w-full accent-amber-500 bg-slate-950 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>2 cm (Thin)</span>
                    <span>10 cm (Standard)</span>
                    <span>25 cm (Ultra)</span>
                  </div>
                </div>

                {whatIfLoading && (
                  <div className="text-xs text-slate-400 flex items-center gap-2 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Calculating What-If impact...
                  </div>
                )}

                {whatIfResult && !whatIfLoading && (
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2 animate-in fade-in">
                    <span className="text-xs font-semibold text-cyan-400 block">Immediate Perturbation Impact:</span>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {whatIfResult.impact_bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizeDesign;
