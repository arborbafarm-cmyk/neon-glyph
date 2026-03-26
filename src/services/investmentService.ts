/**
 * INVESTMENT SERVICE - Investment Management
 * 
 * Handles business investments and returns
 */

import { getPlayer, savePlayer } from './playerCoreService';
import { Players } from '@/entities';

/**
 * Parse investments from JSON string
 */
function parseInvestments(investmentsJson: string | undefined): Record<string, number> {
  if (!investmentsJson) return {};
  try {
    return JSON.parse(investmentsJson);
  } catch {
    return {};
  }
}

/**
 * Stringify investments to JSON
 */
function stringifyInvestments(investments: Record<string, number>): string {
  return JSON.stringify(investments);
}

/**
 * Invest in a business
 */
export async function investInBusiness(
  playerId: string,
  businessId: string,
  amount: number
): Promise<Players> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const currentClean = player.cleanMoney ?? 0;
  if (currentClean < amount) {
    throw new Error(
      `Insufficient clean money to invest. Have: ${currentClean}, Need: ${amount}`
    );
  }

  const investments = parseInvestments(player.investments);
  investments[businessId] = (investments[businessId] ?? 0) + amount;

  const updated = {
    ...player,
    cleanMoney: currentClean - amount,
    investments: stringifyInvestments(investments),
  };

  return savePlayer(updated);
}

/**
 * Get investment amount in a business
 */
export async function getInvestmentAmount(
  playerId: string,
  businessId: string
): Promise<number> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const investments = parseInvestments(player.investments);
  return investments[businessId] ?? 0;
}

/**
 * Get all investments
 */
export async function getAllInvestments(playerId: string): Promise<Record<string, number>> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  return parseInvestments(player.investments);
}

/**
 * Withdraw investment from a business
 */
export async function withdrawInvestment(
  playerId: string,
  businessId: string,
  amount: number
): Promise<Players> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const investments = parseInvestments(player.investments);
  const currentInvestment = investments[businessId] ?? 0;

  if (currentInvestment < amount) {
    throw new Error(
      `Insufficient investment in ${businessId}. Have: ${currentInvestment}, Need: ${amount}`
    );
  }

  investments[businessId] = currentInvestment - amount;

  // Remove business if investment reaches 0
  if (investments[businessId] <= 0) {
    delete investments[businessId];
  }

  const updated = {
    ...player,
    cleanMoney: (player.cleanMoney ?? 0) + amount,
    investments: stringifyInvestments(investments),
  };

  return savePlayer(updated);
}

/**
 * Get total invested amount
 */
export async function getTotalInvested(playerId: string): Promise<number> {
  const investments = await getAllInvestments(playerId);
  return Object.values(investments).reduce((sum, amount) => sum + amount, 0);
}
