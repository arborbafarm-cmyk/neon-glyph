/**
 * SPINS SERVICE - Spin Management
 * 
 * Handles all spin-related operations:
 * - Adding/removing spins
 * - Executing spins with rewards
 * - Spin rewards calculation
 */

import { getPlayer, savePlayer } from './playerCoreService';
import { addDirtyMoney } from './economyService';
import { Players } from '@/entities';

/**
 * Add spins to player
 */
export async function addSpins(playerId: string, amount: number): Promise<Players> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const updated = {
    ...player,
    spins: (player.spins ?? 0) + amount,
  };

  return savePlayer(updated);
}

/**
 * Remove spins from player
 * Throws error if insufficient spins
 */
export async function removeSpins(playerId: string, amount: number): Promise<Players> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const currentSpins = player.spins ?? 0;
  if (currentSpins < amount) {
    throw new Error(`Insufficient spins. Have: ${currentSpins}, Need: ${amount}`);
  }

  const updated = {
    ...player,
    spins: currentSpins - amount,
  };

  return savePlayer(updated);
}

/**
 * Calculate random spin reward
 * Returns money and bonus spins
 */
function calculateSpinReward(): { money: number; bonusSpins: number } {
  const baseReward = Math.floor(Math.random() * 500) + 100; // 100-600
  const bonusSpins = Math.random() > 0.8 ? 1 : 0; // 20% chance for bonus spin

  return {
    money: baseReward,
    bonusSpins,
  };
}

/**
 * Execute a spin operation
 * Deducts 1 spin, awards money and possible bonus spins
 */
export async function executeSpin(playerId: string): Promise<{
  player: Players;
  reward: { money: number; bonusSpins: number };
}> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const currentSpins = player.spins ?? 0;
  if (currentSpins <= 0) {
    throw new Error('No spins available');
  }

  // Calculate reward
  const reward = calculateSpinReward();

  // Deduct spin and add money
  let updated = {
    ...player,
    spins: currentSpins - 1,
    dirtyMoney: (player.dirtyMoney ?? 0) + reward.money,
  };

  // Add bonus spins if won
  if (reward.bonusSpins > 0) {
    updated.spins = updated.spins + reward.bonusSpins;
  }

  const savedPlayer = await savePlayer(updated);

  return {
    player: savedPlayer,
    reward,
  };
}

/**
 * Get player's spin count
 */
export async function getSpinCount(playerId: string): Promise<number> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  return player.spins ?? 0;
}
