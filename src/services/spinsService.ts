/**
 * SPIN SERVICE - SINGLE SOURCE OF TRUTH
 *
 * Regras:
 * - NÃO usar BaseCrudService direto
 * - NÃO duplicar savePlayer
 * - Economia passa SEMPRE por playerEconomyService
 * - Atualiza store apenas UMA vez
 */

import { getPlayer, savePlayer } from '@/services/playerCoreService';
import {
  addDirtyMoney,
  removeDirtyMoney,
} from '@/services/playerEconomyService';
import { usePlayerStore } from '@/store/playerStore';

type SymbolType = '💎' | '💵' | '🔫' | '🚔';

interface SpinResponse {
  type: 'jackpot' | 'money' | 'attack' | 'prison' | 'none';
  amount: number;
  updatedPlayer: any;
}

export async function executeSpinOperation(
  playerId: string,
  outcome: SymbolType[],
  multiplier: number
): Promise<SpinResponse> {
  try {
    const player = await getPlayer(playerId);

    if (!player) {
      throw new Error('Player não encontrado');
    }

    if ((player.spins ?? 0) <= 0) {
      throw new Error('Sem spins disponíveis');
    }

    // 🔥 SEMPRE desconta 1 spin
    let updatedPlayer = await savePlayer({
      ...player,
      spins: (player.spins ?? 0) - 1,
    });

    let result: SpinResponse = {
      type: 'none',
      amount: 0,
      updatedPlayer,
    };

    const [a, b, c] = outcome;

    // =========================
    // 💎 JACKPOT
    // =========================
    if (a === '💎' && b === '💎' && c === '💎') {
      const amount = 10000 * multiplier;

      updatedPlayer = await addDirtyMoney(
        playerId,
        amount,
        'SPIN_JACKPOT'
      );

      result = {
        type: 'jackpot',
        amount,
        updatedPlayer,
      };
    }

    // =========================
    // 💵 DINHEIRO
    // =========================
    else if (a === '💵' && b === '💵' && c === '💵') {
      const amount = 1000 * multiplier;

      updatedPlayer = await addDirtyMoney(
        playerId,
        amount,
        'SPIN_MONEY'
      );

      result = {
        type: 'money',
        amount,
        updatedPlayer,
      };
    }

    // =========================
    // 🔫 ATAQUE
    // =========================
    else if (a === '🔫' && b === '🔫' && c === '🔫') {
      const amount = 2000 * multiplier;

      updatedPlayer = await addDirtyMoney(
        playerId,
        amount,
        'SPIN_ATTACK'
      );

      result = {
        type: 'attack',
        amount,
        updatedPlayer,
      };
    }

    // =========================
    // 🚔 PRISÃO
    // =========================
    else if (a === '🚔' && b === '🚔' && c === '🚔') {
      const currentMoney = player.dirtyMoney ?? 0;
      const loss = Math.floor(currentMoney * 0.3);

      updatedPlayer = await removeDirtyMoney(
        playerId,
        loss,
        'SPIN_PRISON'
      );

      result = {
        type: 'prison',
        amount: loss,
        updatedPlayer,
      };
    }

    // =========================
    // 🎯 FINAL SYNC
    // =========================
    if (updatedPlayer) {
      usePlayerStore.getState().setPlayer(updatedPlayer);
    }

    return result;
  } catch (error: any) {
    console.error('Erro no spinService:', error);
    throw new Error(error?.message || 'Erro no spin');
  }
}