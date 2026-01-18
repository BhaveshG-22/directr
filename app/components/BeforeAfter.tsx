"use client";
import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { motion } from 'framer-motion';

export const BeforeAfter: React.FC = () => {
  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '48rem', margin: '0 auto 4rem', width: '100%' }}>
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          One Face. <span className="text-brand-teal">Infinite Possibilities.</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1.125rem', lineHeight: '1.75', width: '100%' }}>
          Our Character DNA™ engine analyzes 100+ facial attributes to ensure you look like
          <span className="text-white font-bold"> you</span> in every single shot.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Input - The "Before" */}
        <div className="lg:col-span-4 relative">
          <p className="text-center mb-4 font-bold text-slate-400 uppercase tracking-widest text-sm">Upload 10 Selfies</p>
          <div className="relative mx-auto w-64 h-80 rotate-[-6deg]">
            <GlassCard className="h-full p-2 !rounded-2xl border-brand-teal/30">
              <img
                src="https://picsum.photos/300/400?random=105"
                alt="Original Selfie"
                className="w-full h-full object-cover rounded-xl grayscale"
              />
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border border-white/10">Input</div>
            </GlassCard>
          </div>
          <div className="absolute top-1/2 -right-4 lg:-right-8 z-10 hidden lg:block text-brand-teal">
            <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 10H38M38 10L30 2M38 10L30 18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        {/* Output - The "After" */}
        <div className="lg:col-span-8">
           <p className="text-center lg:text-left mb-4 font-bold text-brand-teal uppercase tracking-widest text-sm">Get 50+ Professional Styles</p>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "LinkedIn", color: "bg-blue-500" },
                { label: "Editorial", color: "bg-purple-500" },
                { label: "Casual", color: "bg-green-500" },
                { label: "Studio", color: "bg-brand-gold" }
              ].map((style, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard className="p-0 !rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
                    <div className="relative aspect-[3/4]">
                      <img
                        src={`https://picsum.photos/300/400?random=${200+i}`}
                        alt={style.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className={`text-xs font-bold text-white px-2 py-1 rounded-md ${style.color}`}>{style.label}</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
