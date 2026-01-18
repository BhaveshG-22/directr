"use client";
import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { ScanFace, Layers, ShieldCheck, RefreshCw } from 'lucide-react';

// Deterministic pattern for the grid animation (avoids hydration mismatch)
const litCells = [0, 2, 5, 7, 8, 11, 14, 17, 19, 22, 25, 27, 30, 33, 35, 38, 41, 43, 46, 49, 51, 54, 57, 59, 62];

export const FeaturesBento: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-auto md:grid-rows-3 gap-6 h-auto md:h-[800px]">

      {/* Box 1: Character DNA - Large */}
      <GlassCard className="col-span-1 md:col-span-2 md:row-span-2 p-8 flex flex-col justify-between group">
        <div style={{ width: '100%' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-brand-teal/20 rounded-xl text-brand-teal">
              <ScanFace size={24} />
            </div>
            <h3 className="text-2xl font-bold">Character DNA™</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.625', maxWidth: '28rem', width: '100%' }}>
            We extract 100+ facial attributes including face shape, skin tone, and micro-expressions. Your generated images aren&apos;t just similar—they are mathematically identical to your unique identity.
          </p>
        </div>

        <div className="relative mt-8 h-64 w-full bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
           {/* Abstract visualization of face scanning */}
           <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-1 opacity-20">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className={`bg-brand-teal rounded-sm transition-opacity duration-1000 ${litCells.includes(i) ? 'opacity-100' : 'opacity-0'}`} />
              ))}
           </div>
           <div className="relative z-10 w-32 h-32 rounded-full border-2 border-brand-teal/50 flex items-center justify-center shadow-[0_0_50px_rgba(32,184,209,0.3)]">
              <img src="https://picsum.photos/200?random=50" className="w-full h-full rounded-full object-cover opacity-80 mix-blend-luminosity" alt="Scan" />
              <div className="absolute inset-0 bg-brand-teal/20 animate-pulse rounded-full"></div>
              <ScanFace className="absolute text-white drop-shadow-lg" size={48} />
           </div>
        </div>
      </GlassCard>

      {/* Box 2: Quality Control - Vertical */}
      <GlassCard className="col-span-1 md:row-span-2 p-8 flex flex-col items-center text-center justify-center relative overflow-hidden" delay={0.2}>
         <div className="absolute top-0 w-full h-full bg-gradient-to-b from-brand-gold/5 to-transparent" />
         <div className="relative z-10" style={{ width: '100%' }}>
            <div className="p-4 bg-brand-gold/10 rounded-full text-brand-gold mb-6 mx-auto w-fit">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Director</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.625', width: '100%' }}>
              Every shot is scored. Only 9/10+ quality makes the cut.
            </p>

            <div className="flex flex-col gap-3 w-full">
               <div className="bg-slate-900/80 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                 <span className="text-xs text-slate-400">Likeness</span>
                 <span className="text-xs font-mono text-brand-gold">99%</span>
               </div>
               <div className="bg-slate-900/80 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                 <span className="text-xs text-slate-400">Lighting</span>
                 <span className="text-xs font-mono text-brand-gold">98%</span>
               </div>
               <div className="bg-slate-900/80 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                 <span className="text-xs text-slate-400">Composition</span>
                 <span className="text-xs font-mono text-brand-gold">100%</span>
               </div>
            </div>
         </div>
      </GlassCard>

      {/* Box 3: Scene Engine - Horizontal */}
      <GlassCard className="col-span-1 md:col-span-2 p-6 flex flex-col md:flex-row items-center gap-6" delay={0.3}>
         <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                <Layers size={20} />
              </div>
              <h3 className="text-xl font-bold">Scene Permutation</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.625', width: '100%' }}>
              One concept → 5 unique professional variations. Control angle, lighting, and framing instantly.
            </p>
         </div>
         <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-20 h-24 bg-slate-800 rounded-lg border border-white/10 overflow-hidden relative group cursor-pointer">
                 <img src={`https://picsum.photos/100/150?random=${i+20}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Scene" />
                 <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
         </div>
      </GlassCard>

      {/* Box 4: Face Swap - Small */}
      <GlassCard className="col-span-1 p-6 flex flex-col justify-center" delay={0.4}>
         <div className="flex items-center justify-between mb-4" style={{ width: '100%' }}>
            <h3 className="text-lg font-bold">Face Swap</h3>
            <RefreshCw size={20} className="text-brand-teal" style={{ flexShrink: 0 }} />
         </div>
         <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: '1.5', width: '100%' }}>
           Never settle for &quot;close enough&quot;. Our secondary model fixes likeness issues instantly.
         </p>
         <button className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-colors">
           Try Correction
         </button>
      </GlassCard>

    </div>
  );
};
