"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Cpu, CheckCircle, Copy, Image as ImageIcon } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

const steps = [
  {
    icon: Upload,
    title: "Upload Photos",
    desc: "Upload 10+ reference selfies. No professional gear needed.",
    colorClass: "text-blue-400"
  },
  {
    icon: Cpu,
    title: "Character DNA",
    desc: "AI extracts your unique facial geometry and style markers.",
    colorClass: "text-brand-teal"
  },
  {
    icon: CheckCircle,
    title: "Selection",
    desc: "We auto-select the highest quality reference as the base.",
    colorClass: "text-green-400"
  },
  {
    icon: Copy,
    title: "Variations",
    desc: "Our engine creates 5 unique pose/angle combinations per scene.",
    colorClass: "text-purple-400"
  },
  {
    icon: ImageIcon,
    title: "Generate",
    desc: "Final render with quality scoring and face-swap refinement.",
    colorClass: "text-brand-gold"
  }
];

export const HowItWorks: React.FC = () => {
  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '48rem', margin: '0 auto 4rem', padding: '0 1rem', width: '100%' }}>
        <span className="text-brand-teal font-semibold tracking-wider text-sm uppercase">Process</span>
        <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4">From Selfie to Studio in Minutes</h2>
        <p style={{ color: '#94a3b8', fontSize: '1.125rem', lineHeight: '1.75', width: '100%' }}>
          We&apos;ve automated the entire photography workflow, from casting to post-production.
        </p>
      </div>

      <div className="relative">
        {/* Connecting Line (Desktop) */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-brand-teal/20 to-brand-gold/20 -translate-y-1/2 hidden md:block" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }} className="md:grid-cols-5">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
              style={{ width: '100%' }}
            >
              <GlassCard className="h-full p-6 flex flex-col items-center text-center z-10 relative bg-slate-900/40" style={{ width: '100%' }} hoverEffect={true}>
                <div className={`p-4 rounded-full bg-white/5 border border-white/10 mb-4 ${step.colorClass}`} style={{ flexShrink: 0 }}>
                  <step.icon size={24} />
                </div>
                <div className="absolute top-4 right-4 text-xs font-bold text-white/20">0{index + 1}</div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.625', width: '100%' }}>{step.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
