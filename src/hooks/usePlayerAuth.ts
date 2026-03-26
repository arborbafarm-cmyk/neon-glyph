import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { getCurrentLocalPlayer, isPlayerAuthenticated } from '@/services/playerService';
import { Players } from '@/entities';

export function usePlayerAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playerData, setPlayerData] = useState<Players | null>(null);
  
  const loadPlayerData = usePlayerStore((state) => state.loadPlayerData);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuth = await isPlayerAuthenticated();
        
        if (isAuth) {
          const player = await getCurrentLocalPlayer();
          
          if (player) {
            setPlayerData(player);
            setIsAuthenticated(true);
            
            // Load player data into store from players collection
            // playerId is the unique permanent identifier (_id from players collection)
            loadPlayerData({
              playerId: player._id,
              playerName: player.playerName || 'COMANDANTE',
              level: player.level || 1,
              progress: player.progress || 0,
              isGuest: player.isGuest || false,
              profilePicture: player.profilePicture || null,
              cleanMoney: player.cleanMoney || 0,
              dirtyMoney: player.dirtyMoney || 10000000000,
            });
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
  }, [loadPlayerData]);

  return {
    isAuthenticated,
    isLoading,
    playerData,
  };
}
