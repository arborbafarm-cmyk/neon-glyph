/**
 * CENTRALIZED PLAYER DATA SERVICE
 * 
 * This service is the SINGLE SOURCE OF TRUTH for all player data.
 * All components must use this service to read/write player data.
 * 
 * Data Flow:
 * 1. Database (Players collection) = Source of Truth
 * 2. playerStore (Zustand) = In-memory cache
 * 3. Components = Read from playerStore, write through this service
 * 
 * NEVER:
 * - Access localStorage directly for player data
 * - Use separate stores (dirtyMoneyStore, cleanMoneyStore)
 * - Update playerStore directly without syncing to DB
 */

import { BaseCrudService } from "@/integrations";
import { Players } from "@/entities";
import { usePlayerStore } from "@/store/playerStore";
import { useSkillTreeStore } from "@/store/skillTreeStore";
import { useLuxuryShopStore } from "@/store/luxuryShopStore";
import { useComerciosStore } from "@/store/comerciosStore";
import { getInitialComercioData } from "@/types/comercios";

const COLLECTION_ID = "players";

/**
 * Load player from database and sync to ALL stores
 * This is the COMPLETE player load - includes everything:
 * - Basic player data (name, level, money, etc)
 * - Spins and multiplier
 * - Skill trees
 * - Luxury items owned
 * - Investments
 * - Inventory
 * - Comercios/Money laundering businesses
 * - Cooldowns and passive bonuses
 * - Barraco status
 * - Special page progress
 */
export async function loadPlayerFromDatabase(playerId: string): Promise<Players | null> {
  try {
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    
    if (player) {
      // 1. Load basic player data to playerStore
      const playerStore = usePlayerStore.getState();
      playerStore.loadPlayerData({
        playerId: player._id,
        playerName: player.playerName || 'COMANDANTE',
        level: player.level || 1,
        progress: player.progress || 0,
        isGuest: player.isGuest || false,
        profilePicture: player.profilePicture || null,
        barracoLevel: player.barracoLevel || 1,
        cleanMoney: player.cleanMoney || 0,
        dirtyMoney: player.dirtyMoney || 0,
        playerMoney: player.dirtyMoney || 0, // playerMoney = dirtyMoney
        spins: player.spins || 0,
      });

      // 2. Load skill trees
      if (player.skillTrees) {
        try {
          const skillTreesData = JSON.parse(player.skillTrees);
          const skillTreeStore = useSkillTreeStore.getState();
          if (skillTreesData.skills) {
            skillTreeStore.skills = skillTreesData.skills;
          }
          if (skillTreesData.playerMoney !== undefined) {
            skillTreeStore.setPlayerMoney(skillTreesData.playerMoney);
          }
        } catch (e) {
          console.warn('Error parsing skill trees:', e);
        }
      }

      // 3. Load owned luxury items
      if (player.ownedLuxuryItems) {
        try {
          const luxuryItems = JSON.parse(player.ownedLuxuryItems);
          const luxuryStore = useLuxuryShopStore.getState();
          if (Array.isArray(luxuryItems)) {
            luxuryStore.purchasedItems = luxuryItems;
          }
        } catch (e) {
          console.warn('Error parsing luxury items:', e);
        }
      }

      // 4. Load comercios (money laundering businesses)
      if (player.comercios) {
        try {
          const comerciosData = JSON.parse(player.comercios);
          const comerciosStore = useComerciosStore.getState();
          comerciosStore.setComercios(comerciosData);
        } catch (e) {
          console.warn('Error parsing comercios:', e);
          // Initialize with default if parsing fails
          const comerciosStore = useComerciosStore.getState();
          comerciosStore.setComercios(getInitialComercioData());
        }
      } else {
        // Initialize with default if not present
        const comerciosStore = useComerciosStore.getState();
        comerciosStore.setComercios(getInitialComercioData());
      }

      // 5. Load inventory
      if (player.inventory) {
        try {
          const inventoryData = JSON.parse(player.inventory);
          // Store inventory data - can be used by components
          playerStore.inventory = inventoryData;
        } catch (e) {
          console.warn('Error parsing inventory:', e);
        }
      }

      // 6. Load investments
      if (player.investments) {
        try {
          const investmentsData = JSON.parse(player.investments);
          // Store investments data - can be used by components
          playerStore.investments = investmentsData;
        } catch (e) {
          console.warn('Error parsing investments:', e);
        }
      }

      // 7. Load cooldowns and passive bonuses (stored as JSON)
      if (player.skillTrees) {
        try {
          const skillTreesData = JSON.parse(player.skillTrees);
          if (skillTreesData.cooldowns) {
            playerStore.cooldowns = skillTreesData.cooldowns;
          }
          if (skillTreesData.passiveBonuses) {
            playerStore.passiveBonuses = skillTreesData.passiveBonuses;
          }
        } catch (e) {
          console.warn('Error parsing cooldowns/bonuses:', e);
        }
      }

      console.log('✅ Player fully loaded:', {
        name: player.playerName,
        level: player.level,
        spins: player.spins,
        barracoLevel: player.barracoLevel,
        cleanMoney: player.cleanMoney,
        dirtyMoney: player.dirtyMoney,
      });
    }
    
    return player;
  } catch (error) {
    console.error('Error loading player from database:', error);
    return null;
  }
}

