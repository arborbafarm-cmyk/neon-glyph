import { create } from 'zustand';
import { Players } from '@/entities';

/**
 * PLAYER STORE - REFACTORED
 * 
 * This store is a SIMPLE SESSION CACHE for the current player.
 * It is NOT the source of truth - the database is.
 * 
 * CRITICAL RULES:
 * 1. Never modify this store directly in components
 * 2. Always use the specialized services (economyService, spinsService, etc.)
 * 3. After any operation, update this store with the returned player data via setPlayer()
 * 4. On logout, call reset()
 * 
 * ⚠️ REMOVED METHODS (use setPlayer() instead):
 * - setMoney, setSpins, setLevel, setBarracoLevel
 * - _setDirtyMoney, _setCleanMoney
 * - loadPlayerData
 * 
 * All state updates MUST go through setPlayer() with the full updated player object.
 */

interface PlayerState {
  player: Players | null;
  setPlayer: (player: Players) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  player: null,

  setPlayer: (player: Players) => set({ player }),

  reset: () => set({ player: null }),
}));
