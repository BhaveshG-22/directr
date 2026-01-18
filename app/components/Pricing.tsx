import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { Check } from 'lucide-react';

const plans = [
  {
    name: "Starter",
    price: "$29",
    credits: "40 Photos",
    features: ["1 Person Model", "5 Styles", "Standard Quality", "Personal License"],
    popular: false
  },
  {
    name: "Professional",
    price: "$49",
    credits: "120 Photos",
    features: ["3 Person Models", "15 Styles", "HD Quality (4K)", "Commercial License", "Priority Generation"],
    popular: true
  },
  {
    name: "Agency",
    price: "$299",
    credits: "1000 Photos",
    features: ["Unlimited Models", "All Styles", "HD Quality (4K)", "Commercial License", "API Access"],
    popular: false
  }
];

export const Pricing: React.FC = () => {
  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '42rem', margin: '0 auto 3rem', padding: '0 1rem', width: '100%' }}>
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
        <p style={{ color: '#94a3b8', fontSize: '1.125rem', lineHeight: '1.75', width: '100%' }}>Pay for what you use. No hidden subscriptions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center px-4">
        {plans.map((plan, i) => (
          <GlassCard
            key={i}
            className={`p-8 w-full ${plan.popular ? 'border-brand-teal/50 bg-brand-teal/5' : ''}`}
            hoverEffect={true}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-brand-teal text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                MOST POPULAR
              </div>
            )}
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              <span className="text-slate-500">/shoot</span>
            </div>
            <p className="text-brand-gold font-bold mb-6">{plan.credits}</p>

            <ul className="space-y-4 mb-8">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={16} className="text-brand-teal" /> {f}
                </li>
              ))}
            </ul>

            <button className={`w-full py-3 rounded-xl font-bold transition-colors ${plan.popular ? 'bg-brand-teal text-black hover:bg-brand-teal/90' : 'bg-white/10 hover:bg-white/20'}`}>
              Get Started
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
