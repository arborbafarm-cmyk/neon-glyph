import { useGameScreenStore } from '@/store/gameScreenStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { MapPin, Menu } from 'lucide-react';

export default function GameMapScreen() {
  const setScreen = useGameScreenStore((state) => state.setScreen);
  const setSelectedLocation = useGameScreenStore((state) => state.setSelectedLocation);

  const locations = [
    { id: 'qg', name: 'Seu QG', desc: 'Domínio da Favela', x: 300, y: 250 },
    { id: 'viatura', name: 'Viatura PM', desc: 'NPC: Sgt. Rocha', x: 500, y: 500 },
    { id: 'boca', name: 'Boca de Fumo', desc: 'Ponto de Venda', x: 700, y: 300 },
    { id: 'banco', name: 'Banco', desc: 'Lavar Dinheiro', x: 200, y: 700 },
  ];

  const handleLocationClick = (locationId: string) => {
    setSelectedLocation(locationId);
    setScreen('location');
  };

  return (
    <div className="w-full h-full relative bg-black">
      {/* Map background */}
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-6 z-20">
        <div className="flex justify-between items-center">

        </div>
      </div>
      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 z-20">

      </div>
    </div>
  );
}
