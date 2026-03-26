import { useEffect, useState, useCallback } from 'react';
import {
  updatePlayerPresence,
  getOnlinePlayersNearby,
  getOnlinePlayersInComplex,
  setPlayerOffline,
  MapPosition,
} from '@/services/playerPresenceService';

interface UsePlayerPresenceOptions {
  playerId: string;
  position: MapPosition;
  status?: 'active' | 'idle' | 'in_combat';
  complexStatus?: string;
  updateInterval?: number; // ms
  nearbyRadius?: number; // pixels
}

interface NearbyPlayer {
  _id: string;
  playerId: string;
  playerName?: string;
  level?: number;
  profilePicture?: string;
  mapPosition: MapPosition;
  status: string;
  isOnline: boolean;
}

/**
 * Hook para gerenciar presença do jogador no mapa
 * Atualiza posição e carrega jogadores próximos
 */
export function usePlayerPresence({
  playerId,
  position,
  status = 'active',
  complexStatus,
  updateInterval = 2000,
  nearbyRadius = 500,
}: UsePlayerPresenceOptions) {
  const [nearbyPlayers, setNearbyPlayers] = useState<NearbyPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Atualizar presença do jogador
  const updatePresence = useCallback(async () => {
    try {
      setIsLoading(true);
      await updatePlayerPresence(playerId, position, status, complexStatus);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar presença');
      console.error('Erro ao atualizar presença:', err);
    } finally {
      setIsLoading(false);
    }
  }, [playerId, position, status, complexStatus]);

  // Carregar jogadores próximos
  const loadNearbyPlayers = useCallback(async () => {
    try {
      const players = await getOnlinePlayersNearby(position, nearbyRadius);
      setNearbyPlayers(players);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar jogadores próximos');
      console.error('Erro ao carregar jogadores próximos:', err);
    }
  }, [position, nearbyRadius]);

  // Atualizar presença e carregar jogadores próximos periodicamente
  useEffect(() => {
    // Atualizar imediatamente
    updatePresence();
    loadNearbyPlayers();

    // Configurar intervalo de atualização
    const interval = setInterval(() => {
      updatePresence();
      loadNearbyPlayers();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updatePresence, loadNearbyPlayers, updateInterval]);

  return {
    nearbyPlayers,
    isLoading,
    error,
    updatePresence,
    loadNearbyPlayers,
  };
}

/**
 * Hook para gerenciar presença em um complexo específico
 */
export function useComplexPresence(complexo: string, updateInterval: number = 3000) {
  const [playersInComplex, setPlayersInComplex] = useState<NearbyPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlayersInComplex = useCallback(async () => {
    try {
      setIsLoading(true);
      const players = await getOnlinePlayersInComplex(complexo);
      setPlayersInComplex(players);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar jogadores');
      console.error('Erro ao carregar jogadores no complexo:', err);
    } finally {
      setIsLoading(false);
    }
  }, [complexo]);

  useEffect(() => {
    loadPlayersInComplex();

    const interval = setInterval(loadPlayersInComplex, updateInterval);

    return () => clearInterval(interval);
  }, [loadPlayersInComplex, updateInterval]);

  return {
    playersInComplex,
    isLoading,
    error,
    refetch: loadPlayersInComplex,
  };
}

/**
 * Hook para gerenciar logout e definir jogador como offline
 */
export function usePlayerLogout(playerId: string) {
  const logout = useCallback(async () => {
    try {
      await setPlayerOffline(playerId);
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      throw err;
    }
  }, [playerId]);

  // Fazer logout quando componente desmontar
  useEffect(() => {
    return () => {
      logout();
    };
  }, [logout]);

  return { logout };
}
