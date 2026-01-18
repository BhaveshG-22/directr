import React from 'react';
import { Camera, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-black/40 backdrop-blur-md pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-1.5 rounded-lg">
                <Camera size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">DIRECTR</span>
            </div>
            <p className="text-slate-500 text-sm">
              The AI-powered virtual photoshoot platform for creators, professionals, and brands.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Showcase</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
            </ul>
            <div className="flex gap-4 mt-6">
              <Twitter size={18} className="text-slate-400 hover:text-white cursor-pointer" />
              <Instagram size={18} className="text-slate-400 hover:text-white cursor-pointer" />
              <Linkedin size={18} className="text-slate-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Directr AI Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};