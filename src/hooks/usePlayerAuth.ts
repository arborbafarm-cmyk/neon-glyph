import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { getCurrentLocalPlayer, isPlayerAuthenticated } from '@/services/playerService';
import { getPlayer } from '@/services/playerCoreService';
import { resetPlayerSession } from '@/services/sessionResetService';

export function usePlayerAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const setPlayer = usePlayerStore((state) => state.setPlayer);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 🔥 CORREÇÃO CRÍTICA: reset COMPLETO da sessão
        await resetPlayerSession();

        const isAuth = await isPlayerAuthenticated();

        if (!isAuth) {
          setIsAuthenticated(false);
          return;
        }

        const localPlayer = await getCurrentLocalPlayer();

        if (!localPlayer?._id) {
          setIsAuthenticated(false);
          return;
        }

        // 🔥 SEMPRE puxar do banco (source of truth)
        const fullPlayer = await getPlayer(localPlayer._id);

        if (!fullPlayer) {
          setIsAuthenticated(false);
          return;
        }

        setPlayer(fullPlayer);
        setIsAuthenticated(true);
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