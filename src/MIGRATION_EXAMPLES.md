# Migration Examples - From Old to New System

## Example 1: Slot Machine (Spins)

### ❌ OLD WAY (WRONG)
```typescript
import { useSpinVaultStore } from '@/store/spinVaultStore';
import { usePlayerStore } from '@/store/playerStore';

function SlotMachine() {
  const { spins, setSpins } = useSpinVaultStore();
  const { dirtyMoney, setDirtyMoney } = usePlayerStore();

  const handleSpin = () => {
    if (spins <= 0) return;

    // ❌ Only updates store, not database!
    setSpins(spins - 1);
    
    const reward = Math.random() * 500;
    setDirtyMoney(dirtyMoney + reward);
    
    // ❌ Data lost on logout or app close!
  };

  return (
    <div>
      <p>Spins: {spins}</p>
      <p>Money: {dirtyMoney}</p>
      <button onClick={handleSpin}>Spin</button>
    </div>
  );
}
```

### ✅ NEW WAY (CORRECT)
```typescript
import { usePlayerStore } from '@/store/playerStore';
import { executeSpin } from '@/services/spinsService';

function SlotMachine() {
  const { player, setPlayer } = usePlayerStore();
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpin = async () => {
    if (!player || (player.spins ?? 0) <= 0) return;

    setIsSpinning(true);
    try {
      // ✅ Saves to database automatically
      const { player: updated, reward } = await executeSpin(player._id);
      
      // ✅ Update store with new data
      setPlayer(updated);
      
      // Show reward animation
      showRewardAnimation(reward);
    } catch (error) {
      console.error('Spin failed:', error);
      showError(error.message);
    } finally {
      setIsSpinning(false);
    }
  };

  if (!player) return <div>Loading...</div>;

  return (
    <div>
      <p>Spins: {player.spins ?? 0}</p>
      <p>Money: {player.dirtyMoney ?? 0}</p>
      <button onClick={handleSpin} disabled={isSpinning || (player.spins ?? 0) <= 0}>
        {isSpinning ? 'Spinning...' : 'Spin'}
      </button>
    </div>
  );
}
```

## Example 2: Barraco Upgrade

### ❌ OLD WAY (WRONG)
```typescript
import { usePlayerStore } from '@/store/playerStore';

function BarracoUpgrade() {
  const { barracoLevel, setBarracoLevel, dirtyMoney, setDirtyMoney } = usePlayerStore();

  const handleUpgrade = () => {
    const cost = barracoLevel * 1000;
    
    if (dirtyMoney < cost) {
      alert('Not enough money!');
      return;
    }

    // ❌ Only updates store!
    setBarracoLevel(barracoLevel + 1);
    setDirtyMoney(dirtyMoney - cost);
    
    // ❌ Not saved to database!
  };

  return (
    <div>
      <p>Level: {barracoLevel}</p>
      <p>Cost: {barracoLevel * 1000}</p>
      <button onClick={handleUpgrade}>Upgrade</button>
    </div>
  );
}
```

### ✅ NEW WAY (CORRECT)
```typescript
import { usePlayerStore } from '@/store/playerStore';
import { upgradeBarraco, getNextUpgradeCost, canUpgradeBarraco } from '@/services/barracoService';

function BarracoUpgrade() {
  const { player, setPlayer } = usePlayerStore();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [nextCost, setNextCost] = useState(0);

  useEffect(() => {
    if (player) {
      getNextUpgradeCost(player._id).then(setNextCost);
    }
  }, [player]);

  const handleUpgrade = async () => {
    if (!player) return;

    setIsUpgrading(true);
    try {
      // ✅ Saves to database automatically
      const updated = await upgradeBarraco(player._id);
      
      // ✅ Update store with new data
      setPlayer(updated);
      
      // ✅ Update next cost
      const cost = await getNextUpgradeCost(updated._id);
      setNextCost(cost);
      
      showSuccess('Barraco upgraded!');
    } catch (error) {
      console.error('Upgrade failed:', error);
      showError(error.message);
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!player) return <div>Loading...</div>;

  return (
    <div>
      <p>Level: {player.barracoLevel ?? 1}</p>
      <p>Next cost: {nextCost}</p>
      <button 
        onClick={handleUpgrade} 
        disabled={isUpgrading || !canUpgradeBarraco(player._id)}
      >
        {isUpgrading ? 'Upgrading...' : 'Upgrade'}
      </button>
    </div>
  );
}
```

## Example 3: Luxury Item Purchase

### ❌ OLD WAY (WRONG)
```typescript
import { usePlayerStore } from '@/store/playerStore';

function LuxuryShop() {
  const { cleanMoney, setCleanMoney, ownedLuxuryItems, setOwnedLuxuryItems } = usePlayerStore();

  const handleBuy = (itemId: string, price: number) => {
    if (cleanMoney < price) {
      alert('Not enough money!');
      return;
    }

    // ❌ Only updates store!
    setCleanMoney(cleanMoney - price);
    setOwnedLuxuryItems([...ownedLuxuryItems, itemId]);
    
    // ❌ Not saved to database!
  };

  return (
    <div>
      <p>Clean Money: {cleanMoney}</p>
      <button onClick={() => handleBuy('item1', 5000)}>Buy Item</button>
    </div>
  );
}
```

