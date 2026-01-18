import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Content Creator",
    image: "https://picsum.photos/100?random=1",
    text: "I spent $500 last month on a photographer. Today I spent $29 on Directr and got better results. The consistency is insane."
  },
  {
    name: "Marcus Chen",
    role: "Startup Founder",
    image: "https://picsum.photos/100?random=2",
    text: "Needed headshots for my team of 10. Traditional studio quoted $3k. Directr did it for a fraction of the cost in 20 minutes."
  },
  {
    name: "Elena Rodriguez",
    role: "Realtor",
    image: "https://picsum.photos/100?random=3",
    text: "The 'Character DNA' tech is real. It actually looks like me, not some generic AI filter. My LinkedIn profile has never looked better."
  }
];

export const SocialProof: React.FC = () => {
  return (
    <div className="w-full py-10 border-y border-white/5 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Trusted by 5,000+ Professionals</p>
          <div className="flex justify-center gap-8 opacity-50 grayscale">
             {/* Fake Logos */}
             <span className="text-xl font-bold font-serif">VOGUE</span>
             <span className="text-xl font-bold font-sans">Forbes</span>
             <span className="text-xl font-bold font-mono">WIRED</span>
             <span className="text-xl font-bold font-serif italic">Vanity Fair</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }} className="md:grid-cols-3">
          {testimonials.map((t, i) => (
            <GlassCard key={i} className="p-6" style={{ width: '100%' }} hoverEffect={true} delay={i * 0.1}>
              <div className="flex items-center gap-1 mb-4 text-brand-gold">
                {[1,2,3,4,5].map(star => <Star key={star} size={14} fill="currentColor" />)}
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.625', width: '100%' }}>&quot;{t.text}&quot;</p>
              <div className="flex items-center gap-3">
                <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full border border-white/10" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};
