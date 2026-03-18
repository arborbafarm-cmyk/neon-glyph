import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function StarMapPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create animated starfield background
    const canvas = document.getElementById('starfield-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create stars with pulsing effect
    interface Star {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      pulseSpeed: number;
      pulsePhase: number;
    }

    const stars: Star[] = [];
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Create nebula clouds
    interface Nebula {
      x: number;
      y: number;
      size: number;
      opacity: number;
      color: string;
      offsetX: number;
      offsetY: number;
      speed: number;
    }

    const nebulas: Nebula[] = [
      {
        x: canvas.width * 0.3,
        y: canvas.height * 0.2,
        size: 400,
        opacity: 0.15,
        color: '#6b4ce6',
        offsetX: 0,
        offsetY: 0,
        speed: 0.0005,
      },
      {
        x: canvas.width * 0.7,
        y: canvas.height * 0.6,
        size: 500,
        opacity: 0.12,
        color: '#1e90ff',
        offsetX: 0,
        offsetY: 0,
        speed: 0.0003,
      },
      {
        x: canvas.width * 0.5,
        y: canvas.height * 0.8,
        size: 350,
        opacity: 0.1,
        color: '#00eaff',
        offsetX: 0,
        offsetY: 0,
        speed: 0.0004,
      },
    ];

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += 1;

      // Clear canvas with dark background
      ctx.fillStyle = 'rgba(15, 20, 30, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebulas with gradient
      nebulas.forEach((nebula) => {
        nebula.offsetX += nebula.speed;
        nebula.offsetY += nebula.speed * 0.5;

        const gradient = ctx.createRadialGradient(
          nebula.x + nebula.offsetX,
          nebula.y + nebula.offsetY,
          0,
          nebula.x + nebula.offsetX,
          nebula.y + nebula.offsetY,
          nebula.size
        );

        gradient.addColorStop(0, nebula.color);
        gradient.addColorStop(0.5, nebula.color + '80');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.globalAlpha = nebula.opacity;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      });

      // Draw pulsing stars
      stars.forEach((star) => {
        const pulse = Math.sin(time * star.pulseSpeed + star.pulsePhase) * 0.5 + 0.5;
        const finalOpacity = star.opacity * (pulse * 0.7 + 0.3);

        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * (pulse * 0.5 + 0.7), 0, Math.PI * 2);
        ctx.fill();

        // Add subtle glow
        ctx.strokeStyle = `rgba(0, 234, 255, ${finalOpacity * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-background overflow-hidden">
      {/* Animated Starfield Background */}
      <canvas
        id="starfield-canvas"
        className="fixed top-0 left-0 w-full h-full z-0"
        style={{ display: 'block' }}
      />

      {/* Video Background Overlay (for future video integration) */}
      <div className="fixed top-0 left-0 w-full h-full z-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />

      {/* Content */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        <Header />

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="w-full max-w-4xl"
          >
            {/* Central Content Container */}
            <div className="backdrop-blur-md bg-background/30 border border-subtitle-neon-blue/20 rounded-2xl p-8 md:p-16 text-center">
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-heading text-5xl md:text-7xl font-bold text-foreground mb-4 tracking-wider"
                style={{
                  textShadow: '0 0 20px rgba(0, 234, 255, 0.3)',
                }}
              >
                EXPLORE O COSMOS
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="font-paragraph text-lg md:text-xl text-subtitle-neon-blue mb-12 tracking-wide"
              >
                Descubra um universo interativo de possibilidades infinitas
              </motion.p>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="h-1 bg-gradient-to-r from-transparent via-subtitle-neon-blue to-transparent mb-12"
              />

              {/* 3D Model Container */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="w-full aspect-video md:aspect-square max-h-[600px] rounded-xl border-2 border-subtitle-neon-blue/40 bg-background/50 backdrop-blur-sm flex items-center justify-center overflow-hidden"
              >
                {/* IFrame Container for Custom HTML/3D Model */}
                <div
                  id="holographic-container"
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(0, 234, 255, 0.05) 0%, transparent 70%)',
                  }}
                >
                  {/* Placeholder for custom IFrame */}
                  <div className="text-center">
                    <div className="text-subtitle-neon-blue/50 font-paragraph text-sm md:text-base">
                      Insira seu modelo 3D e grade holográfica aqui
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Animated Border Glow */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0, 234, 255, 0.2)',
                    '0 0 40px rgba(0, 234, 255, 0.4)',
                    '0 0 20px rgba(0, 234, 255, 0.2)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-xl pointer-events-none"
              />
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-20 -left-20 w-40 h-40 bg-subtitle-neon-blue/5 rounded-full blur-3xl pointer-events-none"
            />
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-20 -right-20 w-40 h-40 bg-logo-gradient-start/5 rounded-full blur-3xl pointer-events-none"
            />
          </motion.div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
