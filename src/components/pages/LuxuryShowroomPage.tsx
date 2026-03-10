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
  const audioRef = useRef<HTMLAudioElement>(null);

  const playerName = member?.profile?.nickname || member?.contact?.firstName || 'Visitante';

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black">
      <Header />

      {/* Welcome Message */}
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none"
        >
          <div className="text-center">
            <p className="font-heading text-2xl md:text-3xl text-amber-100">
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
      <main className="relative w-full max-w-[120rem] mx-auto px-4 md:px-8 py-8 md:py-16">
        {/* Showroom Container - Centered with NPC in foreground */}
        <div className="relative flex items-center justify-center min-h-[600px] md:min-h-[700px]">
          {/* Background Curtains & Lighting */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Vertical curtain lines */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800/30 via-transparent to-slate-800/30" />
            {/* Top lighting */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-64 bg-gradient-to-b from-amber-600/10 to-transparent blur-3xl" />
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-radial-gradient from-amber-900/5 to-transparent" />
          </div>

          {/* Vitrines Container - Behind NPC */}
          <div className="relative z-0 w-full">
            {/* Top Level Shelf */}
            <div className="mb-12 md:mb-20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 px-4 md:px-12">
                {topItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Glass Shelf Container */}
                    <div className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/60 rounded-lg overflow-hidden border border-amber-700/40 shadow-2xl backdrop-blur-sm">
                      {/* Glass shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent pointer-events-none" />

                      {/* Shelf lighting */}
                      <div className="absolute -top-1 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

                      {/* Image */}
                      <div className="aspect-square overflow-hidden bg-black/50">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      </div>

                      {/* Hover Overlay */}
                      {hoveredItem === item.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4"
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
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 to-transparent pointer-events-none" />
                      )}
                    </div>

                    {/* Label - Below shelf */}
                    <div className="mt-2 text-center">
                      <p className="font-heading text-xs md:text-sm text-gray-300 tracking-widest uppercase">
                        {item.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Shelf divider line */}
              <div className="h-px bg-gradient-to-r from-transparent via-amber-700/40 to-transparent my-10 md:my-16 mx-4 md:mx-12" />
            </div>

            {/* Bottom Level Shelf */}
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 px-4 md:px-12">
                {bottomItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index + 4) * 0.1 }}
                    className="group relative"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Glass Shelf Container */}
                    <div className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/60 rounded-lg overflow-hidden border border-amber-700/40 shadow-2xl backdrop-blur-sm">
                      {/* Glass shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent pointer-events-none" />

                      {/* Shelf lighting */}
                      <div className="absolute -top-1 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

                      {/* Image */}
                      <div className="aspect-square overflow-hidden bg-black/50">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      </div>

                      {/* Hover Overlay */}
                      {hoveredItem === item.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4"
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
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 to-transparent pointer-events-none" />
                      )}
                    </div>

                    {/* Label - Below shelf */}
                    <div className="mt-2 text-center">
                      <p className="font-heading text-xs md:text-sm text-gray-300 tracking-widest uppercase">
                        {item.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* NPC Area - Centered in foreground */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-32 md:w-48 h-64 md:h-96"
            >
              {/* NPC Figure - Elegant silhouette */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Dress silhouette */}
                <div className="relative w-24 md:w-32 h-56 md:h-80">
                  {/* Head */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 md:w-8 h-6 md:h-8 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full shadow-lg" />
                  
                  {/* Hair */}
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-7 md:w-9 h-8 md:h-10 bg-gradient-to-b from-slate-900 to-slate-800 rounded-full shadow-lg" />
                  
                  {/* Dress body - Red gradient */}
                  <div className="absolute top-8 md:top-12 left-1/2 transform -translate-x-1/2 w-20 md:w-28 h-40 md:h-56 bg-gradient-to-b from-red-700 via-red-600 to-red-800 rounded-b-3xl shadow-2xl">
                    {/* Dress shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 rounded-b-3xl" />
                  </div>

                  {/* Arms */}
                  <div className="absolute top-10 md:top-14 left-0 w-3 md:w-4 h-32 md:h-44 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full shadow-lg transform -rotate-12" />
                  <div className="absolute top-10 md:top-14 right-0 w-3 md:w-4 h-32 md:h-44 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full shadow-lg transform rotate-12" />
                </div>
              </div>

              {/* Glow effect around NPC */}
              <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 via-transparent to-transparent rounded-full blur-2xl" />
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
