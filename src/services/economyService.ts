/**
 * ECONOMY SERVICE - Money Management
 * 
 * Handles all financial operations:
 * - Adding/removing dirty money
 * - Adding/removing clean money
 * - Money laundering (dirty → clean)
 */

import { getPlayer, savePlayer } from './playerCoreService';
import { Players } from '@/entities';

/**
 * Add dirty money to player
 */
export async function addDirtyMoney(playerId: string, amount: number): Promise<Players> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const updated = {
    ...player,
    dirtyMoney: (player.dirtyMoney ?? 0) + amount,
  };

  return savePlayer(updated);
}

/**
 * Remove dirty money from player
 * Throws error if insufficient balance
 */
export async function removeDirtyMoney(playerId: string, amount: number): Promise<Players> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const currentBalance = player.dirtyMoney ?? 0;
  if (currentBalance < amount) {
    throw new Error(`Insufficient dirty money. Have: ${currentBalance}, Need: ${amount}`);
  }

  const updated = {
    ...player,
    dirtyMoney: currentBalance - amount,
  };

  return savePlayer(updated);
}

/**
 * Add clean money to player
 */
export async function addCleanMoney(playerId: string, amount: number): Promise<Players> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const updated = {
    ...player,
    cleanMoney: (player.cleanMoney ?? 0) + amount,
  };

  return savePlayer(updated);
}

/**
 * Remove clean money from player
 * Throws error if insufficient balance
 */
export async function removeCleanMoney(playerId: string, amount: number): Promise<Players> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const currentBalance = player.cleanMoney ?? 0;
  if (currentBalance < amount) {
    throw new Error(`Insufficient clean money. Have: ${currentBalance}, Need: ${amount}`);
  }

  const updated = {
    ...player,
    cleanMoney: currentBalance - amount,
  };

  return savePlayer(updated);
}

/**
 * Launder dirty money to clean money
 * Converts dirty money to clean money with optional rate
 */
export async function launderMoney(
  playerId: string,
  dirtyAmount: number,
  launderRate: number = 1.0
): Promise<Players> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const currentDirty = player.dirtyMoney ?? 0;
  if (currentDirty < dirtyAmount) {
    throw new Error(`Insufficient dirty money to launder. Have: ${currentDirty}, Need: ${dirtyAmount}`);
  }

  const cleanAmount = dirtyAmount * launderRate;

  const updated = {
    ...player,
    dirtyMoney: currentDirty - dirtyAmount,
    cleanMoney: (player.cleanMoney ?? 0) + cleanAmount,
  };

  return savePlayer(updated);
}

/**
 * Get player's total wealth (dirty + clean)
 */
export async function getTotalWealth(playerId: string): Promise<number> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  return (player.dirtyMoney ?? 0) + (player.cleanMoney ?? 0);
}
