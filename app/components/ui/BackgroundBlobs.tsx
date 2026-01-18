import React from 'react';

export const BackgroundBlobs: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top Left - Teal */}
      <div
        className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-brand-teal/20 rounded-full mix-blend-screen blur-[100px] animate-blob"
      />

      {/* Top Right - Blue/Cyan */}
      <div
        className="absolute top-[10%] right-[-10%] w-[400px] h-[400px] bg-cyan-600/20 rounded-full mix-blend-screen blur-[100px] animate-blob animation-delay-2000"
      />

      {/* Bottom Left - Gold/Orange */}
      <div
        className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-brand-gold/10 rounded-full mix-blend-screen blur-[120px] animate-blob animation-delay-4000"
      />

      {/* Center - Slate/Indigo */}
      <div
        className="absolute top-[40%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-800/20 rounded-full mix-blend-overlay blur-[80px]"
      />
    </div>
  );
};
