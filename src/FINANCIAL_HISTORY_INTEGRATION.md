# Financial History System Integration Guide

## Overview
The Financial History system tracks all money movements in the game to prevent mysterious money disappearances and aid in debugging and multiplayer scenarios.

## Database Collection
- **Collection ID**: `financialhistory`
- **Fields**:
  - `playerId` (text): Unique identifier for the player
  - `operationType` (text): Category of the financial movement
  - `value` (number): The monetary amount (positive for income, negative for expense)
  - `balanceBefore` (number): Player's balance before the operation
  - `balanceAfter` (number): Player's balance after the operation
  - `actionOrigin` (text): Specific source/reason for the action
  - `timestamp` (datetime): When the transaction occurred

## Services

### `financialHistoryService.ts`
Located in `/src/services/financialHistoryService.ts`

#### Functions:

1. **logFinancialTransaction(record)**
   - Logs a single financial transaction
   - Usage:
   ```typescript
   import { logFinancialTransaction } from '@/services/financialHistoryService';
   
   await logFinancialTransaction({
     playerId: 'player-123',
     operationType: 'slot_payout',
     value: 1000,
     balanceBefore: 5000,
     balanceAfter: 6000,
     actionOrigin: 'Slot machine paid prize',
     timestamp: new Date(),
   });
   ```

2. **getPlayerFinancialHistory(playerId, limit, skip)**
   - Retrieves transaction history for a specific player
   - Returns paginated results

3. **getAllFinancialHistory(limit, skip)**
   - Retrieves all transactions (admin/debug)
   - Useful for auditing all players

4. **getPlayerFinancialSummary(playerId)**
   - Returns aggregated statistics:
     - Total transactions count
     - Total income
     - Total expense
     - Net change
     - Breakdown by operation type
     - Breakdown by action origin

5. **verifyPlayerBalanceConsistency(playerId)**
   - Checks if balance transitions are consistent
   - Detects gaps or inconsistencies in the balance chain
   - Returns list of any inconsistencies found

## Hook: useFinancialLogger

Located in `/src/hooks/useFinancialLogger.ts`

Simplified hook for logging transactions:

```typescript
import { useFinancialLogger } from '@/hooks/useFinancialLogger';

function MyComponent() {
  const { logTransaction } = useFinancialLogger();

  const handleSlotPayout = async (amount: number) => {
    // ... slot logic ...
    
    await logTransaction(
      'slot_payout',           // operationType
      amount,                  // value
      'Slot machine paid prize' // actionOrigin
    );
  };

  return <button onClick={() => handleSlotPayout(1000)}>Spin</button>;
}
```

The hook automatically:
- Gets the current player ID
- Uses current player balance as `balanceBefore`
- Calculates `balanceAfter` from the value
- Sets timestamp to now

## Integration Points

### Where to Add Logging

1. **Slot Machine Payouts** (SlotMachine.tsx)
   ```typescript
   await logTransaction('slot_payout', winAmount, 'Slot machine paid prize');
   ```

2. **Barraco Upgrades** (BarracoPage.tsx)
   ```typescript
   await logTransaction('barraco_upgrade', -upgradeCost, 'Barraco level upgrade');
   ```

3. **Money Laundering** (MoneyLaunderingPage.tsx)
   ```typescript
   await logTransaction('money_laundering', convertedAmount, 'Dirty money converted to clean');
   ```

4. **Luxury Item Purchases** (LuxuryShowroomPage.tsx)
   ```typescript
   await logTransaction('luxury_purchase', -itemPrice, `Purchased ${itemName}`);
   ```

5. **Business Investments** (CommercialCenterPage.tsx)
   ```typescript
   await logTransaction('business_investment', -investmentAmount, 'Business investment made');
   ```

6. **Bribery Payments** (BriberyGuardPage.tsx, etc.)
   ```typescript
   await logTransaction('bribery_payment', -bribeAmount, `Bribed ${characterName}`);
   ```

## UI Page

### Financial History Page
Located at `/financial-history` route

Features:
- **Transaction History Tab**: View all your transactions in a table
- **Summary Tab**: See aggregated statistics and breakdowns
- **Balance Check Tab**: Verify balance consistency and detect anomalies
- **All Transactions Tab**: Admin view of all player transactions

## Example Implementation

```typescript
import { useFinancialLogger } from '@/hooks/useFinancialLogger';
import { usePlayerStore } from '@/store/playerStore';

function SlotMachine() {
  const { logTransaction } = useFinancialLogger();
  const player = usePlayerStore((state) => state.player);

  const handleSpin = async () => {
    const balanceBefore = player?.cleanMoney ?? 0;
    const spinCost = 100;
    const winAmount = Math.random() > 0.7 ? 500 : 0;
    const netChange = winAmount - spinCost;

    // Update game state
    // ... your spin logic ...

    // Log the transaction
    await logTransaction(
      'slot_spin',
      netChange,
      `Slot spin - ${winAmount > 0 ? 'Won' : 'Lost'} ${Math.abs(netChange)}`
    );
  };

  return <button onClick={handleSpin}>Spin</button>;
}
```

## Debugging Tips

1. **Check for Missing Transactions**
   - Use the Summary tab to see total transaction count
   - Compare with expected number of operations

2. **Verify Balance Consistency**
   - Use the Balance Check tab to detect gaps
   - Each transaction's `balanceBefore` should match previous transaction's `balanceAfter`

3. **Audit Specific Operations**
   - Filter by `operationType` in the Summary tab
   - See how many times each operation occurred

4. **Track Money Flow**
   - Use the Summary tab to see total income vs expense
   - Identify which operations are the biggest money sinks

## Best Practices

1. **Always log before updating player state** to ensure accurate `balanceBefore`
2. **Use consistent operation type names** (e.g., `slot_payout`, `barraco_upgrade`)
3. **Include descriptive action origins** for easy debugging
4. **Log both income and expense** with appropriate signs
5. **Verify balance consistency regularly** in multiplayer scenarios
6. **Don't throw on logging failure** - use try/catch to prevent game breaking

## Future Enhancements

- Add filtering by date range
- Add export to CSV for analysis
- Add charts/graphs for visualization
- Add alerts for suspicious patterns
- Add automatic balance reconciliation
