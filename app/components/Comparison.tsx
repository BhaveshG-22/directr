import React from 'react';
import { Check, X } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export const Comparison: React.FC = () => {
  return (
    <GlassCard className="p-0 overflow-hidden !bg-slate-900/30 w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-6 text-sm font-medium text-slate-400 w-1/4">Feature</th>
              <th className="p-6 text-lg font-bold text-white w-1/4 bg-white/5 border-l border-r border-white/10">
                <span className="text-brand-teal">Directr</span>
              </th>
              <th className="p-6 text-sm font-semibold text-slate-300 w-1/4">Traditional Photo Studio</th>
              <th className="p-6 text-sm font-semibold text-slate-300 w-1/4">Other AI Tools</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr>
              <td className="p-6 text-slate-300 font-medium">Cost per shoot</td>
              <td className="p-6 bg-white/5 border-l border-r border-white/10 font-bold text-brand-gold">$ (Credits)</td>
              <td className="p-6 text-slate-400">$200 - $2000+</td>
              <td className="p-6 text-slate-400">$$ Subscription</td>
            </tr>
            <tr>
              <td className="p-6 text-slate-300 font-medium">Time to results</td>
              <td className="p-6 bg-white/5 border-l border-r border-white/10 font-bold text-white">~5 Minutes</td>
              <td className="p-6 text-slate-400">3-14 Days</td>
              <td className="p-6 text-slate-400">10-60 Minutes</td>
            </tr>
            <tr>
              <td className="p-6 text-slate-300 font-medium">Likeness Consistency</td>
              <td className="p-6 bg-white/5 border-l border-r border-white/10">
                <div className="flex items-center gap-2 text-brand-teal">
                  <Check size={18} /> Character DNA™
                </div>
              </td>
              <td className="p-6 text-slate-400">Varies</td>
              <td className="p-6 text-slate-400">
                <div className="flex items-center gap-2 text-red-400">
                  <X size={18} /> Poor/Hit-or-Miss
                </div>
              </td>
            </tr>
            <tr>
              <td className="p-6 text-slate-300 font-medium">Scene Variations</td>
              <td className="p-6 bg-white/5 border-l border-r border-white/10 font-bold text-white">Unlimited</td>
              <td className="p-6 text-slate-400">Limited by location/time</td>
              <td className="p-6 text-slate-400">Prompt dependent</td>
            </tr>
            <tr>
              <td className="p-6 text-slate-300 font-medium">Re-shoots</td>
              <td className="p-6 bg-white/5 border-l border-r border-white/10 font-bold text-white">Instant</td>
              <td className="p-6 text-slate-400">Requires Booking</td>
              <td className="p-6 text-slate-400">Restart generation</td>
            </tr>
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};
