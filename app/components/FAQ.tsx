import React from 'react';
import { GlassCard } from './ui/GlassCard';

const faqs = [
  {
    q: "How do you maintain likeness across photos?",
    a: "We use our proprietary Character DNA™ technology. Unlike standard filters, we analyze over 100 facial attributes including micro-expressions and bone structure to create a consistent digital twin before generating any scenes."
  },
  {
    q: "How long does generation take?",
    a: "Once you upload your photos, the initial training takes about 20 minutes. After that, generating new photos in any style takes less than 60 seconds."
  },
  {
    q: "Do I own the photos?",
    a: "Yes. You have full commercial ownership of all generated images. You can use them for LinkedIn, your website, marketing materials, or even sell them."
  },
  {
    q: "What if I don't like the results?",
    a: "We offer a satisfaction guarantee. If the AI doesn't capture your likeness accurately, our support team will help you refine the model or offer a refund."
  }
];

export const FAQ: React.FC = () => {
  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto', width: '100%', padding: '0 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {faqs.map((faq, i) => (
          <GlassCard key={i} className="p-6" style={{ width: '100%' }}>
            <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.625', fontSize: '1rem', width: '100%' }}>{faq.a}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};