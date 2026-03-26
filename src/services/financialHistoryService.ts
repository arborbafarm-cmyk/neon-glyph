import { BaseCrudService } from '@/integrations';

export interface FinancialHistoryRecord {
  _id?: string;
  playerId: string;
  operationType: string;
  value: number;
  balanceBefore: number;
  balanceAfter: number;
  actionOrigin: string;
  timestamp: Date | string;
}

const COLLECTION_ID = 'financialhistory';

/**
 * Log a financial transaction to the history
 */
export async function logFinancialTransaction(
  record: Omit<FinancialHistoryRecord, '_id'>
): Promise<void> {
  try {
    await BaseCrudService.create(COLLECTION_ID, {
      _id: crypto.randomUUID(),
      ...record,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to log financial transaction:', error);
    throw error;
  }
}

/**
 * Get financial history for a specific player
 */
export async function getPlayerFinancialHistory(
  playerId: string,
  limit: number = 50,
  skip: number = 0
) {
  try {
    const result = await BaseCrudService.getAll<any>(COLLECTION_ID, [], {
      limit,
      skip,
    });

    // Filter by playerId on client side since we can't query by specific field easily
    const playerHistory = result.items.filter(
      (item) => item.playerId === playerId
    );

    return {
      items: playerHistory,
      totalCount: result.totalCount,
      hasNext: result.hasNext,
    };
  } catch (error) {
    console.error('Failed to get player financial history:', error);
    throw error;
  }
}

/**
 * Get all financial history (admin/debug)
 */
export async function getAllFinancialHistory(limit: number = 100, skip: number = 0) {
  try {
    const result = await BaseCrudService.getAll<any>(COLLECTION_ID, [], {
      limit,
      skip,
    });
    return result;
  } catch (error) {
    console.error('Failed to get all financial history:', error);
    throw error;
  }
}

/**
 * Get financial summary for a player (total in/out, transaction count)
 */
export async function getPlayerFinancialSummary(playerId: string) {
  try {
    const result = await BaseCrudService.getAll<any>(COLLECTION_ID, [], {
      limit: 1000, // Get enough records for analysis
    });

    const playerTransactions = result.items.filter(
      (item) => item.playerId === playerId
    );

    const summary = {
      totalTransactions: playerTransactions.length,
      totalIncome: playerTransactions
        .filter((t) => t.value > 0)
        .reduce((sum, t) => sum + t.value, 0),
      totalExpense: playerTransactions
        .filter((t) => t.value < 0)
        .reduce((sum, t) => sum + t.value, 0),
      netChange: playerTransactions.reduce((sum, t) => sum + t.value, 0),
      lastTransaction: playerTransactions[playerTransactions.length - 1] || null,
      transactionsByType: {} as Record<string, number>,
      transactionsByOrigin: {} as Record<string, number>,
    };

    // Count by type and origin
    playerTransactions.forEach((t) => {
      summary.transactionsByType[t.operationType] =
        (summary.transactionsByType[t.operationType] || 0) + 1;
      summary.transactionsByOrigin[t.actionOrigin] =
        (summary.transactionsByOrigin[t.actionOrigin] || 0) + 1;
    });

    return summary;
  } catch (error) {
    console.error('Failed to get player financial summary:', error);
    throw error;
  }
}

/**
 * Verify balance consistency (check if balanceAfter matches expected)
 */
export async function verifyPlayerBalanceConsistency(playerId: string) {
  try {
    const result = await BaseCrudService.getAll<any>(COLLECTION_ID, [], {
      limit: 1000,
    });

    const playerTransactions = result.items
      .filter((item) => item.playerId === playerId)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

    const inconsistencies: any[] = [];

    for (let i = 1; i < playerTransactions.length; i++) {
      const prev = playerTransactions[i - 1];
      const current = playerTransactions[i];

      // Check if current balanceBefore matches previous balanceAfter
      if (prev.balanceAfter !== current.balanceBefore) {
        inconsistencies.push({
          index: i,
          expected: prev.balanceAfter,
          actual: current.balanceBefore,
          transaction: current,
        });
      }
    }

    return {
      isConsistent: inconsistencies.length === 0,
      inconsistencies,
      totalTransactions: playerTransactions.length,
    };
  } catch (error) {
    console.error('Failed to verify balance consistency:', error);
    throw error;
  }
}
