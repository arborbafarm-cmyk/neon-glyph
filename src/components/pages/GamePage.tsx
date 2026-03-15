import { useGameScreenStore } from '@/store/gameScreenStore'
import { useEffect, useState } from 'react'

import GameCharacterScreen from '@/components/game/GameCharacterScreen'
import GameInventoryScreen from '@/components/game/GameInventoryScreen'
import GameLocationScreen from '@/components/game/GameLocationScreen'
import GameMapScreen from '@/components/game/GameMapScreen'
import GameMenuScreen from '@/components/game/GameMenuScreen'
import GameStatusScreen from '@/components/game/GameStatusScreen'

import CinematicSignboard from '@/components/CinematicSignboard'
import Footer from '@/components/Footer'

export default function GamePage() {
  const currentScreen = useGameScreenStore((state) => state.currentScreen)
  const setScreen = useGameScreenStore((state) => state.setScreen)

  const [showCinematic, setShowCinematic] = useState(true)

  useEffect(() => {
    // define menu como tela inicial
    setScreen('menu')

    // controla a intro cinematográfica
    const timer = setTimeout(() => {
      setShowCinematic(false)

      // garante que após a intro vá para o menu
      setScreen('menu')
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // tela da intro
  if (showCinematic) {
    return (
      <div className="w-screen h-screen bg-black overflow-hidden relative">
        <CinematicSignboard />
      </div>
    )
  }

  // jogo
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <div className="flex-1 w-screen overflow-hidden relative">
        {currentScreen === 'menu' && (
          <GameMenuScreen />
        )}

        {currentScreen === 'map' && (
          <GameMapScreen />
        )}

        {currentScreen === 'location' && (
          <GameLocationScreen />
        )}

        {currentScreen === 'character' && (
          <GameCharacterScreen />
        )}

        {currentScreen === 'inventory' && (
          <GameInventoryScreen />
        )}

        {currentScreen === 'status' && (
          <GameStatusScreen />
        )}
      </div>
      <Footer />
    </div>
  )
}
