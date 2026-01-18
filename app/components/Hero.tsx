"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Camera, Star } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 px-6" style={{ width: '100%' }}>
      <style>{`
        @media (min-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-right { display: block !important; }
        }
      `}</style>
      <div className="hero-grid" style={{ maxWidth: '80rem', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center', width: '100%' }}>

        {/* Left Content */}
        <div style={{ width: '100%' }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{ width: '100%' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles size={12} />
              <span>AI Virtual Photoshoot V2.0</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
              <span className="block text-white">
                Professional photoshoots.
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-cyan-400">
                No photographer required.
              </span>
            </h1>

            <p className="text-lg text-slate-400 mb-8 leading-relaxed" style={{ maxWidth: '32rem', width: '100%' }}>
              Upload casual selfies → AI generates studio-quality portraits. Save $500+ per session with your own AI photographer.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button className="group relative px-8 py-4 bg-brand-teal text-black rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105 shadow-[0_0_20px_rgba(32,184,209,0.4)]">
                <span className="relative z-10 flex items-center gap-2">
                  Start Photoshoot <ArrowRight size={18} />
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>

              <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-semibold text-white hover:bg-white/10 transition-colors backdrop-blur-md">
                View Gallery
              </button>
            </div>

            <div className="mt-10 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://picsum.photos/32/32?random=${i}`}
                    alt="User"
                    className="w-8 h-8 rounded-full border-2 border-slate-950"
                  />
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <div className="flex text-brand-gold">
                    {[1,2,3,4,5].map(star => <Star key={star} size={12} fill="currentColor" />)}
                  </div>
                  <span className="text-white font-bold">4.9/5</span>
                </div>
                <p className="text-xs">Trusted by 10,000+ creators</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Visuals - Floating Cards */}
        <div className="hero-right relative" style={{ height: '600px', display: 'none' }}>
           {/* Card 1 - The Result */}
           <motion.div
             animate={{ y: [0, -20, 0] }}
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-10 right-10 z-20 w-80"
           >
             <GlassCard className="p-2 !rounded-[2rem]">
                <img
                  src="https://picsum.photos/400/500?random=100"
                  alt="Generated Professional"
                  className="w-full h-96 object-cover rounded-[1.5rem]"
                />
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white uppercase">Studio Portrait</span>
                    <span className="text-xs text-brand-teal font-mono">100% Quality</span>
                  </div>
                  <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-brand-teal" />
                  </div>
                </div>
             </GlassCard>
           </motion.div>

           {/* Card 2 - The Input (Behind) */}
           <motion.div
             animate={{ y: [0, 20, 0] }}
             transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
             className="absolute bottom-20 left-10 z-10 w-64 opacity-60 scale-90"
           >
              <GlassCard className="p-2 !rounded-[2rem]">
                <div className="relative">
                  <img
                    src="https://picsum.photos/300/400?random=101"
                    alt="Selfie Input"
                    className="w-full h-64 object-cover rounded-[1.5rem] grayscale"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 backdrop-blur-sm p-3 rounded-full border border-white/20">
                      <Camera className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-300">Input Reference</p>
                  <p className="text-sm font-semibold">Selfie_04.jpg</p>
                </div>
              </GlassCard>
           </motion.div>

           {/* Decorative elements */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-teal/20 to-brand-gold/10 rounded-full blur-[100px] -z-10" />
        </div>
      </div>
    </section>
  );
};
