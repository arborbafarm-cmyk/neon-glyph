import { BaseCrudService } from '@/integrations';

export interface MapPosition {
  x: number;
  y: number;
  complexo: string;
  area?: string;
}

export interface PlayerPresenceData {
  playerId: string;
  mapPosition: MapPosition;
  status: 'active' | 'idle' | 'in_combat' | 'offline';
  complexStatus?: string;
}

/**
 * Atualizar presença de um jogador no mapa
 */
export async function updatePlayerPresence(
  playerId: string,
  position: MapPosition,
  status: 'active' | 'idle' | 'in_combat' = 'active',
  complexStatus?: string
) {
  try {
    // Encontrar presença existente
    const { items } = await BaseCrudService.getAll('playerpresence');
    const existingPresence = items.find((p: any) => p.playerId === playerId);

    const presenceData = {
      playerId,
      mapPosition: JSON.stringify(position),
      status,
      complexStatus: complexStatus || '',
      lastSeenAt: new Date(),
      isOnline: true,
    };

    if (existingPresence) {
      // Atualizar presença existente
      return await BaseCrudService.update('playerpresence', {
        _id: existingPresence._id,
        ...presenceData,
      });
    } else {
      // Criar nova presença
      return await BaseCrudService.create('playerpresence', {
        _id: crypto.randomUUID(),
        ...presenceData,
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar presença do jogador:', error);
    throw error;
  }
}

/**
 * Obter jogadores online próximos a uma posição
 */
export async function getOnlinePlayersNearby(
  position: MapPosition,
  radius: number = 500
) {
  try {
    const { items } = await BaseCrudService.getAll('playerpresence');

    return items
      .filter((player: any) => {
        if (!player.isOnline || player.status === 'offline') return false;

        try {
          const playerPos = JSON.parse(player.mapPosition || '{}');

          // Se em complexos diferentes, não mostrar
          if (playerPos.complexo !== position.complexo) return false;

          // Calcular distância
          const distance = Math.sqrt(
            Math.pow(playerPos.x - position.x, 2) +
              Math.pow(playerPos.y - position.y, 2)
          );

          return distance <= radius;
        } catch {
          return false;
        }
      })
      .map((player: any) => ({
        ...player,
        mapPosition: JSON.parse(player.mapPosition || '{}'),
      }));
  } catch (error) {
    console.error('Erro ao obter jogadores próximos:', error);
    return [];
  }
}

/**
 * Obter todos os jogadores online em um complexo
 */
export async function getOnlinePlayersInComplex(complexo: string) {
  try {
    const { items } = await BaseCrudService.getAll('playerpresence');

    return items
      .filter((player: any) => {
        if (!player.isOnline || player.status === 'offline') return false;

        try {
          const playerPos = JSON.parse(player.mapPosition || '{}');
          return playerPos.complexo === complexo;
        } catch {
          return false;
        }
      })
      .map((player: any) => ({
        ...player,
        mapPosition: JSON.parse(player.mapPosition || '{}'),
      }));
  } catch (error) {
    console.error('Erro ao obter jogadores no complexo:', error);
    return [];
  }
}

/**
 * Definir jogador como offline
 */
export async function setPlayerOffline(playerId: string) {
  try {
    const { items } = await BaseCrudService.getAll('playerpresence');
    const presence = items.find((p: any) => p.playerId === playerId);

    if (presence) {
      await BaseCrudService.update('playerpresence', {
        _id: presence._id,
        isOnline: false,
        status: 'offline',
        lastSeenAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Erro ao definir jogador como offline:', error);
    throw error;
  }
}

/**
 * Obter presença de um jogador específico
 */
export async function getPlayerPresence(playerId: string) {
  try {
    const { items } = await BaseCrudService.getAll('playerpresence');
    const presence = items.find((p: any) => p.playerId === playerId);

    if (presence) {
      return {
        ...presence,
        mapPosition: JSON.parse(presence.mapPosition || '{}'),
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao obter presença do jogador:', error);
    return null;
  }
}

/**
 * Limpar jogadores offline (manutenção)
 * Remove registros de jogadores que estão offline há mais de X minutos
 */
export async function cleanupOfflinePlayers(minutesThreshold: number = 5) {
  try {
    const { items } = await BaseCrudService.getAll('playerpresence');
    const now = new Date();
    const threshold = new Date(now.getTime() - minutesThreshold * 60000);

    const offlineItems = items.filter((p: any) => {
      if (p.isOnline) return false;
      const lastSeen = new Date(p.lastSeenAt);
      return lastSeen < threshold;
    });

    for (const item of offlineItems) {
      await BaseCrudService.delete('playerpresence', item._id);
    }

    return offlineItems.length;
  } catch (error) {
    console.error('Erro ao limpar jogadores offline:', error);
    return 0;
  }
}

/**
 * Obter estatísticas de jogadores online
 */
export async function getOnlinePlayersStats() {
  try {
    const { items } = await BaseCrudService.getAll('playerpresence');

    const onlinePlayers = items.filter((p: any) => p.isOnline);
    const complexStats: Record<string, number> = {};

    onlinePlayers.forEach((player: any) => {
      try {
        const pos = JSON.parse(player.mapPosition || '{}');
        complexStats[pos.complexo] = (complexStats[pos.complexo] || 0) + 1;
      } catch {
        // Ignorar erros de parsing
      }
    });

    return {
      totalOnline: onlinePlayers.length,
      totalPlayers: items.length,
      complexStats,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return {
      totalOnline: 0,
      totalPlayers: 0,
      complexStats: {},
      timestamp: new Date(),
    };
  }
}
