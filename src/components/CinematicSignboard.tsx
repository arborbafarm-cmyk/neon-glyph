import React, { useEffect, useState } from 'react';

export default function PowerLogo() {
  const [glitch, setGlitch] = useState(false);

    useEffect(() => {
        // Efeito de interferência aleatória (flicker) para parecer energia de favela
            const interval = setInterval(() => {
                  setGlitch(true);
                        setTimeout(() => setGlitch(false), 100);
                            }, 3000);
                                return () => clearInterval(interval);
                                  }, []);

                                    return (
                                        <div className="flex h-screen w-full items-center justify-center bg-black overflow-hidden font-sans">
                                              <div className="relative group scale-110 md:scale-150">

                                                              {/* Sombra de Brilho de Fundo (Glow) */}
                                                                      <div className="absolute -inset-2 bg-gradient-to-r from-yellow-600 to-cyan-500 rounded-lg blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                                                                              {/* Letreiro Principal */}
                                                                                      <h1 className={`relative text-center font-black tracking-tighter leading-none transition-all duration-75 ${glitch ? 'skew-x-12 opacity-80' : ''}`}>

                                                                                                          {/* Texto de preenchimento - Estilo Metal Escovado */}
                                                                                                                    <span className="block text-6xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white via-yellow-400 to-yellow-700 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                                                                                                                                COMPLEXO 1
                                                                                                                                          </span>

                                                                                                                                                              <span className="block text-4xl md:text-6xl text-cyan-400 mt-2 tracking-[0.2em] uppercase italic drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
                                                                                                                                                                          DO COMANDO NORTE
                                                                                                                                                                                    </span>
                                                                                                                                                                                            </h1>

                                                                                                                                                                                                    {/* Linhas de Varredura Estilo HUD/Militar */}
                                                                                                                                                                                                            <div className="absolute inset-0 pointer-events-none border-y border-white/10 h-full w-full animate-pulse"></div>
                                                                                                                                                                                                                  </div>

                                                                                                                                                                                                                        <style jsx>{`
                                                                                                                                                                                                                                @keyframes entrance {
                                                                                                                                                                                                                                          0% { transform: scale(0.5); opacity: 0; filter: brightness(3); }
                                                                                                                                                                                                                                                    80% { transform: scale(1.1); opacity: 1; filter: brightness(1.5); }
                                                                                                                                                                                                                                                              100% { transform: scale(1); opacity: 1; filter: brightness(1); }
                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                              h1 {
                                                                                                                                                                                                                                                                                        animation: entrance 1.2s cubic-bezier(0.17, 0.89,0.32, 1.28);
                                                                                                                                                                                                                                                                                                  text-shadow: 2px 2px 0px #444, 4px 4px 0px #000;
                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                `}</style>
                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                                                                                      }
