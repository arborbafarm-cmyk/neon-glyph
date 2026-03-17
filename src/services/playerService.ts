import { BaseCrudService } from "@/integrations";
import { Players } from "@/entities";

const COLLECTION_ID = "players";

export async function savePlayer(player: Partial<Players>) {
  if (!player._id) {
    player._id = crypto.randomUUID();
  }
  return BaseCrudService.create(COLLECTION_ID, player as Players);
}

export async function updatePlayer(playerId: string, updates: Partial<Players>) {
  return BaseCrudService.update(COLLECTION_ID, { _id: playerId, ...updates });
}

export async function loadPlayers() {
  const result = await BaseCrudService.getAll<Players>(COLLECTION_ID);
  return result.items || [];
}

export async function getPlayerById(playerId: string) {
  return BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
}

export async function deletePlayer(playerId: string) {
  return BaseCrudService.delete(COLLECTION_ID, playerId);
}
