import { loadPlayers } from "@/services/playerService";
import { useGameStore } from "@/store/gameStore";
import { Players } from "@/entities";

export async function syncPlayers() {
  try {
    const players = await loadPlayers();

    const formatted: Record<string, Players> = {};
    players.forEach((p: Players) => {
      if (p.playerId) {
        formatted[p.playerId] = p;
      }
    });

    useGameStore.getState().setPlayers(formatted);
    return formatted;
  } catch (error) {
    console.error("Erro ao sincronizar jogadores:", error);
    throw error;
  }
}

export async function addPlayerToSync(player: Players) {
  const { addPlayer } = useGameStore.getState();
  addPlayer(player);
}

export async function updatePlayerInSync(playerId: string, updates: Partial<Players>) {
  const { updatePlayer } = useGameStore.getState();
  updatePlayer(playerId, updates);
}
