import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { usePlayerStore } from '@/store/playerStore';

const COLLECTION_ID = 'players';

/**
 * SPIN ECONOMY SERVICE - PHASE 4
 * 
 * Centralized spin management with database as single source of truth.
 * All spin operations must go through this service.
 * 
 * Flow:
 * 1. Verify spins in database
 * 2. Deduct spins
 * 3. Calculate result
 * 4. Apply rewards
 * 5. Save updated player to database
 * 6. Sync store with database
 */

export interface SpinResult {
  success: boolean;
  spinsRemaining: number;
  error?: string;
}

export interface SpinOperationResult extends SpinResult {
  moneyGained: number;
  multiplierGained: number;
  prisonHit: boolean;
  moneyLost?: number;
}

/**
 * Verify player has enough spins in database
 */
export async function verifySpinsInDatabase(playerId: string, spinsNeeded: number): Promise<boolean> {
  try {
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) return false;
    return (player.spins ?? 0) >= spinsNeeded;
  } catch {
    return false;
  }
}

/**
 * Get current spins from database
 */
export async function getSpinsFromDatabase(playerId: string): Promise<number> {
  try {
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    return player?.spins ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Deduct spins from database and sync to store
 * Returns true if successful, false if insufficient spins
 */
export async function deductSpinsFromDatabase(
  playerId: string,
  amount: number
): Promise<SpinResult> {
  try {
    // Step 1: Get current player data from database
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) {
      return { success: false, spinsRemaining: 0, error: 'Jogador não encontrado' };
    }

    const currentSpins = player.spins ?? 0;

    // Step 2: Verify sufficient spins
    if (currentSpins < amount) {
      return {
        success: false,
        spinsRemaining: currentSpins,
        error: 'Giros insuficientes',
      };
    }

    // Step 3: Deduct spins and save to database
    const newSpins = currentSpins - amount;
    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      spins: newSpins,
    });

    // Step 4: Sync to store
    usePlayerStore.getState().setSpins(newSpins);

    return {
      success: true,
      spinsRemaining: newSpins,
    };
  } catch (error) {
    return {
      success: false,
      spinsRemaining: 0,
      error: `Erro ao descontar giros: ${error instanceof Error ? error.message : 'Desconhecido'}`,
    };
  }
}

/**
 * Add spins to database (from Barraco passive gain)
 */
export async function addSpinsToDatabase(playerId: string, amount: number): Promise<SpinResult> {
  try {
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) {
      return { success: false, spinsRemaining: 0, error: 'Jogador não encontrado' };
    }

    const currentSpins = player.spins ?? 0;
    const newSpins = currentSpins + amount;

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      spins: newSpins,
    });

    usePlayerStore.getState().setSpins(newSpins);

    return {
      success: true,
      spinsRemaining: newSpins,
    };
  } catch (error) {
    return {
      success: false,
      spinsRemaining: 0,
      error: `Erro ao adicionar giros: ${error instanceof Error ? error.message : 'Desconhecido'}`,
    };
  }
}

/**
 * Apply spin result: update money and multiplier in database
 */
export async function applySpinResult(
  playerId: string,
  moneyGain: number,
  multiplierGain: number,
  moneyLoss: number = 0
): Promise<SpinOperationResult> {
  try {
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) {
      return {
        success: false,
        spinsRemaining: 0,
        moneyGained: 0,
        multiplierGained: 0,
        prisonHit: false,
        error: 'Jogador não encontrado',
      };
    }

    const currentDirty = player.dirtyMoney ?? 0;
    let newDirty = currentDirty;

    if (moneyLoss > 0) {
      // Prison hit: lose money
      newDirty = Math.max(0, currentDirty - moneyLoss);
    } else if (moneyGain > 0) {
      // Normal win: gain money
      newDirty = currentDirty + moneyGain;
    }

    // Update player in database
    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      dirtyMoney: newDirty,
    });

    // Sync to store
    usePlayerStore.getState()._setDirtyMoney(newDirty);

    return {
      success: true,
      spinsRemaining: player.spins ?? 0,
      moneyGained: moneyGain,
      multiplierGained: multiplierGain,
      prisonHit: moneyLoss > 0,
      moneyLost: moneyLoss,
    };
  } catch (error) {
    return {
      success: false,
      spinsRemaining: 0,
      moneyGained: 0,
      multiplierGained: 0,
      prisonHit: false,
      error: `Erro ao aplicar resultado: ${error instanceof Error ? error.message : 'Desconhecido'}`,
    };
  }
}

/**
 * Complete spin operation: deduct spins, apply result, save everything
 * This is the main entry point for slot machine spins
 */
export async function executeSpinOperation(
  playerId: string,
  spinsToDeduct: number,
  moneyGain: number,
  multiplierGain: number,
  moneyLoss: number = 0
): Promise<SpinOperationResult> {
  try {
    // Step 1: Verify spins in database
    const hasSpins = await verifySpinsInDatabase(playerId, spinsToDeduct);
    if (!hasSpins) {
      const currentSpins = await getSpinsFromDatabase(playerId);
      return {
        success: false,
        spinsRemaining: currentSpins,
        moneyGained: 0,
        multiplierGained: 0,
        prisonHit: false,
        error: 'Giros insuficientes',
      };
    }

    // Step 2: Deduct spins from database
    const deductResult = await deductSpinsFromDatabase(playerId, spinsToDeduct);
    if (!deductResult.success) {
      return {
        success: false,
        spinsRemaining: deductResult.spinsRemaining,
        moneyGained: 0,
        multiplierGained: 0,
        prisonHit: false,
        error: deductResult.error,
      };
    }

    // Step 3: Apply spin result (money/multiplier)
    const applyResult = await applySpinResult(playerId, moneyGain, multiplierGain, moneyLoss);
    if (!applyResult.success) {
      return {
        success: false,
        spinsRemaining: deductResult.spinsRemaining,
        moneyGained: 0,
        multiplierGained: 0,
        prisonHit: false,
        error: applyResult.error,
      };
    }

    // Step 4: Return complete result
    return {
      success: true,
      spinsRemaining: deductResult.spinsRemaining,
      moneyGained: applyResult.moneyGained,
      multiplierGained: applyResult.multiplierGained,
      prisonHit: applyResult.prisonHit,
      moneyLost: applyResult.moneyLost,
    };
  } catch (error) {
    return {
      success: false,
      spinsRemaining: 0,
      moneyGained: 0,
      multiplierGained: 0,
      prisonHit: false,
      error: `Erro na operação de giro: ${error instanceof Error ? error.message : 'Desconhecido'}`,
    };
  }
}

/**
 * Sync spins from database to store
 * Call this when loading player data
 */
export async function syncSpinsFromDatabase(playerId: string): Promise<number> {
  try {
    const spins = await getSpinsFromDatabase(playerId);
    usePlayerStore.getState().setSpins(spins);
    return spins;
  } catch {
    return 0;
  }
}
