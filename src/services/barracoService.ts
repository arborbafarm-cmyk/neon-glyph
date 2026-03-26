/**
 * BARRACO SERVICE - Barraco (Slum House) Management
 * 
 * Handles barraco upgrades and operations
 */

import { getPlayer, savePlayer } from './playerCoreService';
import { removeDirtyMoney } from './economyService';
import { Players } from '@/entities';

/**
 * Get barraco upgrade cost based on current level
 */
export function getBarracoUpgradeCost(currentLevel: number): number {
  return currentLevel * 1000; // Level 1 = 1000, Level 2 = 2000, etc.
}

/**
 * Upgrade barraco to next level
 * Deducts dirty money and increases barraco level
 */
export async function upgradeBarraco(playerId: string): Promise<Players> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const currentLevel = player.barracoLevel ?? 1;
  const upgradeCost = getBarracoUpgradeCost(currentLevel);
  const currentDirty = player.dirtyMoney ?? 0;

  if (currentDirty < upgradeCost) {
    throw new Error(
      `Insufficient dirty money to upgrade barraco. Have: ${currentDirty}, Need: ${upgradeCost}`
    );
  }

  const updated = {
    ...player,
    dirtyMoney: currentDirty - upgradeCost,
    barracoLevel: currentLevel + 1,
  };

  return savePlayer(updated);
}

/**
 * Get barraco level
 */
export async function getBarracoLevel(playerId: string): Promise<number> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  return player.barracoLevel ?? 1;
}

/**
 * Get next upgrade cost
 */
export async function getNextUpgradeCost(playerId: string): Promise<number> {
  const level = await getBarracoLevel(playerId);
  return getBarracoUpgradeCost(level);
}

/**
 * Check if player can afford barraco upgrade
 */
export async function canUpgradeBarraco(playerId: string): Promise<boolean> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const currentLevel = player.barracoLevel ?? 1;
  const upgradeCost = getBarracoUpgradeCost(currentLevel);
  const currentDirty = player.dirtyMoney ?? 0;

  return currentDirty >= upgradeCost;
}
