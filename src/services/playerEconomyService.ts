/**
 * UNIFIED PLAYER ECONOMY SERVICE
 * 
 * Single source of truth for all financial operations.
 * All money transactions MUST go through this service.
 * 
 * Rules:
 * - Only dirtyMoney and cleanMoney are real balances (stored in Players collection)
 * - All operations are validated before execution
 * - All operations are persisted to database
 * - All operations sync the playerStore via setPlayer()
 * - History is recorded for audit trail
 */

import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { usePlayerStore } from '@/store/playerStore';

export interface TransactionRecord {
  id: string;
  timestamp: Date;
  type: 'add' | 'remove' | 'transfer' | 'launder' | 'invest' | 'bribe';
  moneyType: 'dirty' | 'clean';
  amount: number;
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
  playerId: string;
}

const COLLECTION_ID = 'players';
const MAX_TRANSACTION_HISTORY = 1000;

let transactionHistory: TransactionRecord[] = [];

/**
 * Get current player's financial state from database
 */
export async function getPlayerFinances(playerId: string) {
  try {
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    return {
      dirtyMoney: player?.dirtyMoney ?? 0,
      cleanMoney: player?.cleanMoney ?? 0,
      playerId: player?._id,
    };
  } catch (error) {
    console.error('Failed to get player finances:', error);
    throw error;
  }
}

/**
 * Validate that player has sufficient balance
 */
function validateBalance(currentBalance: number, amount: number): boolean {
  return currentBalance >= amount && amount > 0;
}

/**
 * Record transaction in history
 */
function recordTransaction(record: TransactionRecord) {
  transactionHistory.unshift(record);
  if (transactionHistory.length > MAX_TRANSACTION_HISTORY) {
    transactionHistory = transactionHistory.slice(0, MAX_TRANSACTION_HISTORY);
  }
  console.log(`[ECONOMY] ${record.type.toUpperCase()}: ${record.amount} ${record.moneyType} - ${record.reason}`);
}

/**
 * Get transaction history
 */
export function getTransactionHistory(limit: number = 50): TransactionRecord[] {
  return transactionHistory.slice(0, limit);
}

/**
 * Clear transaction history (for testing/reset)
 */
export function clearTransactionHistory() {
  transactionHistory = [];
}

/**
 * ADD DIRTY MONEY
 * Used for: illegal operations, crimes, black market sales
 */
export async function addDirtyMoney(
  playerId: string,
  amount: number,
  reason: string
): Promise<Players | null> {
  try {
    if (amount <= 0) {
      console.error('Amount must be positive');
      return null;
    }

    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) {
      console.error('Player not found');
      return null;
    }

    const currentDirty = player.dirtyMoney ?? 0;
    const newBalance = currentDirty + amount;

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      dirtyMoney: newBalance,
    });

    const updated = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (updated) {
      usePlayerStore.getState().setPlayer(updated);
    }

    recordTransaction({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'add',
      moneyType: 'dirty',
      amount,
      reason,
      balanceBefore: currentDirty,
      balanceAfter: newBalance,
      playerId,
    });

    return updated || null;
  } catch (error) {
    console.error('Failed to add dirty money:', error);
    return null;
  }
}

/**
 * REMOVE DIRTY MONEY
 * Used for: spending, investments, bribes
 */
export async function removeDirtyMoney(
  playerId: string,
  amount: number,
  reason: string
): Promise<Players | null> {
  try {
    if (amount <= 0) {
      console.error('Amount must be positive');
      return null;
    }

    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) {
      console.error('Player not found');
      return null;
    }

    const currentDirty = player.dirtyMoney ?? 0;

    if (!validateBalance(currentDirty, amount)) {
      console.error(`Insufficient dirty money. Have: ${currentDirty}, Need: ${amount}`);
      return null;
    }

    const newBalance = currentDirty - amount;

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      dirtyMoney: newBalance,
    });

    const updated = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (updated) {
      usePlayerStore.getState().setPlayer(updated);
    }

    recordTransaction({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'remove',
      moneyType: 'dirty',
      amount,
      reason,
      balanceBefore: currentDirty,
      balanceAfter: newBalance,
      playerId,
    });

    return updated || null;
  } catch (error) {
    console.error('Failed to remove dirty money:', error);
    return null;
  }
}

