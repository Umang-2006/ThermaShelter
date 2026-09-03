import React from 'react';
import { ShieldCheck, Flame, Cpu, BookOpen, AlertTriangle, CpuIcon } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 mb-2">Engineering Model & Methodology</h1>
        <p className="text-slate-400 text-sm">
          Technical specifications, thermal physics equations, multi-objective optimization workflow, and engineering disclaimers.
        </p>
      </div>

      {/* Problem Statement & DRDO Alignment */}
      <section className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-slate-100">1. Problem Alignment & Objectives</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Inspired by the DRDO problem statement: <em className="text-amber-300">"Software Based Model Development for Design of Area Specific Shelter for Thermal Comfort Maintenance"</em>, ThermaShelter replaces manual trial-and-error shelter design with dynamic thermal physics and automated optimization.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          In high-altitude cold deserts (e.g. Leh, Kargil, Drass, Nubra, Changthang), sub-zero winter ambient temperatures drop down to -30°C. Standard uninsulated shelters suffer extreme conductive heat loss and freezing indoor conditions. ThermaShelter evaluates site-specific solar irradiance, composite wall/roof U-values, ventilation infiltration, and dynamic thermal storage mass to automatically recommend optimal passive designs within construction budget limits.
        </p>
      </section>

      {/* Physics Thermal Model Equations */}
      <section className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <Flame className="w-5 h-5 text-orange-400" />
          <h2 className="text-base font-bold text-slate-100">2. Lumped-Parameter Dynamic Heat Balance Equations</h2>
        </div>
        <div className="space-y-3 text-xs text-slate-300">
          <p>At every hourly timestep, the net heat flow rate Q_net (Watts) is calculated:</p>
          <div className="bg-slate-950 p-4 rounded-lg font-mono text-amber-400 border border-slate-800 overflow-x-auto">
            Q_net = Q_solar,win + Q_solar,opaque - (Q_wall + Q_roof + Q_floor + Q_window + Q_door + Q_vent)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <span className="font-bold text-slate-200 block mb-1">Composite Thermal Resistance (U-value)</span>
              <p className="text-[11px] font-mono text-slate-400 mb-1">R_total = R_inside + SUM(d_i / k_i) + R_outside</p>
              <p className="text-[11px] font-mono text-slate-400">U = 1 / R_total (W/m²K)</p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <span className="font-bold text-slate-200 block mb-1">Conductive Heat Loss Rate</span>
              <p className="text-[11px] font-mono text-slate-400">Q_cond = U * A * (T_inside - T_outside)</p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <span className="font-bold text-slate-200 block mb-1">Glazing Solar Heat Gain</span>
              <p className="text-[11px] font-mono text-slate-400">Q_solar = I_solar * A_win * SHGC * cos(theta)</p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <span className="font-bold text-slate-200 block mb-1">Air Infiltration Loss</span>
              <p className="text-[11px] font-mono text-slate-400">Q_vent = m_dot * Cp_air * (T_inside - T_outside)</p>
            </div>
          </div>

          <p className="pt-2">State update for indoor temperature at next timestep:</p>
          <div className="bg-slate-950 p-3 rounded-lg font-mono text-cyan-400 border border-slate-800">
            T_next = T_current + (Q_net * dt) / C_eff
          </div>
        </div>
      </section>

      {/* Multi-Objective Optimization Engine */}
      <section className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <Cpu className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-slate-100">3. Multi-Objective Search & Pareto Optimization</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          ThermaShelter searches candidate space over geometry (length, width, height), orientation (0°-360°), material selection, insulation thickness, openings, and thermal storage mass. Candidates are scored using a multi-objective fitness function combining thermal comfort hours, heat loss efficiency, solar utilization, and construction cost.
        </p>
      </section>

      {/* Future AI Architecture Section */}
      <section className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <CpuIcon className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-slate-100">4. Future ML Surrogate Architecture</h2>
        </div>
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-purple-300 flex flex-col md:flex-row items-center justify-between gap-4">
          <span>Climate Data</span> → <span>Physics Simulation (Ground Truth)</span> → <span>XGBoost ML Surrogate</span> → <span>Fast Multi-Objective Optimization</span>
        </div>
        <p className="text-xs text-slate-400">
          *Note: In the current prototype, the dynamic physics model is the deterministic ground truth source of truth. ML surrogate models will accelerate large-scale multi-year runs in future versions.
        </p>
      </section>

      {/* Disclaimer Banner */}
      <section className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" />
          Prototype Thermal Simulation Disclaimer
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-300">Prototype thermal simulation – engineering approximation, not a certified building-energy calculation.</strong>
        </p>
        <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
          <li>Assumes uniform single-zone internal air temperature distribution.</li>
          <li>Does not substitute for certified structural engineering, local building code compliance, or CFD envelope modeling.</li>
          <li>Material thermal properties and costs represent approximate reference database values.</li>
        </ul>
      </section>
    </div>
  );
};

export default About;
