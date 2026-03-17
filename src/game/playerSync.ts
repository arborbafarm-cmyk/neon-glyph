import { loadPlayers } from "@/services/playerService";
import { useGameStore } from "@/store/gameStore";

export async function syncPlayers() {
  const players = await loadPlayers();

  const formatted: any = {};
  players.forEach((p: any) => {
    formatted[p.playerId] = p;
  });

  useGameStore.getState().setPlayers(formatted);
}
