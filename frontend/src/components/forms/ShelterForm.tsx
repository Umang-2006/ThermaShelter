import React, { useState } from 'react';
import { ShelterDesign, Location, Material } from '../../types/shelter';
import { ChevronDown, ChevronUp, Layers, Home, Sliders } from 'lucide-react';

interface Props {
  locations: Location[];
  materials: Material[];
  onSubmit: (locationId: string, design: ShelterDesign) => void;
  isLoading?: boolean;
}

const ShelterForm: React.FC<Props> = ({ locations, materials, onSubmit, isLoading }) => {
  const [locationId, setLocationId] = useState<string>('leh');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [design, setDesign] = useState<ShelterDesign>({
    name: 'Custom Shelter Design',
    length: 6.0,
    width: 4.0,
    height: 3.0,
    orientation: 180.0,
    wall_material_id: 'brick',
    wall_thickness: 0.23,
    roof_material_id: 'concrete',
    roof_thickness: 0.15,
    roof_type: 'sloped',
    floor_material_id: 'concrete',
    floor_thickness: 0.15,
    insulation_material_id: 'mineral_wool',
    insulation_thickness: 0.10,
    window_area: 4.0,
    window_orientation: 180.0,
    window_glazing_type: 'double_pane',
    door_area: 2.0,
    thermal_mass_kg: 1500.0,
    thermal_mass_material_id: 'stone',
    ach: 0.5,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numFields = [
      'length', 'width', 'height', 'orientation', 'wall_thickness',
      'roof_thickness', 'floor_thickness', 'insulation_thickness',
      'window_area', 'window_orientation', 'door_area', 'thermal_mass_kg', 'ach'
    ];

    setDesign((prev) => ({
      ...prev,
      [name]: numFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(locationId, design);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Home className="w-5 h-5 text-amber-400" />
          MODE A – Analyze Existing Shelter Design
        </h2>
        <p className="text-xs text-slate-400">Specify exact building geometry, material layering, glazing, and infiltration rates for simulation.</p>
      </div>

      {/* Primary Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">Target Location</label>
          <select
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">Wall Construction Material</label>
          <select
            name="wall_material_id"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 capitalize"
            value={design.wall_material_id}
            onChange={handleChange}
          >
            {materials.filter((m) => m.category === 'structural').map((mat) => (
              <option key={mat.id} value={mat.id}>
                {mat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2 col-span-2 md:col-span-1">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">Length (m)</label>
            <input
              type="number"
              step={0.5}
              min={2}
              max={30}
              name="length"
              value={design.length}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">Width (m)</label>
            <input
              type="number"
              step={0.5}
              min={2}
              max={30}
              name="width"
              value={design.width}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">Height (m)</label>
            <input
              type="number"
              step={0.2}
              min={2}
              max={10}
              name="height"
              value={design.height}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">Insulation Material</label>
          <select
            name="insulation_material_id"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 capitalize"
            value={design.insulation_material_id}
            onChange={handleChange}
          >
            {materials.filter((m) => m.category === 'insulation').map((mat) => (
              <option key={mat.id} value={mat.id}>
                {mat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Parameters Progressive Disclosure */}
      <div className="border-t border-slate-800 pt-3">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 focus:outline-none"
        >
          <Sliders className="w-4 h-4" />
          {showAdvanced ? 'Hide Advanced Thermal Parameters' : 'Show Advanced Parameters (Thermal Mass, ACH, Glazing, Pitch)'}
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Insulation Thickness (m)</label>
              <input
                type="number"
                step={0.01}
                min={0}
                max={0.5}
                name="insulation_thickness"
                value={design.insulation_thickness}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Window Area (m²)</label>
              <input
                type="number"
                step={0.5}
                min={0}
                max={30}
                name="window_area"
                value={design.window_area}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Window Orientation (°)</label>
              <select
                name="window_orientation"
                value={design.window_orientation}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value={180}>180° (South Glazing)</option>
                <option value={90}>90° (East Glazing)</option>
                <option value={270}>270° (West Glazing)</option>
                <option value={0}>0° (North Glazing)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Roof Style</label>
              <select
                name="roof_type"
                value={design.roof_type}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="sloped">Sloped Roof (Gable Pitch)</option>
                <option value="flat">Flat Roof Slab</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Thermal Mass (kg)</label>
              <input
                type="number"
                step={100}
                min={0}
                max={10000}
                name="thermal_mass_kg"
                value={design.thermal_mass_kg}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Air Changes / Hour (ACH)</label>
              <input
                type="number"
                step={0.1}
                min={0.1}
                max={10}
                name="ach"
                value={design.ach}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? 'Simulating Dynamic Heat Balance...' : 'Simulate Shelter Design'}
        </button>
      </div>
    </form>
  );
};

export default ShelterForm;
