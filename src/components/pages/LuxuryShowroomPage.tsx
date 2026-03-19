import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CharacterDialog from '@/components/CharacterDialog';
import LuxuryShop from '@/components/LuxuryShop';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { useGameStore } from '@/store/gameStore';

export default function LuxuryShowroomPage() {
  const { playerLevel } = useGameStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <LuxuryShop />

      <Footer />
    </div>
  );
}