/**
 * Update player in database and sync to store
 */
export async function updatePlayerInDatabase(
  playerId: string,
  updates: Partial<Players>
): Promise<Players | null> {
  try {
    // Update database
    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      ...updates,
      lastUpdated: new Date().toISOString(),
    });

    // Reload from database to ensure consistency
    return await loadPlayerFromDatabase(playerId);
  } catch (error) {
    console.error('Error updating player in database:', error);
    return null;
  }
}

/**
 * Get current player from store (cached in-memory)
 */
export function getCurrentPlayerFromStore(): ReturnType<typeof usePlayerStore.getState> {
  return usePlayerStore.getState();
}

/**
 * Update money (dirty money = playerMoney)
 */
export async function updatePlayerMoney(
  playerId: string,
  dirtyMoney: number
): Promise<void> {
  const store = usePlayerStore.getState();
  
  // Update store immediately (optimistic)
  store.setDirtyMoney(Math.max(0, dirtyMoney));
  
  // Sync to database
  try {
    await updatePlayerInDatabase(playerId, {
      dirtyMoney: Math.max(0, dirtyMoney),
    });
  } catch (error) {
    console.error('Error updating player money:', error);
    // On error, reload from database to revert
    await loadPlayerFromDatabase(playerId);
  }
}

/**
 * Update clean money
 */
export async function updateCleanMoney(
  playerId: string,
  cleanMoney: number
): Promise<void> {
  const store = usePlayerStore.getState();
  
  // Update store immediately (optimistic)
  store.setCleanMoney(Math.max(0, cleanMoney));
  
  // Sync to database
  try {
    await updatePlayerInDatabase(playerId, {
      cleanMoney: Math.max(0, cleanMoney),
    });
  } catch (error) {
    console.error('Error updating clean money:', error);
    // On error, reload from database to revert
    await loadPlayerFromDatabase(playerId);
  }
}

/**
 * Update level and progress
 */
export async function updatePlayerProgress(
  playerId: string,
  level: number,
  progress: number
): Promise<void> {
  const store = usePlayerStore.getState();
  
  // Update store immediately (optimistic)
  store.setLevel(level);
  store.setProgress(progress);
  
  // Sync to database
  try {
    await updatePlayerInDatabase(playerId, {
      level,
      progress,
    });
  } catch (error) {
    console.error('Error updating player progress:', error);
    // On error, reload from database to revert
    await loadPlayerFromDatabase(playerId);
  }
}

/**
 * Update barraco level
 */
