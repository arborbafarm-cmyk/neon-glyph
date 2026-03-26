/**
 * MULTIPLAYER PRESENCE SERVICE
 *
 * Handles all multiplayer presence-related operations:
 * - Updating player presence
 * - Loading online players
 * - Managing player status
 * - Tracking player location
 *
 * This service is the single source of truth for multiplayer presence.
 */

import { BaseCrudService } from '@/integrations';
import { PlayerPresence } from '@/entities';

const COLLECTION_ID = 'playerpresence';

export interface PlayerStatus {
  playerId: string;
  playerName?: string;
  mapPosition: string;
  currentComplex?: string;
  currentArea?: string;
  status: 'online' | 'offline' | 'away';
  lastSeenAt: Date;
  isOnline: boolean;
}

function normalizeDate(value?: Date | string): Date {
  if (!value) return new Date();
  return value instanceof Date ? value : new Date(value);
}

function parseMapPosition(mapPosition: string): {
  currentComplex?: string;
  currentArea?: string;
} {
  const [currentComplex, currentArea] = mapPosition.split(':');
  return {
    currentComplex: currentComplex || undefined,
    currentArea: currentArea || undefined,
  };
}

function toPlayerStatus(presence: PlayerPresence): PlayerStatus {
  return {
    playerId: presence.playerId || '',
    playerName: presence.playerName || undefined,
    mapPosition: presence.mapPosition || 'unknown',
    currentComplex: presence.currentComplex || undefined,
    currentArea: presence.currentArea || undefined,
    status: (presence.status as 'online' | 'offline' | 'away') || 'offline',
    lastSeenAt: normalizeDate(presence.lastSeenAt),
    isOnline: presence.isOnline || false,
  };
}

async function findPresenceByPlayerId(playerId: string): Promise<PlayerPresence | null> {
  const result = await BaseCrudService.getAll<PlayerPresence>(COLLECTION_ID);
  const existingPresence = result.items?.find((p) => p.playerId === playerId);
  return existingPresence || null;
}

/**
 * Update player presence
 */
export async function updatePlayerPresence(
  playerId: string,
  mapPosition: string,
  status: 'online' | 'offline' | 'away' = 'online',
  playerName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const existingPresence = await findPresenceByPlayerId(playerId);
    const now = new Date().toISOString();
    const { currentComplex, currentArea } = parseMapPosition(mapPosition);

    const presenceData: PlayerPresence = {
      _id: existingPresence?._id || crypto.randomUUID(),
      playerId,
      playerName: playerName || existingPresence?.playerName || '',
      mapPosition,
      currentComplex,
      currentArea,
      status,
      lastSeenAt: now,
      updatedAt: now,
      isOnline: status === 'online',
      complexStatus: `${status}:${mapPosition}`,
    };

    if (existingPresence) {
      await BaseCrudService.update(COLLECTION_ID, presenceData);
    } else {
      await BaseCrudService.create(COLLECTION_ID, presenceData);
    }

    console.log(`[PRESENCE] Updated ${playerId} - ${status} at ${mapPosition}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update player presence:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get player presence
 */
export async function getPlayerPresence(playerId: string): Promise<PlayerStatus | null> {
  try {
    const presence = await findPresenceByPlayerId(playerId);

    if (!presence) {
      return null;
    }

    return toPlayerStatus(presence);
  } catch (error) {
    console.error('Failed to get player presence:', error);
    return null;
  }
}

/**
 * Get all online players
 */
export async function getOnlinePlayers(): Promise<PlayerStatus[]> {
  try {
    const result = await BaseCrudService.getAll<PlayerPresence>(COLLECTION_ID);
    const onlinePlayers = result.items?.filter((p) => p.isOnline) || [];
    return onlinePlayers.map(toPlayerStatus);
  } catch (error) {
    console.error('Failed to get online players:', error);
    return [];
  }
}

/**
 * Get players in specific location
 */
export async function getPlayersInLocation(mapPosition: string): Promise<PlayerStatus[]> {
  try {
    const result = await BaseCrudService.getAll<PlayerPresence>(COLLECTION_ID);
    const playersInLocation =
      result.items?.filter((p) => p.mapPosition === mapPosition && p.isOnline) || [];

    return playersInLocation.map(toPlayerStatus);
  } catch (error) {
    console.error('Failed to get players in location:', error);
    return [];
  }
}

/**
 * Set player offline
 */
export async function setPlayerOffline(
  playerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const presence = await findPresenceByPlayerId(playerId);

    if (!presence) {
      return { success: false, error: 'Player presence not found' };
    }

    const now = new Date().toISOString();

    await BaseCrudService.update(COLLECTION_ID, {
      ...presence,
      _id: presence._id,
      status: 'offline',
      isOnline: false,
      lastSeenAt: now,
      updatedAt: now,
      complexStatus: `offline:${presence.mapPosition || 'unknown'}`,
    });

    console.log(`[PRESENCE] Set ${playerId} offline`);
    return { success: true };
  } catch (error) {
    console.error('Failed to set player offline:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get player count in location
 */
export async function getPlayerCountInLocation(mapPosition: string): Promise<number> {
  try {
    const players = await getPlayersInLocation(mapPosition);
    return players.length;
  } catch (error) {
    console.error('Failed to get player count in location:', error);
    return 0;
  }
}

/**
 * Get total online players count
 */
export async function getTotalOnlinePlayersCount(): Promise<number> {
  try {
    const players = await getOnlinePlayers();
    return players.length;
  } catch (error) {
    console.error('Failed to get total online players count:', error);
    return 0;
  }
}