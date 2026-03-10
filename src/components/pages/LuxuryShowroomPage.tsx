import { useEffect, useState, useRef } from 'react';
import { useMember } from '@/integrations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { Image } from '@/components/ui/image';

interface ShowroomItem {
  id: string;
  name: string;
  label: string;
  image: string;
  description: string;
  level: 'top' | 'bottom';
}

const showroomItems: ShowroomItem[] = [
  // Top Level - Vehicles
  {
    id: 'sports-car',
    name: 'Carro Esportivo',
    label: 'CARRO',
    image: 'https://static.wixstatic.com/media/50f4bf_1ff5b2bd9c5344709eb2bb2f1dd12971~mv2.png?originWidth=384&originHeight=384',
    description: 'Velocidade e elegância em perfeita harmonia',
    level: 'top',
  },
  {
    id: 'yacht',
    name: 'Lancha de Luxo',
    label: 'LANCHA',
    image: 'https://static.wixstatic.com/media/50f4bf_e9b8720779ee4c209dd14d1c99f96ae5~mv2.png?originWidth=384&originHeight=384',
    description: 'Navegue em estilo pelos mares mais exclusivos',
    level: 'top',
  },
  {
    id: 'helicopter',
    name: 'Helicóptero Executivo',
    label: 'HELICÓPTERO',
    image: 'https://static.wixstatic.com/media/50f4bf_a614b4859a9b46d3845eb5d9cc54e9e3~mv2.png?originWidth=384&originHeight=384',
    description: 'Voe acima das limitações',
    level: 'top',
  },
  {
    id: 'jet',
    name: 'Jatinho Executivo',
    label: 'JATINHO',
    image: 'https://static.wixstatic.com/media/50f4bf_18890e07f9ee4c6f9c9f3047aac7655c~mv2.png?originWidth=384&originHeight=384',
    description: 'Liberdade sem fronteiras',
    level: 'top',
  },
  // Bottom Level - Properties & Jewelry
  {
    id: 'penthouse',
    name: 'Cobertura Exclusiva',
    label: 'COBERTURA',
    image: 'https://static.wixstatic.com/media/50f4bf_83eb2774ce0945a0aab4993e3f078351~mv2.png?originWidth=384&originHeight=384',
    description: 'Vistas panorâmicas da cidade',
    level: 'bottom',
  },
  {
    id: 'mansion',
    name: 'Mansão de Luxo',
    label: 'MANSÃO',
    image: 'https://static.wixstatic.com/media/50f4bf_b3abc23bbc484774a97e0ea3129d0e5d~mv2.png?originWidth=384&originHeight=384',
    description: 'Arquitetura clássica e conforto moderno',
    level: 'bottom',
  },
  {
    id: 'island',
    name: 'Ilha Privada',
    label: 'ILHA',
    image: 'https://static.wixstatic.com/media/50f4bf_30b430890dea47d397e4e27bc2caf719~mv2.png?originWidth=384&originHeight=384',
    description: 'Seu paraíso particular',
    level: 'bottom',
  },
  {
    id: 'casino',
    name: 'Cassino Privado',
    label: 'CASSINO',
    image: 'https://static.wixstatic.com/media/50f4bf_ba5dedb047b640ebaad4925e937b0733~mv2.png?originWidth=384&originHeight=384',
    description: 'Entretenimento de classe mundial',
    level: 'bottom',
  },
];