/**
 * ADD CLEAN MONEY
 * Used for: legitimate earnings, money laundering completion, rewards
 */
export async function addCleanMoney(
  playerId: string,
  amount: number,
  reason: string
): Promise<Players | null> {
  try {
    if (amount <= 0) {
      console.error('Amount must be positive');
      return null;
    }

    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) {
      console.error('Player not found');
      return null;
    }

    const currentClean = player.cleanMoney ?? 0;
    const newBalance = currentClean + amount;

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      cleanMoney: newBalance,
    });

    const updated = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (updated) {
      usePlayerStore.getState().setPlayer(updated);
    }

    recordTransaction({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'add',
      moneyType: 'clean',
      amount,
      reason,
      balanceBefore: currentClean,
      balanceAfter: newBalance,
      playerId,
    });

    return updated || null;
  } catch (error) {
    console.error('Failed to add clean money:', error);
    return null;
  }
}

/**
 * REMOVE CLEAN MONEY
 * Used for: spending clean money, investments
 */
export async function removeCleanMoney(
  playerId: string,
  amount: number,
  reason: string
): Promise<Players | null> {
  try {
    if (amount <= 0) {
      console.error('Amount must be positive');
      return null;
    }

    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) {
      console.error('Player not found');
      return null;
    }

    const currentClean = player.cleanMoney ?? 0;

    if (!validateBalance(currentClean, amount)) {
      console.error(`Insufficient clean money. Have: ${currentClean}, Need: ${amount}`);
      return null;
    }

    const newBalance = currentClean - amount;

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      cleanMoney: newBalance,
    });

    const updated = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (updated) {
      usePlayerStore.getState().setPlayer(updated);
    }

    recordTransaction({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'remove',
      moneyType: 'clean',
      amount,
      reason,
      balanceBefore: currentClean,
      balanceAfter: newBalance,
      playerId,
    });

    return updated || null;
  } catch (error) {
    console.error('Failed to remove clean money:', error);
    return null;
  }
}

/**
 * TRANSFER MONEY
 * Convert dirty money to clean money (money laundering)
 */
export async function launderMoney(
  playerId: string,
  dirtyAmount: number,
  cleanAmount: number,
  reason: string
): Promise<Players | null> {
  try {
    if (dirtyAmount <= 0 || cleanAmount <= 0) {
      console.error('Amounts must be positive');
      return null;
    }

    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) {
      console.error('Player not found');
      return null;
    }

    const currentDirty = player.dirtyMoney ?? 0;
    const currentClean = player.cleanMoney ?? 0;

    if (!validateBalance(currentDirty, dirtyAmount)) {
      console.error(`Insufficient dirty money. Have: ${currentDirty}, Need: ${dirtyAmount}`);
      return null;
    }

    const newDirtyBalance = currentDirty - dirtyAmount;
    const newCleanBalance = currentClean + cleanAmount;

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      dirtyMoney: newDirtyBalance,
      cleanMoney: newCleanBalance,
    });

    const updated = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (updated) {
      usePlayerStore.getState().setPlayer(updated);
    }

    recordTransaction({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'launder',
      moneyType: 'dirty',
      amount: dirtyAmount,
      reason,
      balanceBefore: currentDirty,
      balanceAfter: newDirtyBalance,
      playerId,
    });

    recordTransaction({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'launder',
      moneyType: 'clean',
      amount: cleanAmount,
      reason,
      balanceBefore: currentClean,
      balanceAfter: newCleanBalance,
      playerId,
    });

    return updated || null;
  } catch (error) {
    console.error('Failed to launder money:', error);
    return null;
  }
}

/**
 * RESET PLAYER FINANCES (for testing/reset only)
 */
export async function resetPlayerFinances(
  playerId: string,
  dirtyMoney: number = 0,
  cleanMoney: number = 0
): Promise<Players | null> {
  try {
    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      dirtyMoney,
      cleanMoney,
    });

    const updated = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (updated) {
      usePlayerStore.getState().setPlayer(updated);
    }

    recordTransaction({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'remove',
      moneyType: 'dirty',
      amount: 0,
      reason: 'RESET',
      balanceBefore: 0,
      balanceAfter: dirtyMoney,
      playerId,
    });

    return updated || null;
  } catch (error) {
    console.error('Failed to reset player finances:', error);
    return null;
  }
}
