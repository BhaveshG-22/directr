"use client";
import React from 'react';
import { Camera, Menu } from 'lucide-react';

interface NavbarProps {
  scrollY: number;
}

export const Navbar: React.FC<NavbarProps> = ({ scrollY }) => {
  const isScrolled = scrollY > 50;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`
          flex items-center justify-between px-6 py-3 rounded-full transition-all duration-300
          ${isScrolled
            ? 'bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-lg'
            : 'bg-transparent border border-transparent'}
        `}>
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-brand-teal to-cyan-500 p-2 rounded-lg">
              <Camera size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">DIRECTR</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#showcase" className="hover:text-white transition-colors">Showcase</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
             <button className="text-sm font-semibold text-white hover:text-brand-teal transition-colors">
              Login
            </button>
            <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-200 transition-colors">
              Get Started
            </button>
          </div>

          {/* Mobile Menu */}
          <button className="md:hidden text-white p-2">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};
