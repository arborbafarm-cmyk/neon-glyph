import { BaseCrudService } from '@/integrations';

export interface LoggedInPlayer {
  _id?: string;
  memberId: string;
  playerName: string;
  nickname: string;
  lastSeen: Date | string;
  isOnline: boolean;
}

const COLLECTION_ID = 'playerslogados';

export const playerService = {
  // Register or update a player when they log in
  async registerPlayer(memberId: string, playerName: string, nickname: string): Promise<LoggedInPlayer> {
    try {
      // Check if player already exists
      const existingPlayers = await BaseCrudService.getAll<LoggedInPlayer>(COLLECTION_ID);
      const existingPlayer = existingPlayers.items.find(p => p.memberId === memberId);

      const playerData: LoggedInPlayer = {
        memberId,
        playerName,
        nickname,
        lastSeen: new Date(),
        isOnline: true,
      };

      if (existingPlayer) {
        // Update existing player
        await BaseCrudService.update(COLLECTION_ID, {
          _id: existingPlayer._id,
          ...playerData,
        });
        return { ...playerData, _id: existingPlayer._id };
      } else {
        // Create new player entry
        const newPlayerId = crypto.randomUUID();
        await BaseCrudService.create(COLLECTION_ID, {
          _id: newPlayerId,
          ...playerData,
        });
        return { ...playerData, _id: newPlayerId };
      }
    } catch (error) {
      console.error('Error registering player:', error);
      throw error;
    }
  },

  // Mark player as offline
  async setPlayerOffline(memberId: string): Promise<void> {
    try {
      const existingPlayers = await BaseCrudService.getAll<LoggedInPlayer>(COLLECTION_ID);
      const player = existingPlayers.items.find(p => p.memberId === memberId);

      if (player) {
        await BaseCrudService.update(COLLECTION_ID, {
          _id: player._id,
          isOnline: false,
          lastSeen: new Date(),
        });
      }
    } catch (error) {
      console.error('Error setting player offline:', error);
      throw error;
    }
  },

  // Get all online players
  async getOnlinePlayers(): Promise<LoggedInPlayer[]> {
    try {
      const result = await BaseCrudService.getAll<LoggedInPlayer>(COLLECTION_ID);
      return result.items.filter(p => p.isOnline);
    } catch (error) {
      console.error('Error fetching online players:', error);
      throw error;
    }
  },

  // Get all players
  async getAllPlayers(): Promise<LoggedInPlayer[]> {
    try {
      const result = await BaseCrudService.getAll<LoggedInPlayer>(COLLECTION_ID);
      return result.items;
    } catch (error) {
      console.error('Error fetching all players:', error);
      throw error;
    }
  },

  // Delete player entry
  async deletePlayer(memberId: string): Promise<void> {
    try {
      const existingPlayers = await BaseCrudService.getAll<LoggedInPlayer>(COLLECTION_ID);
      const player = existingPlayers.items.find(p => p.memberId === memberId);

      if (player) {
        await BaseCrudService.delete(COLLECTION_ID, player._id!);
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  },
};
