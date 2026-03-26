# REFACTORING GUIDE - Unified Player System

## Overview

This refactoring consolidates all player-related operations into a unified, database-first system. The goal is to ensure data consistency, prevent data loss, and prepare the system for multiplayer support.

## Architecture

### Core Layer
- **playerCoreService.ts** - Direct database access (SINGLE SOURCE OF TRUTH)
  - `getPlayer(playerId)` - Get player from database
  - `savePlayer(player)` - Save player to database
  - `createPlayer(data)` - Create new player
  - `deletePlayer(playerId)` - Delete player
  - `getAllPlayers()` - Get all players

### Business Logic Layer
- **economyService.ts** - Money operations
  - `addDirtyMoney(playerId, amount)`
  - `removeDirtyMoney(playerId, amount)`
  - `addCleanMoney(playerId, amount)`
  - `removeCleanMoney(playerId, amount)`
  - `launderMoney(playerId, dirtyAmount, rate)`
  - `getTotalWealth(playerId)`

- **spinsService.ts** - Spin operations
  - `addSpins(playerId, amount)`
  - `removeSpins(playerId, amount)`
  - `executeSpin(playerId)` - Execute spin with reward
  - `getSpinCount(playerId)`

- **barracoService.ts** - Barraco upgrades
  - `upgradeBarraco(playerId)`
  - `getBarracoLevel(playerId)`
  - `getNextUpgradeCost(playerId)`
  - `canUpgradeBarraco(playerId)`

- **luxuryService.ts** - Luxury items
  - `buyLuxuryItem(playerId, itemId, price)`
  - `ownsLuxuryItem(playerId, itemId)`
  - `getOwnedLuxuryItems(playerId)`
  - `canBuyLuxuryItem(playerId, price)`

- **skillTreeService.ts** - Skill management
  - `unlockSkill(playerId, treeType, skillId)`
  - `isSkillUnlocked(playerId, treeType, skillId)`
  - `getSkillsInTree(playerId, treeType)`
  - `getAllSkillTrees(playerId)`
  - `countUnlockedSkills(playerId, treeType)`

- **inventoryService.ts** - Inventory management
  - `addInventoryItem(playerId, itemId, quantity)`
  - `removeInventoryItem(playerId, itemId, quantity)`
  - `getInventoryItemQuantity(playerId, itemId)`
  - `getInventory(playerId)`
  - `hasInventoryItem(playerId, itemId)`

- **investmentService.ts** - Business investments
  - `investInBusiness(playerId, businessId, amount)`
  - `getInvestmentAmount(playerId, businessId)`
  - `getAllInvestments(playerId)`
  - `withdrawInvestment(playerId, businessId, amount)`
  - `getTotalInvested(playerId)`

### UI Layer
- **playerStore.ts** - Simple session cache
  - `player` - Current player data
  - `setPlayer(player)` - Update cache
  - `reset()` - Clear cache

## Usage Pattern

### ✅ CORRECT - Using Services

```typescript
import { usePlayerStore } from '@/store/playerStore';
import { executeSpin } from '@/services/spinsService';

function SlotMachine() {
  const { player, setPlayer } = usePlayerStore();

  const handleSpin = async () => {
    try {
      const { player: updated, reward } = await executeSpin(player._id);
      setPlayer(updated); // Update cache with new data
      showReward(reward);
    } catch (error) {
      console.error('Spin failed:', error);
    }
  };

  return <button onClick={handleSpin}>Spin</button>;
}
```

### ❌ WRONG - Direct Store Manipulation

```typescript
// DON'T DO THIS!
const { setSpins } = usePlayerStore();
setSpins(player.spins - 1); // ❌ Not saved to database!
```

### ❌ WRONG - Using localStorage

```typescript
// DON'T DO THIS!
localStorage.setItem('playerSpins', newSpins); // ❌ Data lost on logout!
```

## Migration Checklist

### Phase 1: Core Services ✅
- [x] playerCoreService.ts
- [x] economyService.ts
- [x] spinsService.ts
- [x] barracoService.ts
- [x] luxuryService.ts
- [x] skillTreeService.ts
- [x] inventoryService.ts
- [x] investmentService.ts

### Phase 2: Store Refactoring ✅
- [x] playerStore.ts - Simplified to session cache only
- [x] usePlayerAuth.ts - Updated to use new services

### Phase 3: Component Updates (TODO)
- [ ] SlotMachine.tsx - Use spinsService
- [ ] BarracoPage.tsx - Use barracoService
- [ ] LuxuryShowroom.tsx - Use luxuryService
- [ ] All bribery pages - Use economyService
- [ ] Skill tree pages - Use skillTreeService

### Phase 4: Cleanup (TODO)
- [ ] Remove spinVaultStore usage
- [ ] Remove spinEconomyService usage
- [ ] Remove localStorage for player data
- [ ] Remove old playerStore methods

## Key Rules

1. **Database First**: Always save to database, never just to store
2. **Service Layer**: Use services, never call BaseCrudService directly
3. **Optimistic Updates**: Update UI immediately, revert on error
4. **Error Handling**: Always wrap service calls in try/catch
5. **Store as Cache**: playerStore is read-only cache, not source of truth

## Testing Checklist

- [ ] Login → Player data loads from database
- [ ] Spin → Money added to database
- [ ] Barraco upgrade → Level saved to database
- [ ] Buy luxury item → Item added to database
- [ ] Logout → Player data cleared from store
- [ ] Login again → All data restored from database
- [ ] Close app → Reopen → All data persists

## Common Mistakes to Avoid

1. **Forgetting to update store after operation**
   ```typescript
   // ❌ WRONG
   await executeSpin(playerId);
   // Player store is now out of sync!
   
   // ✅ CORRECT
   const { player: updated } = await executeSpin(playerId);
   setPlayer(updated);
   ```

2. **Using old services**
   ```typescript
   // ❌ WRONG
   import { spinEconomyService } from '@/services';
   
   // ✅ CORRECT
   import { executeSpin } from '@/services/spinsService';
   ```

3. **Storing data in localStorage**
   ```typescript
   // ❌ WRONG
   localStorage.setItem('playerMoney', money);
   
   // ✅ CORRECT
   const updated = await addDirtyMoney(playerId, amount);
   setPlayer(updated);
   ```

4. **Not handling errors**
   ```typescript
   // ❌ WRONG
   await executeSpin(playerId);
   
   // ✅ CORRECT
   try {
     const result = await executeSpin(playerId);
     setPlayer(result.player);
   } catch (error) {
     console.error('Spin failed:', error);
     showError(error.message);
   }
   ```

## Performance Considerations

- Services cache nothing - they always hit the database
- For read-heavy operations, consider caching in the store
- For write operations, always go through services
- Batch operations when possible to reduce database calls

## Future Improvements

1. Add transaction support for complex operations
2. Implement optimistic updates for better UX
3. Add real-time sync for multiplayer
4. Add audit logging for all operations
5. Implement rollback for failed operations
