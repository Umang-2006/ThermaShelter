import React, { useState, useEffect } from 'react';
import { ShelterDesign } from '../types/shelter';
import { ComparisonResult } from '../types/optimization';
import { compareDesigns } from '../services/api';
import { Layers, ShieldCheck, Flame, Sun, DollarSign, Sparkles, Check, ArrowRight } from 'lucide-react';
import TemperatureChart from '../components/charts/TemperatureChart';

const PRESET_SCENARIOS: { label: string; design: ShelterDesign }[] = [
  {
    label: 'Scenario 1: Poorly Insulated Shelter',
    design: {
      name: 'Uninsulated Metal / Thin Brick',
      length: 6.0,
      width: 4.0,
      height: 3.0,
      orientation: 0.0, // North facing window
      wall_material_id: 'brick',
      wall_thickness: 0.15,
      roof_material_id: 'concrete',
      roof_thickness: 0.10,
      roof_type: 'flat',
      floor_material_id: 'concrete',
      floor_thickness: 0.10,
      insulation_material_id: 'mineral_wool',
      insulation_thickness: 0.0, // No insulation
      window_area: 2.0,
      window_orientation: 0.0,
      window_glazing_type: 'single_pane',
      door_area: 2.0,
      thermal_mass_kg: 200.0,
      thermal_mass_material_id: 'stone',
      ach: 2.5, // High draft
    },
  },
  {
    label: 'Scenario 2: Conventional Shelter',
    design: {
      name: 'Standard Concrete & Brick',
      length: 6.0,
      width: 4.0,
      height: 3.0,
      orientation: 90.0, // East facing
      wall_material_id: 'brick',
      wall_thickness: 0.23,
      roof_material_id: 'concrete',
      roof_thickness: 0.15,
      roof_type: 'flat',
      floor_material_id: 'concrete',
      floor_thickness: 0.15,
      insulation_material_id: 'eps',
      insulation_thickness: 0.03, // Thin EPS
      window_area: 3.0,
      window_orientation: 90.0,
      window_glazing_type: 'double_pane',
      door_area: 2.0,
      thermal_mass_kg: 600.0,
      thermal_mass_material_id: 'concrete',
      ach: 1.0,
    },
  },
  {
    label: 'Scenario 3: Optimized Passive Shelter',
    design: {
      name: 'High-Altitude Passive Thermal Shelter',
      length: 6.0,
      width: 4.0,
      height: 3.0,
      orientation: 180.0, // South facing
      wall_material_id: 'brick',
      wall_thickness: 0.23,
      roof_material_id: 'concrete',
      roof_thickness: 0.15,
      roof_type: 'sloped',
      floor_material_id: 'concrete',
      floor_thickness: 0.15,
      insulation_material_id: 'mineral_wool',
      insulation_thickness: 0.10, // 10cm mineral wool
      window_area: 4.0,
      window_orientation: 180.0, // South glazing
      window_glazing_type: 'double_pane',
      door_area: 2.0,
      thermal_mass_kg: 1500.0, // 1500kg stone mass
      thermal_mass_material_id: 'stone',
      ach: 0.5, // Controlled infiltration
    },
  },
];

