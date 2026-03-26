import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { getCurrentLocalPlayer, isPlayerAuthenticated } from '@/services/playerService';
import { getPlayer } from '@/services/playerCoreService';
import { Players } from '@/entities';

export function usePlayerAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const setPlayer = usePlayerStore((state) => state.setPlayer);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuth = await isPlayerAuthenticated();
        
        if (isAuth) {
          const player = await getCurrentLocalPlayer();
          
          if (player) {
            // Load full player data from database
            const fullPlayer = await getPlayer(player._id);
            
            if (fullPlayer) {
              setPlayer(fullPlayer);
              setIsAuthenticated(true);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing player auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [setPlayer]);

  return {
    isAuthenticated,
    isLoading,
  };
}
