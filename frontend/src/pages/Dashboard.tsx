import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThermometerSun, Cpu, MapPin, Sparkles, ShieldCheck, Flame, Compass, ArrowRight, BookOpen } from 'lucide-react';
import { getLocations, getMaterials } from '../services/api';
import { Location, Material } from '../types/shelter';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    getLocations().then(setLocations);
    getMaterials().then(setMaterials);
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-8 md:p-12 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            DRDO-Inspired Thermal Comfort & Passive Shelter Optimization
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-100 mb-4 leading-tight">
            ThermaShelter – <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">Climate-Adaptive</span> Passive Shelter Designer
          </h1>

          <p className="text-base md:text-lg text-slate-300 mb-8 leading-relaxed font-normal">
            Software-based dynamic thermal model for designing area-specific shelters in high-altitude cold desert climates (Leh, Kargil, Drass, Nubra, Changthang). Calculates solar heat gain, conductive envelope losses, ventilation, and thermal inertia to recommend optimal low-cost passive designs.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => navigate('/optimize')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Cpu className="w-5 h-5" />
              MODE B – Optimize Shelter Design
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/analyze')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <ThermometerSun className="w-5 h-5 text-amber-400" />
              MODE A – Analyze Existing Design
            </button>
          </div>
        </div>
      </section>

      {/* Preset Demo Banner */}
      <section className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">Quick Start Hackathon Preset</div>
            <h3 className="text-lg font-bold text-slate-100">Leh Winter Agricultural Shelter</h3>
            <p className="text-xs text-slate-400">Location: Leh, Ladakh (3500m elevation) • Target Area: 24 m² • Budget: ₹1,50,000 • Purpose: Agricultural Storage</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/optimize', { state: { loadDemo: true } })}
          className="w-full md:w-auto px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 shrink-0 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Load Demo Preset & Optimize
        </button>
      </section>

      {/* Product Modes Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Lumped Heat-Balance Simulation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Stateful time-stepped thermal energy balance model calculating hourly conductive envelope losses, sol-air solar gain, air change ventilation, and dynamic thermal storage.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Multi-Objective Optimization</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Optuna multi-objective engine searching over geometry, orientation, local material combinations, insulation thickness, and openings subject to budget & size constraints.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Interactive 3D & Analytics</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            React Three Fiber procedural 3D model rendering dimensions, glazing cutouts, and orientation compass, paired with Recharts temperature and heat flow curves.
          </p>
        </div>
      </section>

      {/* Geographical & Materials Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" /> Supported Cold High-Altitude Regions
            </h3>
            <span className="text-xs text-slate-400 font-mono">{locations.length} Locations</span>
          </div>
          <div className="space-y-2">
            {locations.map((loc) => (
              <div key={loc.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200 block">{loc.name}</span>
                  <span className="text-slate-400">{loc.region}</span>
                </div>
                <span className="font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                  {loc.elevation ? `${loc.elevation}m` : '3500m'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Material Thermal Database
            </h3>
            <span className="text-xs text-slate-400 font-mono">{materials.length} Materials</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {materials.slice(0, 8).map((mat) => (
              <div key={mat.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                <span className="font-medium text-slate-200 block truncate">{mat.name}</span>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>k: {mat.thermal_conductivity} W/mK</span>
                  <span className="text-amber-400">₹{mat.estimated_cost_per_m3}/m³</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engineering Methodology Footer Banner */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-slate-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Prototype Disclaimer:</strong> Prototype thermal simulation based on dynamic lumped-parameter heat-balance physics — engineering approximation for design exploration, not a certified building-energy calculation.
          </span>
        </div>
        <Link to="/about" className="text-amber-400 hover:underline font-semibold shrink-0">
          View Methodology →
        </Link>
      </section>
    </div>
  );
};

export default Dashboard;
