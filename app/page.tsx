"use client";
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SocialProof } from './components/SocialProof';
import { BeforeAfter } from './components/BeforeAfter';
import { FeaturesBento } from './components/FeaturesBento';
import { HowItWorks } from './components/HowItWorks';
import { Comparison } from './components/Comparison';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { BackgroundBlobs } from './components/ui/BackgroundBlobs';
import { ParticleBackground } from './components/ui/ParticleBackground';

const App: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Set dark background for landing page
    document.body.style.backgroundColor = '#020617';
    document.body.style.color = 'white';

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-brand-teal selection:text-black" style={{ width: '100%', overflowX: 'hidden' }}>
      {/* Background Ambience */}
      <BackgroundBlobs />
      <ParticleBackground />

      {/* Main Content */}
      <div className="relative z-10" style={{ width: '100%' }}>
        <Navbar scrollY={scrollY} />

        <main style={{ display: 'flex', flexDirection: 'column', gap: '6rem', paddingBottom: '5rem', width: '100%' }}>
          <section id="home" style={{ width: '100%' }}>
            <Hero />
          </section>

          <section id="social-proof" style={{ width: '100%' }}>
            <SocialProof />
          </section>

          <section id="how-it-works" className="px-4 md:px-8 w-full bg-gradient-to-b from-transparent via-slate-900/50 to-transparent py-20">
             <HowItWorks />
          </section>

          <section id="showcase" style={{ width: '100%' }}>
            <BeforeAfter />
          </section>

          <section id="features" className="px-4 md:px-8" style={{ maxWidth: '80rem', margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center', maxWidth: '48rem', margin: '0 auto 3rem', width: '100%' }}>
              <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4">
                Beyond Standard Filters
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1.125rem', lineHeight: '1.75', width: '100%' }}>
                Powered by proprietary Character DNA™ technology, we don&apos;t just generate images. We generate <span className="text-brand-teal font-semibold">you</span>.
              </p>
            </div>
            <FeaturesBento />
          </section>

          <section id="pricing" className="px-4 md:px-8 w-full">
            <Pricing />
          </section>

          <section id="comparison" className="px-4 md:px-8" style={{ maxWidth: '64rem', margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center', maxWidth: '42rem', margin: '0 auto 3rem', width: '100%' }}>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Directr?</h2>
              <p style={{ color: '#94a3b8', fontSize: '1.125rem', lineHeight: '1.75', width: '100%' }}>See how we stack up against traditional photography.</p>
            </div>
            <Comparison />
          </section>

          <section id="faq" className="px-4 md:px-8 w-full">
            <FAQ />
          </section>

          <section id="cta" className="px-4 md:px-8 mb-20" style={{ maxWidth: '56rem', margin: '0 auto', marginBottom: '5rem', width: '100%' }}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-teal to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative px-8 py-16 bg-slate-900 ring-1 ring-gray-900/5 rounded-2xl leading-none border border-white/10">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '32rem', margin: '0 auto', width: '100%' }}>
                  <h2 className="text-4xl font-bold mb-6">Ready for your closeup?</h2>
                  <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1.125rem', lineHeight: '1.75', width: '100%' }}>
                    Join thousands of creators, professionals, and brands creating studio-quality content from their bedroom.
                  </p>
                  <button className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                    Start Your Photoshoot
                  </button>
                  <p className="mt-4 text-xs text-slate-500">No credit card required for preview.</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default App;
