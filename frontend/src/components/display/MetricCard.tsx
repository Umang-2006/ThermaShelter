import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, subValue, icon, color = 'emerald' }) => {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
    orange: 'text-orange-400 border-orange-500/30 bg-orange-950/20',
    purple: 'text-purple-400 border-purple-500/30 bg-purple-950/20',
  };

  const style = colorMap[color] || colorMap.emerald;

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-md transition-all shadow-md ${style} flex items-center justify-between`}>
      <div>
        <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">{label}</span>
        <span className="text-2xl font-extrabold text-slate-100">{value}</span>
        {subValue && <span className="text-xs text-slate-400 block mt-0.5">{subValue}</span>}
      </div>
      {icon && <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">{icon}</div>}
    </div>
  );
};

export default MetricCard;
