import { logFinancialTransaction } from '@/services/financialHistoryService';
import { usePlayerStore } from '@/store/playerStore';

/**
 * Hook to easily log financial transactions
 * Usage: const { logTransaction } = useFinancialLogger();
 *        logTransaction('slot_payout', 1000, 'Slot machine paid prize');
 */
export function useFinancialLogger() {
  const player = usePlayerStore((state) => state.player);

  const logTransaction = async (
    operationType: string,
    value: number,
    actionOrigin: string,
    balanceBefore?: number,
    balanceAfter?: number
  ) => {
    if (!player?._id) {
      console.warn('Cannot log transaction: player not loaded');
      return;
    }

    try {
      // Use provided balances or calculate from player data
      const before = balanceBefore ?? player.cleanMoney ?? 0;
      const after = balanceAfter ?? (before + value);

      await logFinancialTransaction({
        playerId: player._id,
        operationType,
        value,
        balanceBefore: before,
        balanceAfter: after,
        actionOrigin,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to log transaction:', error);
      // Don't throw - logging failure shouldn't break game logic
    }
  };

  return { logTransaction };
}
