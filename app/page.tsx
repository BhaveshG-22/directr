"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px] transition-all duration-1000 ease-out"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
            left: `${mousePosition.x - 20}%`,
            top: `${mousePosition.y - 20}%`,
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px]"
          style={{
            background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)",
            right: "10%",
            top: "20%",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
          style={{
            background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
            left: "20%",
            bottom: "10%",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <span className="text-xl font-bold text-black">D</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Directr</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <Link
          href="/studio"
          className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium hover:bg-white/20 transition-all hover:scale-105"
        >
          Launch Studio
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32 md:px-12 lg:px-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm text-gray-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Powered by AI Character Consistency
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-6">
          Professional Photos
          <br />
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-transparent">
            Without the Photographer
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-12 leading-relaxed">
          Upload your selfies, and our AI generates stunning professional photoshoots
          in any style. Perfect consistency. Infinite possibilities.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/studio"
            className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold text-lg hover:scale-105 transition-all shadow-lg shadow-orange-500/25"
          >
            Start Creating Free
            <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition-all"
          >
            See How It Works
          </a>
        </div>

        {/* Hero Image Placeholder */}
        <div className="relative mt-20 max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10 pointer-events-none" />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm p-2">
            <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="grid grid-cols-4 gap-3 p-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center"
                    >
                      <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 text-sm">Your AI-generated photoshoot appears here</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Bento Grid */}
      <section id="features" className="relative z-10 px-6 py-24 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Professional photoshoots powered by cutting-edge AI technology
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Large Feature Card */}
          <div className="md:col-span-2 lg:col-span-2 group relative rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/10 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Character DNA Technology</h3>
              <p className="text-gray-400 leading-relaxed">
                Our proprietary AI analyzes 100+ facial attributes from your photos to create a unique
                "Character DNA" profile. This ensures perfect consistency across all generated images -
                you'll always look like you.
              </p>
            </div>
          </div>

          {/* Small Feature Card */}
          <div className="group relative rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">98+ Scene Styles</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              From urban streets to luxury studios, nature portraits to fashion editorials. Choose your vibe.
            </p>
          </div>

          {/* Small Feature Card */}
          <div className="group relative rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">5 Unique Variations</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Each scene generates 5 different poses, angles, and expressions. More variety, less repetition.
            </p>
          </div>

          {/* Small Feature Card */}
          <div className="group relative rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">AI Quality Scoring</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Every image is scored for similarity, face match, and quality. Know exactly which shots are perfect.
            </p>
          </div>

          {/* Medium Feature Card */}
          <div className="lg:col-span-2 group relative rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/10 transition-all">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Smart Face Swap</h3>
                <p className="text-gray-400 leading-relaxed">
                  If the AI-generated face isn't quite right, our intelligent face swap technology can fix it
                  automatically. Perfect results, every time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 px-6 py-24 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            From selfies to stunning photoshoots in 5 simple steps
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {[
            {
              step: "01",
              title: "Upload Your Photos",
              description: "Upload 10+ photos of yourself. Different angles and lighting help our AI understand your unique features.",
              gradient: "from-amber-400 to-orange-500",
            },
            {
              step: "02",
              title: "AI Creates Your Character DNA",
              description: "Our AI analyzes your photos and extracts 100+ facial attributes to create a unique profile that ensures consistency.",
              gradient: "from-cyan-400 to-blue-500",
            },
            {
              step: "03",
              title: "Choose Your Scene Style",
              description: "Browse 98+ professionally designed scene styles - from urban streets to luxury studios, nature to fashion editorial.",
              gradient: "from-purple-400 to-pink-500",
            },
            {
              step: "04",
              title: "Generate Variations",
              description: "AI creates 5 unique variations with different poses, angles, and expressions while maintaining your likeness.",
              gradient: "from-green-400 to-emerald-500",
            },
            {
              step: "05",
              title: "Download & Share",
              description: "Review AI quality scores, apply face swap if needed, and download your professional photos ready for any platform.",
              gradient: "from-rose-400 to-red-500",
            },
          ].map((item, index) => (
            <div key={index} className="flex gap-6 mb-8 group">
              <div className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-black font-bold text-lg`}>
                  {item.step}
                </div>
                {index < 4 && (
                  <div className="w-px h-full bg-gradient-to-b from-white/20 to-transparent mt-4" />
                )}
              </div>
              <div className="flex-1 pb-8">
                <h3 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 px-6 py-24 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple Pricing
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className="rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/10 transition-all">
            <div className="text-sm text-gray-400 mb-2">Free</div>
            <div className="text-4xl font-bold mb-1">$0</div>
            <div className="text-gray-500 text-sm mb-6">Forever free</div>
            <ul className="space-y-3 mb-8">
              {["1 photoshoot/month", "Basic scene styles", "Standard quality", "Community support"].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/studio"
              className="block w-full py-3 rounded-full border border-white/20 text-center font-medium hover:bg-white/5 transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Creator Tier */}
          <div className="relative rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm border border-amber-500/30 p-8 scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold">
              POPULAR
            </div>
            <div className="text-sm text-amber-400 mb-2">Creator</div>
            <div className="text-4xl font-bold mb-1">$24.99</div>
            <div className="text-gray-500 text-sm mb-6">per month</div>
            <ul className="space-y-3 mb-8">
              {["10 photoshoots/month", "All 98+ premium styles", "HD quality exports", "Face swap included", "Priority generation"].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/studio"
              className="block w-full py-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black text-center font-semibold hover:scale-105 transition-all"
            >
              Start Creating
            </Link>
          </div>

          {/* Professional Tier */}
          <div className="rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/10 transition-all">
            <div className="text-sm text-gray-400 mb-2">Professional</div>
            <div className="text-4xl font-bold mb-1">$59.99</div>
            <div className="text-gray-500 text-sm mb-6">per month</div>
            <ul className="space-y-3 mb-8">
              {["30 photoshoots/month", "All premium styles", "4K quality exports", "Priority support", "API access"].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/studio"
              className="block w-full py-3 rounded-full border border-white/20 text-center font-medium hover:bg-white/5 transition-all"
            >
              Go Professional
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 p-12 md:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to Transform Your Photos?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of creators using AI to generate stunning professional photoshoots.
              </p>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold text-lg hover:scale-105 transition-all shadow-lg shadow-orange-500/25"
              >
                Launch Studio
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 md:px-12 lg:px-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-sm font-bold text-black">D</span>
            </div>
            <span className="font-bold">Directr</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-sm text-gray-500">
            © 2025 Directr. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
