import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { HourlySimulationStep } from '../../types/simulation';

interface Props {
  hourly: HourlySimulationStep[];
}

const HeatFlowChart: React.FC<Props> = ({ hourly }) => {
  const chartData = hourly.map((h) => ({
    hour: `${h.hour % 24}:00`,
    'Solar Gain': h.solar_gain,
    'Wall Loss': -h.wall_loss,
    'Roof Loss': -h.roof_loss,
    'Window Loss': -h.window_loss,
    'Door Loss': -h.door_loss,
    'Ventilation Loss': -h.ventilation_loss,
    'Net Heat': h.net_heat,
  }));

  return (
    <div className="w-full h-80 bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
            Hourly Heat Flow Rates (kW) Breakdown
          </h3>
          <p className="text-xs text-slate-400">Positive values are solar gains; negative values are conductive/ventilation heat losses.</p>
        </div>
      </div>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit=" kW" />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
              formatter={(value: any) => [`${Math.abs(Number(value)).toFixed(2)} kW`]}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} />
            <Bar dataKey="Solar Gain" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Wall Loss" fill="#ef4444" radius={[0, 0, 2, 2]} />
            <Bar dataKey="Roof Loss" fill="#f97316" radius={[0, 0, 2, 2]} />
            <Bar dataKey="Window Loss" fill="#0284c7" radius={[0, 0, 2, 2]} />
            <Bar dataKey="Ventilation Loss" fill="#a855f7" radius={[0, 0, 2, 2]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HeatFlowChart;
