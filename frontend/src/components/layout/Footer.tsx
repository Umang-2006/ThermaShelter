import React from 'react';
import { ThermometerSun, ShieldCheck } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-8 text-slate-400 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <ThermometerSun className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-slate-200 text-sm">ThermaShelter Platform</span>
            <span className="text-xs text-slate-500 font-mono">v1.0.0</span>
          </div>

          <div className="text-xs text-center md:text-right max-w-xl text-slate-400">
            <p className="flex items-center justify-center md:justify-end gap-1.5 text-amber-300 font-medium mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Prototype thermal simulation – engineering approximation, not a certified building-energy calculation.
            </p>
            <p className="text-slate-500">
              Inspired by DRDO problem statement for area-specific passive shelter thermal comfort.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
