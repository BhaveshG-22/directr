"use client"
import React, { useEffect, useRef } from 'react';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to center
      targetMouseX = (e.clientX - window.innerWidth / 2) * 0.05; 
      targetMouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init(); // Re-init on resize to maintain proper density
    };

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      opacitySpeed: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 0.1;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.opacitySpeed = (Math.random() - 0.5) * 0.005;
      }

      update() {
        // Continuous flow
        this.baseX += this.speedX;
        this.baseY += this.speedY;

        // Wrap around logic for base coordinates
        if (this.baseX > canvas!.width) this.baseX = 0;
        else if (this.baseX < 0) this.baseX = canvas!.width;
        
        if (this.baseY > canvas!.height) this.baseY = 0;
        else if (this.baseY < 0) this.baseY = canvas!.height;

        // Smooth Mouse Parallax
        // Interpolate current mouse influence towards target
        mouseX += (targetMouseX - mouseX) * 0.1;
        mouseY += (targetMouseY - mouseY) * 0.1;

        // Apply parallax based on size (simulating depth)
        // Larger particles move more (appear closer)
        const parallaxX = mouseX * this.size * 0.5;
        const parallaxY = mouseY * this.size * 0.5;

        this.x = this.baseX + parallaxX;
        this.y = this.baseY + parallaxY;

        // Twinkle Effect
        this.opacity += this.opacitySpeed;
        if (this.opacity > 0.8 || this.opacity < 0.1) {
          this.opacitySpeed *= -1;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      // Density: ~1 particle per 5000 pixels
      const density = 5000; 
      const numberOfParticles = Math.floor((canvas.width * canvas.height) / density);
      
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    // Initial setup
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};