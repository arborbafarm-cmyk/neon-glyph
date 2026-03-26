# Complete Player Load System

## Overview

The `loadPlayerFromDatabase()` function now loads **ALL** player-related data from the database, not just basic information. This ensures that when a player logs in, their entire game state is fully restored.

## What Gets Loaded

### 1. **Basic Player Data** → `playerStore`
- `playerId` - Unique identifier
- `playerName` - Player's name
- `level` - Current level (1-100)
- `progress` - Progress towards next level
- `isGuest` - Whether player is guest
- `profilePicture` - Profile image URL
- `barracoLevel` - Barraco/hideout level
- `cleanMoney` - Money from legitimate sources
- `dirtyMoney` - Money from illegal sources
- `spins` - Spin Vault spins available

### 2. **Skill Trees** → `skillTreeStore`
- All 6 skill trees (inteligência, agilidade, ataque, defesa, respeito, vigor)
- Each skill's current level and upgrades
- Player money in skill tree context
- Cooldowns for skill usage
- Passive bonuses from skills

### 3. **Luxury Items** → `luxuryShopStore`
- All purchased luxury items (vehicles, properties, accessories, upgrades)
- Item IDs stored for quick lookup
- Bonuses from owned items (money multipliers, spins, level bonuses)

### 4. **Comercios/Money Laundering** → `comerciosStore`
- All 5 businesses (pizzaria, admBens, lavanderia, academia, templo)
- Each business's level, tax level, current value
- Active operations and cooldowns
- Applied tax rates

### 5. **Inventory** → `playerStore.inventory`
- Player's items and equipment
- Quantities and metadata
- Used by inventory system

### 6. **Investments** → `playerStore.investments`
- Active investments
- Investment returns and timers
- Special page progress data

### 7. **Cooldowns & Passive Bonuses** → `playerStore`
- Important action cooldowns
- Passive bonuses from skills and items
- Used for game mechanics

## Data Flow

```
Database (Players collection)
    ↓
loadPlayerFromDatabase()
    ↓
    ├→ playerStore (basic data + inventory, investments, cooldowns, bonuses)
    ├→ skillTreeStore (skill trees + cooldowns + bonuses)
    ├→ luxuryShopStore (purchased items)
    └→ comerciosStore (businesses)
```

## Usage

### On Login
```typescript
import { loadPlayerFromDatabase } from '@/services/playerDataService';

// After user authenticates
const player = await loadPlayerFromDatabase(memberId);
if (player) {
  console.log('✅ Player fully loaded with all data');
}
```

### Accessing Loaded Data
```typescript
import { usePlayerStore } from '@/store/playerStore';
import { useSkillTreeStore } from '@/store/skillTreeStore';
import { useLuxuryShopStore } from '@/store/luxuryShopStore';
import { useComerciosStore } from '@/store/comerciosStore';

// Basic player data
const { level, spins, dirtyMoney, inventory, investments } = usePlayerStore();

// Skill trees
const { skills } = useSkillTreeStore();

// Luxury items
const { purchasedItems } = useLuxuryShopStore();

// Businesses
const { comercios } = useComerciosStore();
```

### Syncing Back to Database
```typescript
import { syncPlayerToDatabase } from '@/services/playerDataService';

// Call this periodically or on page unload
await syncPlayerToDatabase(playerId);
```

## Database Schema

The `Players` collection stores all data as JSON strings:

```typescript
{
  _id: string;
  playerName: string;
  level: number;
  progress: number;
  dirtyMoney: number;
  cleanMoney: number;
  barracoLevel: number;
  isGuest: boolean;
  profilePicture: string | null;
  spins: number;
  
  // JSON strings containing complex data
  skillTrees: string; // { skills: {...}, playerMoney, cooldowns, passiveBonuses }
  ownedLuxuryItems: string; // [itemId1, itemId2, ...]
  investments: string; // { investmentId: {...} }
  inventory: string; // { itemId: quantity, ... }
  comercios: string; // { pizzaria: {...}, admBens: {...}, ... }
}
```

## Implementation Details

### loadPlayerFromDatabase()
1. Fetches player from database
2. Loads basic data to playerStore
3. Parses and loads skill trees to skillTreeStore
4. Parses and loads luxury items to luxuryShopStore
5. Parses and loads comercios to comerciosStore
6. Parses and loads inventory/investments to playerStore
7. Parses and loads cooldowns/bonuses to playerStore
8. Logs completion with summary

### syncPlayerToDatabase()
1. Collects data from all stores
2. Serializes complex data to JSON
3. Updates database with all fields
4. Ensures consistency across all stores

### createNewPlayer()
1. Creates new player with all fields initialized
2. Initializes empty JSON structures for complex data
3. Calls loadPlayerFromDatabase() to sync to stores
4. Returns fully loaded player

## Error Handling

- Parse errors are caught and logged as warnings
- Missing data is initialized with defaults
- Comercios always initialize with default structure if missing
- No errors are thrown - graceful degradation

## Performance Considerations

- Single database call to fetch player
- All data loaded in parallel (no sequential waits)
- JSON parsing is fast for typical player data sizes
- Stores are in-memory for quick access
- Periodic sync to database recommended (not on every change)

## Testing Checklist

- [ ] Login loads all player data
- [ ] Skill trees persist after reload
- [ ] Luxury items persist after reload
- [ ] Comercios state persists after reload
- [ ] Inventory and investments load correctly
- [ ] Cooldowns and bonuses are restored
- [ ] New players initialize with all fields
- [ ] Sync to database saves all data
- [ ] Parse errors don't crash the app
- [ ] Missing data initializes with defaults

## Migration from Old System

If migrating from old system where only basic data was loaded:

1. Existing players will have empty JSON fields
2. First load will initialize them with defaults
3. First sync will populate them with current store data
4. No data loss - just initialization

## Future Enhancements

- Add data validation on load
- Add encryption for sensitive data
- Add compression for large JSON fields
- Add incremental sync (only changed fields)
- Add offline support with IndexedDB
