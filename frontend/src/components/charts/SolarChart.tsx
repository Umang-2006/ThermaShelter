import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HourlySimulationStep } from '../../types/simulation';

interface Props {
  hourly: HourlySimulationStep[];
}

const SolarChart: React.FC<Props> = ({ hourly }) => {
  const chartData = hourly.map((h) => ({
    hour: `${h.hour % 24}:00`,
    'Solar Irradiance (W/m²)': h.solar_radiation,
    'Shelter Solar Gain (kW)': h.solar_gain,
  }));

  return (
    <div className="w-full h-80 bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            Hourly Solar Radiation & Glazing Heat Capture
          </h3>
          <p className="text-xs text-slate-400">Global horizontal solar irradiance vs actual solar heat captured through shelter glazing.</p>
        </div>
      </div>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" stroke="#f59e0b" tick={{ fontSize: 11 }} unit=" W/m²" />
            <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" tick={{ fontSize: 11 }} unit=" kW" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} />
            <Area yAxisId="left" type="monotone" dataKey="Solar Irradiance (W/m²)" stroke="#f59e0b" fill="url(#solarGrad)" strokeWidth={2} />
            <Area yAxisId="right" type="monotone" dataKey="Shelter Solar Gain (kW)" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SolarChart;
