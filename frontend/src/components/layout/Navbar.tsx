import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThermometerSun, Activity, Cpu, Layers, Info, ShieldCheck } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <Activity className="w-4 h-4" /> },
    { name: 'Analyze Design', path: '/analyze', icon: <ThermometerSun className="w-4 h-4" /> },
    { name: 'Optimize Design', path: '/optimize', icon: <Cpu className="w-4 h-4" /> },
    { name: 'Compare Designs', path: '/compare', icon: <Layers className="w-4 h-4" /> },
    { name: 'About / Methodology', path: '/about', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition-transform">
              <ThermometerSun className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-slate-100 tracking-tight block">
                Therma<span className="text-amber-400">Shelter</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 block -mt-1">
                Passive Thermal Comfort Platform
              </span>
            </div>
          </Link>

          <div className="hidden md:flex space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive(link.path)
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>DRDO Problem Statement Prototype</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
