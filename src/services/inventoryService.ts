/**
 * INVENTORY SERVICE - Inventory Management
 * 
 * Handles inventory items and quantities
 */

import { getPlayer, savePlayer } from './playerCoreService';
import { Players } from '@/entities';

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

/**
 * Parse inventory from JSON string
 */
function parseInventory(inventoryJson: string | undefined): InventoryItem[] {
  if (!inventoryJson) return [];
  try {
    return JSON.parse(inventoryJson);
  } catch {
    return [];
  }
}

/**
 * Stringify inventory to JSON
 */
function stringifyInventory(items: InventoryItem[]): string {
  return JSON.stringify(items);
}

/**
 * Add item to inventory
 */
export async function addInventoryItem(
  playerId: string,
  itemId: string,
  quantity: number = 1
): Promise<Players> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const inventory = parseInventory(player.inventory);
  const existingItem = inventory.find((item) => item.itemId === itemId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    inventory.push({ itemId, quantity });
  }

  const updated = {
    ...player,
    inventory: stringifyInventory(inventory),
  };

  return savePlayer(updated);
}

/**
 * Remove item from inventory
 */
export async function removeInventoryItem(
  playerId: string,
  itemId: string,
  quantity: number = 1
): Promise<Players> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const inventory = parseInventory(player.inventory);
  const itemIndex = inventory.findIndex((item) => item.itemId === itemId);

  if (itemIndex === -1) {
    throw new Error(`Item ${itemId} not found in inventory`);
  }

  const item = inventory[itemIndex];
  if (item.quantity < quantity) {
    throw new Error(
      `Insufficient quantity of ${itemId}. Have: ${item.quantity}, Need: ${quantity}`
    );
  }

  item.quantity -= quantity;

  // Remove item if quantity reaches 0
  if (item.quantity <= 0) {
    inventory.splice(itemIndex, 1);
  }

  const updated = {
    ...player,
    inventory: stringifyInventory(inventory),
  };

  return savePlayer(updated);
}

/**
 * Get inventory item quantity
 */
export async function getInventoryItemQuantity(
  playerId: string,
  itemId: string
): Promise<number> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const inventory = parseInventory(player.inventory);
  const item = inventory.find((item) => item.itemId === itemId);

  return item?.quantity ?? 0;
}

/**
 * Get all inventory items
 */
export async function getInventory(playerId: string): Promise<InventoryItem[]> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  return parseInventory(player.inventory);
}

/**
 * Check if player has item
 */
export async function hasInventoryItem(playerId: string, itemId: string): Promise<boolean> {
  const quantity = await getInventoryItemQuantity(playerId, itemId);
  return quantity > 0;
}