### ✅ NEW WAY (CORRECT)
```typescript
import { usePlayerStore } from '@/store/playerStore';
import { buyLuxuryItem, canBuyLuxuryItem } from '@/services/luxuryService';

function LuxuryShop() {
  const { player, setPlayer } = usePlayerStore();
  const [isBuying, setIsBuying] = useState(false);

  const handleBuy = async (itemId: string, price: number) => {
    if (!player) return;

    setIsBuying(true);
    try {
      // ✅ Saves to database automatically
      const updated = await buyLuxuryItem(player._id, itemId, price);
      
      // ✅ Update store with new data
      setPlayer(updated);
      
      showSuccess('Item purchased!');
    } catch (error) {
      console.error('Purchase failed:', error);
      showError(error.message);
    } finally {
      setIsBuying(false);
    }
  };

  if (!player) return <div>Loading...</div>;

  return (
    <div>
      <p>Clean Money: {player.cleanMoney ?? 0}</p>
      <button 
        onClick={() => handleBuy('item1', 5000)} 
        disabled={isBuying || !(await canBuyLuxuryItem(player._id, 5000))}
      >
        {isBuying ? 'Buying...' : 'Buy Item'}
      </button>
    </div>
  );
}
```

## Example 4: Money Operations (Bribery)

### ❌ OLD WAY (WRONG)
```typescript
import { usePlayerStore } from '@/store/playerStore';

function BriberyPage() {
  const { dirtyMoney, setDirtyMoney } = usePlayerStore();

  const handleBribe = (amount: number) => {
    if (dirtyMoney < amount) {
      alert('Not enough money!');
      return;
    }

    // ❌ Only updates store!
    setDirtyMoney(dirtyMoney - amount);
    
    // ❌ Not saved to database!
  };

  return (
    <div>
      <p>Dirty Money: {dirtyMoney}</p>
      <button onClick={() => handleBribe(10000)}>Bribe Guard</button>
    </div>
  );
}
```

### ✅ NEW WAY (CORRECT)
```typescript
import { usePlayerStore } from '@/store/playerStore';
import { removeDirtyMoney } from '@/services/economyService';

function BriberyPage() {
  const { player, setPlayer } = usePlayerStore();
  const [isBribing, setIsBribing] = useState(false);

  const handleBribe = async (amount: number) => {
    if (!player) return;

    setIsBribing(true);
    try {
      // ✅ Saves to database automatically
      const updated = await removeDirtyMoney(player._id, amount);
      
      // ✅ Update store with new data
      setPlayer(updated);
      
      showSuccess('Bribe successful!');
    } catch (error) {
      console.error('Bribe failed:', error);
      showError(error.message);
    } finally {
      setIsBribing(false);
    }
  };

  if (!player) return <div>Loading...</div>;

  return (
    <div>
      <p>Dirty Money: {player.dirtyMoney ?? 0}</p>
      <button 
        onClick={() => handleBribe(10000)} 
        disabled={isBribing || (player.dirtyMoney ?? 0) < 10000}
      >
        {isBribing ? 'Bribing...' : 'Bribe Guard'}
      </button>
    </div>
  );
}
```

## Example 5: Skill Unlock

### ❌ OLD WAY (WRONG)
```typescript
import { usePlayerStore } from '@/store/playerStore';

function SkillTree() {
  const { skillTrees, setSkillTrees } = usePlayerStore();

  const handleUnlock = (skillId: string) => {
    // ❌ Only updates store!
    const updated = {
      ...skillTrees,
      attack: {
        ...skillTrees.attack,
        [skillId]: true
      }
    };
    setSkillTrees(updated);
    
    // ❌ Not saved to database!
  };

  return (
    <div>
      <button onClick={() => handleUnlock('skill1')}>Unlock Skill</button>
    </div>
  );
}
```

### ✅ NEW WAY (CORRECT)
```typescript
import { usePlayerStore } from '@/store/playerStore';
import { unlockSkill } from '@/services/skillTreeService';

function SkillTree() {
  const { player, setPlayer } = usePlayerStore();
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async (skillId: string) => {
    if (!player) return;

    setIsUnlocking(true);
    try {
      // ✅ Saves to database automatically
      const updated = await unlockSkill(player._id, 'attack', skillId);
      
      // ✅ Update store with new data
      setPlayer(updated);
      
      showSuccess('Skill unlocked!');
    } catch (error) {
      console.error('Unlock failed:', error);
      showError(error.message);
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!player) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={() => handleUnlock('skill1')} disabled={isUnlocking}>
        {isUnlocking ? 'Unlocking...' : 'Unlock Skill'}
      </button>
    </div>
  );
}
```

## Summary of Changes

| Operation | Old | New |
|-----------|-----|-----|
| Get data | `usePlayerStore()` | `usePlayerStore().player` |
| Update money | `setDirtyMoney()` | `await addDirtyMoney()` |
| Update spins | `setSpins()` | `await addSpins()` |
| Upgrade barraco | `setBarracoLevel()` | `await upgradeBarraco()` |
| Buy item | `setOwnedLuxuryItems()` | `await buyLuxuryItem()` |
| Unlock skill | `setSkillTrees()` | `await unlockSkill()` |
| Save location | `localStorage` | Database (automatic) |
| Error handling | None | try/catch required |
| Data persistence | ❌ Lost on logout | ✅ Saved to database |

## Key Differences

1. **All operations are async** - They hit the database
2. **Always update store after operation** - Keep UI in sync
3. **Always handle errors** - Operations can fail
4. **No localStorage** - Everything goes to database
5. **No separate stores for money/spins** - Use playerStore.player only