const CompareDesigns: React.FC = () => {
  const [locationId, setLocationId] = useState<string>('leh');
  const [loading, setLoading] = useState<boolean>(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

  useEffect(() => {
    runComparison(locationId);
  }, [locationId]);

  const runComparison = async (locId: string) => {
    setLoading(true);
    const res = await compareDesigns(
      locId,
      PRESET_SCENARIOS.map((s) => s.design),
      PRESET_SCENARIOS.map((s) => s.label)
    );
    if (res) {
      setComparison(res);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 mb-2">Design Comparison Matrix</h1>
        <p className="text-slate-400 text-sm">
          Compare thermal performance, heat loss breakdown, solar gain, and construction costs side-by-side across shelter design scenarios.
        </p>
      </div>

      <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-semibold uppercase text-slate-300">Target Climate Region:</span>
        </div>
        <select
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
        >
          <option value="leh">Leh, Ladakh (Cold Desert)</option>
          <option value="kargil">Kargil, Ladakh (River Valley)</option>
          <option value="drass">Drass, Ladakh (Extreme Cold)</option>
          <option value="nubra">Nubra Valley, Ladakh</option>
          <option value="changthang">Changthang Plateau</option>
        </select>
      </div>

      {loading && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-sm">
          Evaluating side-by-side dynamic thermal simulations...
        </div>
      )}

      {comparison && !loading && (
        <div className="space-y-8">
          {/* Comparison Matrix Table */}
          <div className="overflow-x-auto bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Parameter / Metric</th>
                  {comparison.items.map((item, idx) => (
                    <th
                      key={idx}
                      className={`p-4 font-bold ${
                        idx === 2 ? 'text-amber-400 bg-amber-500/10 border-x border-amber-500/30' : 'text-slate-200'
                      }`}
                    >
                      {item.label}
                      {idx === 2 && (
                        <span className="block text-[10px] font-mono text-emerald-400 font-normal uppercase mt-0.5">
                          ★ Recommended Passive Design
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                <tr>
                  <td className="p-4 font-semibold text-slate-400">Wall Insulation</td>
                  {comparison.items.map((item, idx) => (
                    <td key={idx} className={`p-4 ${idx === 2 ? 'bg-amber-500/5 font-semibold text-amber-300' : ''}`}>
                      {item.design.insulation_thickness > 0
                        ? `${Math.round(item.design.insulation_thickness * 100)} cm ${item.design.insulation_material_id.replace('_', ' ').toUpperCase()}`
                        : 'None (Uninsulated)'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-slate-400">Glazing & Orientation</td>
                  {comparison.items.map((item, idx) => (
                    <td key={idx} className={`p-4 ${idx === 2 ? 'bg-amber-500/5 font-semibold text-amber-300' : ''}`}>
                      {item.design.window_area} m² ({item.design.window_orientation === 180 ? 'South 180°' : `${item.design.window_orientation}°`})
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-slate-400">Thermal Mass</td>
                  {comparison.items.map((item, idx) => (
                    <td key={idx} className={`p-4 ${idx === 2 ? 'bg-amber-500/5 font-semibold text-amber-300' : ''}`}>
                      {item.design.thermal_mass_kg} kg ({item.design.thermal_mass_material_id})
                    </td>
                  ))}
                </tr>

                <tr className="bg-slate-950/40">
                  <td className="p-4 font-semibold text-slate-200">Thermal Score (0-100)</td>
                  {comparison.items.map((item, idx) => (
                    <td key={idx} className={`p-4 font-extrabold text-sm ${idx === 2 ? 'text-emerald-400 bg-amber-500/10' : 'text-slate-200'}`}>
                      {item.simulation_result.summary.thermal_score} / 100
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-slate-400">Comfort Hours (18°C–27°C)</td>
                  {comparison.items.map((item, idx) => (
                    <td key={idx} className={`p-4 font-bold ${idx === 2 ? 'text-emerald-400 bg-amber-500/5' : 'text-slate-300'}`}>
                      {item.simulation_result.summary.comfort_hours} h / 24 h ({item.simulation_result.summary.comfort_percentage}%)
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-slate-400">Daily Heat Loss</td>
                  {comparison.items.map((item, idx) => (
                    <td key={idx} className={`p-4 font-bold ${idx === 2 ? 'text-orange-400 bg-amber-500/5' : 'text-slate-300'}`}>
                      {item.simulation_result.summary.heat_loss_kwh} kWh/day
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-slate-400">Daily Solar Gain</td>
                  {comparison.items.map((item, idx) => (
                    <td key={idx} className={`p-4 font-bold ${idx === 2 ? 'text-amber-400 bg-amber-500/5' : 'text-slate-300'}`}>
                      {item.simulation_result.summary.solar_gain_kwh} kWh/day
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-slate-400">Estimated Construction Cost</td>
                  {comparison.items.map((item, idx) => (
                    <td key={idx} className={`p-4 font-bold ${idx === 2 ? 'text-cyan-400 bg-amber-500/5' : 'text-slate-300'}`}>
                      ₹{(item.simulation_result.summary.estimated_cost / 100000).toFixed(2)} Lakh
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Side-by-side Temperature Curves */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparison.items.map((item, idx) => (
              <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-xs text-slate-200 truncate">{item.label}</h4>
                <div className="h-56">
                  <TemperatureChart hourly={item.simulation_result.hourly} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareDesigns;
