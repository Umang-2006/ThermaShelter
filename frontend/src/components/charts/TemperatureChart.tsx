import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, Line } from 'recharts';
import { HourlySimulationStep } from '../../types/simulation';

interface Props {
  hourly: HourlySimulationStep[];
  comfortMin?: number;
  comfortMax?: number;
}

const TemperatureChart: React.FC<Props> = ({ hourly, comfortMin = 18, comfortMax = 27 }) => {
  const chartData = hourly.map((h) => ({
    hour: `${h.hour % 24}:00`,
    Outdoor: h.outside_temperature,
    Indoor: h.inside_temperature,
  }));

  return (
    <div className="w-full h-80 bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            Dynamic Hourly Indoor vs Outdoor Temperature
          </h3>
          <p className="text-xs text-slate-400">Green shaded area highlights target thermal comfort range ({comfortMin}°C – {comfortMax}°C)</p>
        </div>
      </div>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="indoorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="°C" domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
              formatter={(value: any) => [`${value} °C`]}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            <ReferenceArea y1={comfortMin} y2={comfortMax} fill="#10b981" fillOpacity={0.12} stroke="#10b981" strokeOpacity={0.2} label={{ value: 'Comfort Range', fill: '#10b981', fontSize: 10, position: 'insideTopLeft' }} />
            <Line type="monotone" dataKey="Outdoor" stroke="#38bdf8" strokeWidth={2} dot={false} name="Outdoor Ambient (°C)" />
            <Area type="monotone" dataKey="Indoor" stroke="#f59e0b" strokeWidth={3} fill="url(#indoorGrad)" dot={false} activeDot={{ r: 6 }} name="Indoor Shelter (°C)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TemperatureChart;
