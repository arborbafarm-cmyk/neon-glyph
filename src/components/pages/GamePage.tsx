import CinematicSignboard from '@/components/CinematicSignboard';
import GameCharacterScreen from '@/components/game/GameCharacterScreen';
import GameInventoryScreen from '@/components/game/GameInventoryScreen';
import GameLocationScreen from '@/components/game/GameLocationScreen';
import GameMapScreen from '@/components/game/GameMapScreen';
import GameMenuScreen from '@/components/game/GameMenuScreen';
import GameStatusScreen from '@/components/game/GameStatusScreen';
import { useGameScreenStore } from '@/store/gameScreenStore';
import { useEffect, useState } from 'react';

export default function GamePage() {
const currentScreen = useGameScreenStore((state) => state.currentScreen);
const setScreen = useGameScreenStore((state) => state.setScreen);
const [showCinematic, setShowCinematic] = useState(true);

useEffect(() => {
// Reset to menu screen when page loads
setScreen('menu');

// Show cinematic for 5 seconds on page load
const timer = setTimeout(() => {
  setShowCinematic(false);
  }, 5000);

  return () => clearTimeout(timer);

  }, [setScreen]);

  if (showCinematic) {
  return (
  <div className="w-screen h-screen bg-black overflow-hidden">
  <CinematicSignboard />
  </div>
  );
  }

  return (
  <div className="w-screen h-screen bg-black overflow-hidden">
  {currentScreen === 'menu' && <GameMenuScreen />}
  {currentScreen === 'map' && <GameMapScreen />}
  {currentScreen === 'location' && <GameLocationScreen />}
  {currentScreen === 'character' && <GameCharacterScreen />}
  {currentScreen === 'inventory' && <GameInventoryScreen />}
  {currentScreen === 'status' && <GameStatusScreen />}
  </div>
  );
  }
