import React, { useState } from 'react';
import { OptimizationRequest } from '../../types/optimization';
import { Location, Material } from '../../types/shelter';
import { Sliders, Sparkles, MapPin, Calculator, ShieldCheck } from 'lucide-react';

interface Props {
  locations: Location[];
  materials: Material[];
  onSubmit: (req: OptimizationRequest) => void;
  onLoadDemo: () => void;
  isLoading?: boolean;
}

const OptimizationForm: React.FC<Props> = ({ locations, materials, onSubmit, onLoadDemo, isLoading }) => {
  const [formData, setFormData] = useState<OptimizationRequest>({
    location_id: 'leh',
    purpose: 'agricultural',
    min_area: 20,
    max_area: 30,
    max_budget: 150000,
    available_materials: ['brick', 'stone', 'wood', 'concrete', 'mineral_wool', 'eps'],
    priority: 'comfort',
    weight_comfort: 0.50,
    weight_heat_loss: 0.20,
    weight_cost: 0.20,
    weight_solar: 0.10,
  });

  const handleMaterialToggle = (matId: string) => {
    const current = formData.available_materials;
    if (current.includes(matId)) {
      setFormData({ ...formData, available_materials: current.filter((id) => id !== matId) });
    } else {
      setFormData({ ...formData, available_materials: [...current, matId] });
    }
  };

  const handlePriorityChange = (p: string) => {
    let wComfort = 0.40, wLoss = 0.25, wCost = 0.25, wSolar = 0.10;
    if (p === 'comfort') { wComfort = 0.70; wLoss = 0.15; wCost = 0.10; wSolar = 0.05; }
    else if (p === 'min_cost') { wComfort = 0.20; wLoss = 0.10; wCost = 0.65; wSolar = 0.05; }
    else if (p === 'min_heat_loss') { wComfort = 0.20; wLoss = 0.65; wCost = 0.10; wSolar = 0.05; }
    else if (p === 'max_solar') { wComfort = 0.20; wLoss = 0.10; wCost = 0.10; wSolar = 0.60; }

    setFormData({
      ...formData,
      priority: p,
      weight_comfort: wComfort,
      weight_heat_loss: wLoss,
      weight_cost: wCost,
      weight_solar: wSolar,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            MODE B – Dynamic Shelter Optimizer
          </h2>
          <p className="text-xs text-slate-400">Set high-level shelter requirements & budget constraints. The system searches candidate designs automatically.</p>
        </div>
        <button
          type="button"
          onClick={onLoadDemo}
          className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Load Demo Preset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Selector */}
        <div>
          <label className="text-xs font-semibold uppercase text-slate-400 block mb-2 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-cyan-400" /> Target Location
          </label>
          <select
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            value={formData.location_id}
            onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.elevation ? `${loc.elevation}m` : 'High Altitude'})
              </option>
            ))}
          </select>
        </div>

        {/* Shelter Purpose */}
        <div>
          <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">Shelter Purpose</label>
          <select
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          >
            <option value="agricultural">Agricultural Shelter</option>
            <option value="livestock">Livestock Shelter</option>
            <option value="worker">Worker Shelter</option>
            <option value="storage">Storage Shelter</option>
            <option value="community">Community Shelter</option>
            <option value="emergency">Emergency Shelter</option>
            <option value="custom">Custom Shelter</option>
          </select>
        </div>

        {/* Target Floor Area */}
        <div>
          <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">Required Floor Area (m²)</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={10}
              max={150}
              className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              value={formData.min_area}
              onChange={(e) => setFormData({ ...formData, min_area: Number(e.target.value) })}
            />
            <span className="text-xs text-slate-500">to</span>
            <input
              type="number"
              min={10}
              max={150}
              className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              value={formData.max_area}
              onChange={(e) => setFormData({ ...formData, max_area: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Construction Budget */}
        <div>
          <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">Max Construction Budget (INR ₹)</label>
          <input
            type="number"
            step={5000}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            value={formData.max_budget}
            onChange={(e) => setFormData({ ...formData, max_budget: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* Available Local Materials */}
      <div>
        <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">Available Local Materials</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {materials.map((mat) => {
            const isChecked = formData.available_materials.includes(mat.id);
            return (
              <label
                key={mat.id}
                onClick={() => handleMaterialToggle(mat.id)}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-medium'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input type="checkbox" checked={isChecked} readOnly className="accent-amber-500 rounded" />
                <span>{mat.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Desired Objective Priority */}
      <div>
        <label className="text-xs font-semibold uppercase text-slate-400 block mb-2 flex items-center gap-1">
          <Sliders className="w-4 h-4 text-purple-400" /> Optimization Priority
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          {[
            { id: 'comfort', label: 'Max Comfort' },
            { id: 'min_heat_loss', label: 'Min Heat Loss' },
            { id: 'min_cost', label: 'Lowest Cost' },
            { id: 'max_solar', label: 'Max Solar' },
            { id: 'balanced', label: 'Balanced' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePriorityChange(p.id)}
              className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                formData.priority === p.id
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500 text-amber-300 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              Optimizing candidate designs...
            </span>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              Search & Optimize Area-Specific Shelter Design
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default OptimizationForm;
