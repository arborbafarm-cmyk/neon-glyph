/**
 * LUXURY SERVICE - Luxury Items Management
 * 
 * Handles luxury item purchases and inventory
 */

import { getPlayer, savePlayer } from './playerCoreService';
import { removeCleanMoney } from './economyService';
import { Players } from '@/entities';

/**
 * Parse ownedLuxuryItems from JSON string
 */
function parseOwnedItems(itemsJson: string | undefined): string[] {
  if (!itemsJson) return [];
  try {
    return JSON.parse(itemsJson);
  } catch {
    return [];
  }
}

/**
 * Stringify ownedLuxuryItems to JSON
 */
function stringifyOwnedItems(items: string[]): string {
  return JSON.stringify(items);
}

/**
 * Buy luxury item
 * Deducts clean money and adds item to inventory
 */
export async function buyLuxuryItem(
  playerId: string,
  itemId: string,
  price: number
): Promise<Players> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const currentClean = player.cleanMoney ?? 0;
  if (currentClean < price) {
    throw new Error(
      `Insufficient clean money to buy luxury item. Have: ${currentClean}, Need: ${price}`
    );
  }

  const ownedItems = parseOwnedItems(player.ownedLuxuryItems);
  
  // Add item if not already owned
  if (!ownedItems.includes(itemId)) {
    ownedItems.push(itemId);
  }

  const updated = {
    ...player,
    cleanMoney: currentClean - price,
    ownedLuxuryItems: stringifyOwnedItems(ownedItems),
  };

  return savePlayer(updated);
}

/**
 * Check if player owns luxury item
 */
export async function ownsLuxuryItem(playerId: string, itemId: string): Promise<boolean> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const ownedItems = parseOwnedItems(player.ownedLuxuryItems);
  return ownedItems.includes(itemId);
}

/**
 * Get player's owned luxury items
 */
export async function getOwnedLuxuryItems(playerId: string): Promise<string[]> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  return parseOwnedItems(player.ownedLuxuryItems);
}

/**
 * Check if player can afford luxury item
 */
export async function canBuyLuxuryItem(playerId: string, price: number): Promise<boolean> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const currentClean = player.cleanMoney ?? 0;
  return currentClean >= price;
}
