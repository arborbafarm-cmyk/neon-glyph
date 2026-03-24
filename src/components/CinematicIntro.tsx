import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CinematicIntro() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Show title after 3 seconds
    const titleTimer = setTimeout(() => {
      setShowTitle(true);
    }, 3000);

    return () => clearTimeout(titleTimer);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://video.wixstatic.com/video/50f4bf_570bf5fe87734b1cb3523fd958acce0e/720p/mp4/file.mp4" type="video/mp4" />
      </video>

      {/* Cinematic title with professional styling */}
      <AnimatePresence>
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="relative text-center">
              {/* Cinematic bars effect */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute -top-20 left-0 right-0 h-16 bg-gradient-to-b from-black via-black to-transparent"
              />
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute -bottom-20 left-0 right-0 h-16 bg-gradient-to-t from-black via-black to-transparent"
              />

              {/* Main title with cinematic styling */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                className="font-heading text-7xl md:text-9xl font-black text-center"
                style={{
                  color: '#ffffff',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
                }}
              >
                Dominio do
                <br />
                Comando
              </motion.h1>

              {/* Subtitle with fade-in */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="font-paragraph text-xl md:text-2xl mt-6"
                style={{
                  color: '#cccccc',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                A Ascensão Começa
              </motion.p>

              {/* Cinematic line accent */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vignette effect for cinematic atmosphere */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
      }} />
    </div>
  );
}