export async function updateBarracoLevel(
  playerId: string,
  barracoLevel: number
): Promise<void> {
  const store = usePlayerStore.getState();
  
  // Update store immediately (optimistic)
  store.setBarracoLevel(barracoLevel);
  
  // Sync to database
  try {
    await updatePlayerInDatabase(playerId, {
      barracoLevel,
    });
  } catch (error) {
    console.error('Error updating barraco level:', error);
    // On error, reload from database to revert
    await loadPlayerFromDatabase(playerId);
  }
}

/**
 * Sync all player data to database
 * Call this periodically or on page unload
 * Includes: basic data, spins, skill trees, luxury items, comercios, inventory, investments
 */
export async function syncPlayerToDatabase(playerId: string): Promise<void> {
  try {
    const playerStore = usePlayerStore.getState();
    const skillTreeStore = useSkillTreeStore.getState();
    const luxuryStore = useLuxuryShopStore.getState();
    const comerciosStore = useComerciosStore.getState();
    
    // Prepare skill trees data
    const skillTreesData = {
      skills: skillTreeStore.skills,
      playerMoney: skillTreeStore.playerMoney,
      cooldowns: playerStore.cooldowns || {},
      passiveBonuses: playerStore.passiveBonuses || {},
    };

    // Prepare luxury items data
    const luxuryItemsData = luxuryStore.purchasedItems;

    // Prepare investments data
    const investmentsData = playerStore.investments || {};

    // Prepare inventory data
    const inventoryData = playerStore.inventory || {};
    
    await updatePlayerInDatabase(playerId, {
      playerName: playerStore.playerName,
      level: playerStore.level,
      progress: playerStore.progress,
      dirtyMoney: playerStore.dirtyMoney,
      cleanMoney: playerStore.cleanMoney,
      barracoLevel: playerStore.barracoLevel,
      isGuest: playerStore.isGuest,
      profilePicture: playerStore.profilePicture,
      spins: playerStore.spins,
      skillTrees: JSON.stringify(skillTreesData),
      ownedLuxuryItems: JSON.stringify(luxuryItemsData),
      investments: JSON.stringify(investmentsData),
      inventory: JSON.stringify(inventoryData),
      comercios: JSON.stringify(comerciosStore.comercios || getInitialComercioData()),
    });
  } catch (error) {
    console.error('Error syncing player to database:', error);
  }
}

/**
 * Create new player in database with all data initialized
 */
export async function createNewPlayer(playerData: Partial<Players>): Promise<Players | null> {
  try {
    if (!playerData._id) {
      playerData._id = crypto.randomUUID();
    }

    const newPlayer: Players = {
      _id: playerData._id,
      playerName: playerData.playerName || 'COMANDANTE',
      level: playerData.level || 1,
      progress: playerData.progress || 0,
      dirtyMoney: playerData.dirtyMoney || 0,
      cleanMoney: playerData.cleanMoney || 0,
      barracoLevel: playerData.barracoLevel || 1,
      isGuest: playerData.isGuest || false,
      profilePicture: playerData.profilePicture || null,
      spins: playerData.spins || 0,
      // Initialize all data fields as empty JSON
      skillTrees: JSON.stringify({
        skills: {},
        playerMoney: 0,
        cooldowns: {},
        passiveBonuses: {},
      }),
      ownedLuxuryItems: JSON.stringify([]),
      investments: JSON.stringify({}),
      inventory: JSON.stringify({}),
      comercios: JSON.stringify(getInitialComercioData()),
    };

    await BaseCrudService.create(COLLECTION_ID, newPlayer);
    
    // Sync to store
    await loadPlayerFromDatabase(newPlayer._id);
    
    return newPlayer;
  } catch (error) {
    console.error('Error creating new player:', error);
    return null;
  }
}

/**
 * Delete player from database
 */
export async function deletePlayerFromDatabase(playerId: string): Promise<void> {
  try {
    await BaseCrudService.delete(COLLECTION_ID, playerId);
    
    // Reset store
    const store = usePlayerStore.getState();
    store.resetPlayer();
  } catch (error) {
    console.error('Error deleting player:', error);
  }
}
