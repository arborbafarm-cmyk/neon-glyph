import { useGameScreenStore } from '@/store/gameScreenStore'
import { useEffect, useState } from 'react'

import GameCharacterScreen from '@/components/game/GameCharacterScreen'
import GameInventoryScreen from '@/components/game/GameInventoryScreen'
import GameLocationScreen from '@/components/game/GameLocationScreen'
import GameMapScreen from '@/components/game/GameMapScreen'
import GameMenuScreen from '@/components/game/GameMenuScreen'
import GameStatusScreen from '@/components/game/GameStatusScreen'

import CinematicSignboard from '@/components/CinematicSignboard'

export default function GamePage() {

  const storeScreen = useGameScreenStore((state) => state.currentScreen)
    const setScreen = useGameScreenStore((state) => state.setScreen)

      const currentScreen = storeScreen || 'menu'

        const [showCinematic, setShowCinematic] = useState(true)

          useEffect(() => {

              const timer = setTimeout(() => {

                    setShowCinematic(false)
                          setScreen('menu')

                              }, 5000)

                                  return () => clearTimeout(timer)

                                    }, [])

                                      const renderScreen = () => {

                                          switch (currentScreen) {

                                                case 'menu':
                                                        return <GameMenuScreen />

                                                              case 'map':
                                                                      return <GameMapScreen />

                                                                            case 'location':
                                                                                    return <GameLocationScreen />

                                                                                          case 'character':
                                                                                                  return <GameCharacterScreen />

                                                                                                        case 'inventory':
                                                                                                                return <GameInventoryScreen />

                                                                                                                      case 'status':
                                                                                                                              return <GameStatusScreen />

                                                                                                                                    default:
                                                                                                                                            return <GameMenuScreen />

                                                                                                                                                }

                                                                                                                                                  }

                                                                                                                                                    return (

                                                                                                                                                        <div className="w-screen h-screen bg-black overflow-hidden relative">

                                                                                                                                                              {showCinematic ? (
                                                                                                                                                                      <div style={{pointerEvents:'none'}}>
                                                                                                                                                                                <CinematicSignboard />
                                                                                                                                                                                        </div>
                                                                                                                                                                                              ) : (
                                                                                                                                                                                                      renderScreen()
                                                                                                                                                                                                            )}

                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                  )

                                                                                                                                                                                                                  }