export default function LuxuryShowroomPage() {
  const { member } = useMember();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [npcLookingAt, setNpcLookingAt] = useState<'camera' | 'idle'>('idle');
  const audioRef = useRef<HTMLAudioElement>(null);

  const playerName = member?.profile?.nickname || member?.contact?.firstName || 'Visitante';

  useEffect(() => {
    // Show welcome message after a brief delay
    const timer = setTimeout(() => {
      setShowWelcome(true);
      setNpcLookingAt('camera');
      // Reset NPC gaze after 3 seconds
      setTimeout(() => {
        setNpcLookingAt('idle');
      }, 3000);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const npcArea = document.getElementById('npc-area');
    if (npcArea) {
      const rect = npcArea.getBoundingClientRect();
      const distance = Math.sqrt(
        Math.pow(e.clientX - (rect.left + rect.width / 2), 2) +
        Math.pow(e.clientY - (rect.top + rect.height / 2), 2)
      );
      if (distance < 300) {
        setNpcLookingAt('camera');
      } else {
        setNpcLookingAt('idle');
      }
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const topItems = showroomItems.filter((item) => item.level === 'top');
  const bottomItems = showroomItems.filter((item) => item.level === 'bottom');

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black"
      onMouseMove={handleMouseMove}
    >
      <Header />

      {/* Welcome Message */}
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none"
        >
          <div className="text-center">
            <p className="font-heading text-2xl md:text-3xl text-amber-100 drop-shadow-lg">
              Bem-vindo à Sua Vitrine Exclusiva,{' '}
              <span className="text-amber-300 font-bold">{playerName}</span>
            </p>
            <p className="font-paragraph text-sm md:text-base text-amber-200/70 mt-2">
              Descubra experiências de luxo incomparáveis
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="relative w-full max-w-[120rem] mx-auto px-4 md:px-8 py-12 md:py-20">
        {/* Showroom Container */}
        <div className="relative">
          {/* Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Wood texture background */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-950/20 via-transparent to-amber-950/20 rounded-lg" />
            {/* Lighting effect */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
          </div>

          {/* Showroom Glass Shelves */}
          <div className="relative z-10">
            {/* Top Level Shelf */}
            <div className="mb-16 md:mb-24">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                {topItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="group relative"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Item Container */}
                    <div className="relative bg-gradient-to-br from-slate-900 to-black rounded-lg overflow-hidden border border-amber-900/30 shadow-2xl">
                      {/* Glass shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                      {/* Image */}
                      <div className="aspect-square overflow-hidden bg-black">
                        <Image src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>

                      {/* Hover Overlay */}
                      {hoveredItem === item.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4"
                        >
                          <p className="text-amber-100 text-xs md:text-sm font-paragraph">
                            {item.description}
                          </p>
                          <p className="text-amber-300 text-xs mt-2 font-heading">
                            Clique para saber mais →
                          </p>
                        </motion.div>
                      )}

                      {/* Glow effect on hover */}
                      {hoveredItem === item.id && (
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
                      )}
                    </div>

                    {/* Label */}
                    <div className="mt-3 text-center">
                      <p className="font-heading text-xs md:text-sm text-amber-200 tracking-widest">
                        {item.label}
                      </p>
                      <p className="font-paragraph text-xs text-amber-100/60 mt-1">
                        {item.name}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Shelf divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-amber-700/30 to-transparent my-12 md:my-16" />
            </div>

            {/* Bottom Level Shelf */}
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {bottomItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="group relative"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Item Container */}
                    <div className="relative bg-gradient-to-br from-slate-900 to-black rounded-lg overflow-hidden border border-amber-900/30 shadow-2xl">
                      {/* Glass shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                      {/* Image */}
                      <div className="aspect-square overflow-hidden bg-black">
                        <Image src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>

                      {/* Hover Overlay */}
                      {hoveredItem === item.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4"
                        >
                          <p className="text-amber-100 text-xs md:text-sm font-paragraph">
                            {item.description}
                          </p>
                          <p className="text-amber-300 text-xs mt-2 font-heading">
                            Clique para saber mais →
                          </p>
                        </motion.div>
                      )}

                      {/* Glow effect on hover */}
                      {hoveredItem === item.id && (
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
                      )}
                    </div>

                    {/* Label */}
                    <div className="mt-3 text-center">
                      <p className="font-heading text-xs md:text-sm text-amber-200 tracking-widest">
                        {item.label}
                      </p>
                      <p className="font-paragraph text-xs text-amber-100/60 mt-1">
                        {item.name}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* NPC Area - Positioned behind items */}
          <div
            id="npc-area"
            className="absolute bottom-0 right-0 w-full md:w-1/3 h-96 md:h-full pointer-events-none z-0"
          >
            <motion.div
              animate={{
                opacity: npcLookingAt === 'camera' ? 1 : 0.8,
              }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-full flex items-end justify-end"
            >
              {/* NPC Placeholder - Elegant background element */}
              <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-l from-amber-900/10 via-transparent to-transparent rounded-lg" />

              {/* Decorative elements around NPC area */}
              <div className="absolute bottom-8 right-8 w-24 h-32 bg-gradient-to-t from-amber-700/20 to-transparent rounded-lg border border-amber-700/30" />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Music Control */}
      <motion.button
        onClick={toggleMusic}
        className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-amber-900/40 hover:bg-amber-900/60 border border-amber-700/50 transition-all duration-300 text-amber-200 hover:text-amber-100"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isMusicPlaying ? (
          <Volume2 size={20} />
        ) : (
          <VolumeX size={20} />
        )}
      </motion.button>

      {/* Background Music */}
      <audio
        ref={audioRef}
        loop
        className="hidden"
      >
        <source
          src="https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.mp3"
          type="audio/mpeg"
        />
      </audio>

      <Footer />
    </div>
  );
}
