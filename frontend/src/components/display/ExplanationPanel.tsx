import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface Props {
  explanations: string[];
  designName?: string;
}

const ExplanationPanel: React.FC<Props> = ({ explanations, designName = 'Recommended Design' }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 rounded-xl p-5 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-slate-100">WHY THIS DESIGN?</h3>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/50">
          Physics Engine Rationale
        </span>
      </div>

      <ul className="space-y-3">
        {explanations.map((bullet, idx) => (
          <li key={idx} className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-200 leading-relaxed font-normal">{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExplanationPanel;
