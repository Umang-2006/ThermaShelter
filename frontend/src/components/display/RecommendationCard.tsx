import React from 'react';
import { DesignRecommendation } from '../../types/optimization';
import { Trophy, Home, ShieldCheck, DollarSign, Sun, Flame } from 'lucide-react';

interface Props {
  recommendation: DesignRecommendation;
  isSelected?: boolean;
  onSelect?: () => void;
}

const RecommendationCard: React.FC<Props> = ({ recommendation, isSelected, onSelect }) => {
  const { rank, category, design, simulation_result } = recommendation;
  const summary = simulation_result.summary;

  const area = (design.length * design.width).toFixed(1);
  const costLakh = (summary.estimated_cost / 100000).toFixed(2);

  return (
    <div
      onClick={onSelect}
      className={`card transition-all cursor-pointer relative overflow-hidden ${
        isSelected
          ? 'border-2 border-amber-500 bg-slate-900 shadow-xl shadow-amber-500/10'
          : 'border border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
      }`}
    >
      {rank === 1 && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold px-3 py-1 text-xs rounded-bl-lg flex items-center gap-1 shadow-md">
          <Trophy className="w-3.5 h-3.5" />
          RECOMMENDED
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
          #{rank}
        </span>
        <h4 className="font-semibold text-slate-100 text-base">{category}</h4>
      </div>

      <div className="text-sm font-semibold text-slate-200 mb-4 flex items-center justify-between">
        <span className="text-slate-400 font-normal">Dimensions:</span> {design.length}m × {design.width}m ({area} m²)
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block mb-1">Wall Construction</span>
          <span className="font-medium text-slate-200 capitalize">
            {design.wall_material_id} + {int(design.insulation_thickness * 100)}cm {design.insulation_material_id.replace('_', ' ')}
          </span>
        </div>
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block mb-1">Glazing & Orientation</span>
          <span className="font-medium text-slate-200">
            {design.window_area} m² ({design.window_orientation === 180 ? 'South 180°' : `${design.window_orientation}°`})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-center">
        <div>
          <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Comfort
          </span>
          <span className="font-bold text-emerald-400 text-xs">{summary.comfort_hours}h / 24h</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" /> Heat Loss
          </span>
          <span className="font-semibold text-slate-200 text-xs">{summary.heat_loss_kwh} kWh</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Sun className="w-3 h-3 text-amber-400" /> Solar Gain
          </span>
          <span className="font-semibold text-slate-200 text-xs">{summary.solar_gain_kwh} kWh</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <DollarSign className="w-3 h-3 text-cyan-400" /> Est. Cost
          </span>
          <span className="font-semibold text-cyan-400 text-xs">₹{costLakh} L</span>
        </div>
      </div>
    </div>
  );
};

function int(val: number) {
  return Math.round(val);
}

export default RecommendationCard;
