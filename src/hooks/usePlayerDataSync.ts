import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { syncPlayerToDatabase } from '@/services/playerDataService';
import {
  updatePlayerPresence,
  setPlayerOffline,
} from '@/services/multiplayerPresenceService';

/**
 * Hook MULTIPLAYER READY
 *
 * Agora faz:
 * - Sync de dados (player)
 * - Sync de presença (online)
 * - Heartbeat multiplayer
 * - Safe unload (offline)
 */
export function usePlayerDataSync() {
  const player = usePlayerStore((state) => state.player);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * =========================
   * DATABASE SYNC (30s)
   * =========================
   */
  useEffect(() => {
    if (!player?._id) return;

    intervalRef.current = setInterval(async () => {
      try {
        await syncPlayerToDatabase(player._id);
      } catch (error) {
        console.error('[SYNC] Error syncing player data:', error);
      }
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [player?._id]);

  /**
   * =========================
   * MULTIPLAYER PRESENCE (HEARTBEAT)
   * =========================
   */
  useEffect(() => {
    if (!player?._id) return;

    const sendPresence = async () => {
      try {
        await updatePlayerPresence(
          player._id,
          'star-map', // 🔥 depois você troca dinamicamente pelo mapa atual
          'online',
          player.playerName
        );
      } catch (error) {
        console.error('[PRESENCE] Error updating presence:', error);
      }
    };

    // Envia imediatamente
    sendPresence();

    // Heartbeat a cada 10s (tempo ideal multiplayer fake realtime)
    presenceIntervalRef.current = setInterval(sendPresence, 10000);

    return () => {
      if (presenceIntervalRef.current) clearInterval(presenceIntervalRef.current);
    };
  }, [player?._id]);

  /**
   * =========================
   * SAFE UNLOAD (OFFLINE)
   * =========================
   */
  useEffect(() => {
    if (!player?._id) return;

    const handleUnload = async () => {
      try {
        await syncPlayerToDatabase(player._id);
        await setPlayerOffline(player._id);
      } catch (error) {
        console.error('[UNLOAD] Error:', error);
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [player?._id]);
}