import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { createInitialPlayerLot } from '@/services/playerLotService';

export function useEnsurePlayerLot(gridWidth: number, gridHeight: number) {
  const player = usePlayerStore((state) => state.player);
  const ranRef = useRef(false);

  useEffect(() => {
    const ensureLot = async () => {
      if (ranRef.current) return;
      if (!player?._id) return;

      ranRef.current = true;

      try {
        await createInitialPlayerLot(
          player._id,
          player.playerName || 'Player',
          gridWidth,
          gridHeight
        );
      } catch (error) {
        console.error('Erro ao criar lote:', error);
      }
    };

    ensureLot();
  }, [player?._id, player?.playerName, gridWidth, gridHeight]);
}