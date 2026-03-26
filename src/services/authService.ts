/**
 * AUTHENTICATION SERVICE (PHASE 1 REFACTORED)
 * 
 * SINGLE SOURCE OF TRUTH: IndexedDB for session/credentials only
 * Player data: Use playerDataService instead
 * 
 * This service handles:
 * - Session management (IndexedDB)
 * - Credential storage (IndexedDB)
 * 
 * NEVER use localStorage for player progress
 */

import { storeSession, getSession, clearSession } from './indexedDBService';
import { usePlayerStore } from '@/store/playerStore';
import { loadPlayerFromDatabase } from './playerDataService';

/**
 * Login: Store session in IndexedDB, load player from database
 */
export async function login(playerId: string, email: string): Promise<boolean> {
  try {
    // Store session in IndexedDB (not localStorage)
    await storeSession(playerId, email);
    
    // Load player data from database
    const player = await loadPlayerFromDatabase(playerId);
    
    return player !== null;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

/**
 * Logout: Clear session from IndexedDB and reset store
 */
export async function logout(): Promise<void> {
  try {
    // Clear session from IndexedDB
    await clearSession();
    
    // Reset player store
    const store = usePlayerStore.getState();
    store.resetPlayer();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Get current session from IndexedDB
 */
export async function getCurrentSession(): Promise<{ playerId: string; email: string } | null> {
  try {
    const session = await getSession();
    return session ? { playerId: session.playerId, email: session.email } : null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Load player data from database (called after login)
 */
export async function loadPlayerData(): Promise<boolean> {
  try {
    const session = await getCurrentSession();
    if (!session) return false;
    
    const player = await loadPlayerFromDatabase(session.playerId);
    return player !== null;
  } catch (error) {
    console.error('Error loading player data:', error);
    return false;
  }
}

