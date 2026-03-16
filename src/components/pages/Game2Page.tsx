import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  destination?: string;
}

export default function Game2Page() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([
    'https://static.wixstatic.com/media/50f4bf_6b3cb68c68a7486f93b1696d52192e7d~mv2.png',
  ]);
  const [isAddingHotspots, setIsAddingHotspots] = useState(false);
  const [hotspots, setHotspots] = useState<Hotspot[]>([
    {
      id: 'barraco-point',
      x: 50,
      y: 50,
      destination: 'barraco',
    },
  ]);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Method to update the image during gameplay
  const updateGameImage = (imageUrl: string) => {
    setImages(prev => [...prev, imageUrl]);
    setCurrentImageIndex(prev => prev + 1);
  };

  // Expose the update method globally for game logic to use
  useEffect(() => {
    (window as any).updateGame2Image = updateGameImage;
    return () => {
      delete (window as any).updateGame2Image;
    };
  }, []);

  const currentImage = images[currentImageIndex] || images[0];

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingHotspots) return;

    const container = imageContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newHotspot: Hotspot = {
      id: crypto.randomUUID(),
      x,
      y,
      destination: 'barraco',
    };

    setHotspots(prev => [...prev, newHotspot]);
    setSelectedHotspotId(newHotspot.id);
  };

  const removeHotspot = (id: string) => {
    setHotspots(prev => prev.filter(h => h.id !== id));
  };

  const toggleAddingHotspots = () => {
    setIsAddingHotspots(!isAddingHotspots);
  };

  const clearAllHotspots = () => {
    setHotspots([]);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-black">
      {/* Image Container */}
      <div
        ref={imageContainerRef}
        className={`flex-1 flex items-center justify-center overflow-hidden relative ${
          isAddingHotspots ? 'cursor-crosshair' : 'cursor-default'
        }`}
        onClick={handleImageClick}
      >
        <Image
          src={currentImage}
          alt="Game 2 Scene"
          className="w-full h-full object-contain"
          width={1080}
          height={1920}
        />

        {/* Hotspots Visualization */}
        {hotspots.map(hotspot => (
          <div
            key={hotspot.id}
            className="absolute w-8 h-8 bg-red-500 rounded-full border-2 border-red-300 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (hotspot.destination) {
                navigate(`/${hotspot.destination}`);
              }
            }}
            title={`Clique para ir para ${hotspot.destination || 'destino'}`}
          >
            <X className="w-4 h-4 text-white" />
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="bg-gray-900 border-t border-gray-700 p-4 flex gap-3 justify-center items-center flex-wrap">
        <Button
          onClick={toggleAddingHotspots}
          className={`flex items-center gap-2 ${
            isAddingHotspots
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-primary hover:bg-orange-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          {isAddingHotspots ? 'Cancelar Adição' : 'Adicionar Pontos Clicáveis'}
        </Button>

        {hotspots.length > 0 && (
          <>
            <span className="text-white text-sm">
              {hotspots.length} ponto{hotspots.length !== 1 ? 's' : ''} adicionado{hotspots.length !== 1 ? 's' : ''}
            </span>
            <Button
              onClick={clearAllHotspots}
              variant="outline"
              className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
            >
              Limpar Tudo
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
