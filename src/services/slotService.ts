/**
 * SLOT SERVICE
 * 
 * Handles all slot machine related operations:
 * - Spin management
 * - Spin rewards calculation
 * - Spin history tracking
 * 
 * This service is the single source of truth for slot operations.
 * All operations return the full updated player object via setPlayer().
 */

import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { usePlayerStore } from '@/store/playerStore';

const COLLECTION_ID = 'players';

export interface SpinResult {
  spinsUsed: number;
  reward: number;
  multiplier: number;
  timestamp: Date;
}

/**
 * Get player spins count
 */
export async function getPlayerSpins(playerId: string): Promise<number> {
  try {
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    return player?.spins || 0;
  } catch (error) {
    console.error('Failed to get player spins:', error);
    throw error;
  }
}

/**
 * Add spins to player
 * Returns full updated player object
 */
export async function addSpins(
  playerId: string,
  amount: number,
  reason: string
): Promise<Players | null> {
  try {
    if (amount <= 0) {
      console.error('Amount must be positive');
      return null;
    }

    const currentSpins = await getPlayerSpins(playerId);
    const newSpins = currentSpins + amount;

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      spins: newSpins,
    });

    const updated = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (updated) {
      usePlayerStore.getState().setPlayer(updated);
    }

    console.log(`[SLOTS] Added ${amount} spins (${reason}) - Total: ${newSpins}`);

    return updated || null;
  } catch (error) {
    console.error('Failed to add spins:', error);
    return null;
  }
}

/**
 * Remove spins from player
 * Returns full updated player object
 */
export async function removeSpins(
  playerId: string,
  amount: number,
  reason: string
): Promise<Players | null> {
  try {
    if (amount <= 0) {
      console.error('Amount must be positive');
      return null;
    }

    const currentSpins = await getPlayerSpins(playerId);

    if (currentSpins < amount) {
      console.error(`Insufficient spins. Have: ${currentSpins}, Need: ${amount}`);
      return null;
    }

    const newSpins = currentSpins - amount;

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      spins: newSpins,
    });

    const updated = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (updated) {
      usePlayerStore.getState().setPlayer(updated);
    }

    console.log(`[SLOTS] Removed ${amount} spins (${reason}) - Total: ${newSpins}`);

    return updated || null;
  } catch (error) {
    console.error('Failed to remove spins:', error);
    return null;
  }
}

/**
 * Execute spin and calculate reward
 * Returns full updated player object with new spins and money
 */
export async function executeSpin(
  playerId: string,
  spinsToUse: number = 1
): Promise<Players | null> {
  try {
    const currentSpins = await getPlayerSpins(playerId);
    if (currentSpins < spinsToUse) {
      console.error(`Insufficient spins. Have: ${currentSpins}, Need: ${spinsToUse}`);
      return null;
    }

    // Remove spins
    const afterSpinRemoval = await removeSpins(playerId, spinsToUse, 'SPIN_EXECUTION');
    if (!afterSpinRemoval) {
      return null;
    }

    // Calculate reward (random multiplier between 1x and 10x)
    const multiplier = Math.floor(Math.random() * 10) + 1;
    const baseReward = 1000;
    const reward = baseReward * multiplier;

    // Add reward as dirty money
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) return null;

    const newDirtyMoney = (player.dirtyMoney ?? 0) + reward;

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      dirtyMoney: newDirtyMoney,
    });

    const updated = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (updated) {
      usePlayerStore.getState().setPlayer(updated);
    }

    console.log(`[SLOTS] Spin result: ${multiplier}x multiplier, ${reward} reward`);

    return updated || null;
  } catch (error) {
    console.error('Failed to execute spin:', error);
    return null;
  }
}

/**
 * Reset player spins (for testing/reset only)
 * Returns full updated player object
 */
export async function resetPlayerSpins(
  playerId: string,
  spins: number = 0
): Promise<Players | null> {
  try {
    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      spins,
    });

    const updated = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (updated) {
      usePlayerStore.getState().setPlayer(updated);
    }

    return updated || null;
  } catch (error) {
    console.error('Failed to reset player spins:', error);
    return null;
  }
}
