import { BaseCrudService } from '@/integrations';
import { PlayerLots } from '@/entities';

const COLLECTION_ID = 'playerlots';

interface LotArea {
  gridX: number;
  gridZ: number;
  sizeX: number;
  sizeZ: number;
}

function overlaps(a: LotArea, b: LotArea) {
  return (
    a.gridX < b.gridX + b.sizeX &&
    a.gridX + a.sizeX > b.gridX &&
    a.gridZ < b.gridZ + b.sizeZ &&
    a.gridZ + a.sizeZ > b.gridZ
  );
}

/**
 * Pega todos os lotes existentes
 */
export async function getAllPlayerLots(): Promise<PlayerLots[]> {
  const result = await BaseCrudService.getAll<PlayerLots>(COLLECTION_ID);
  return result.items || [];
}

/**
 * Pega lote de um jogador
 */
export async function getPlayerLot(playerId: string): Promise<PlayerLots | null> {
  const lots = await getAllPlayerLots();
  return lots.find((lot) => lot.playerId === playerId) || null;
}

/**
 * Pega lotes por complexo/área
 */
export async function getPlayerLotsByRegion(
  complexo: string,
  area?: string
): Promise<PlayerLots[]> {
  const lots = await getAllPlayerLots();

  return lots.filter((lot) => {
    if ((lot.complexo || 'principal') !== complexo) return false;
    if (area && (lot.area || 'lobby') !== area) return false;
    return true;
  });
}

/**
 * Cria lote inicial automaticamente (2x2 = 4 tiles)
 */
export async function createInitialPlayerLot(
  playerId: string,
  playerName: string,
  gridWidth: number,
  gridHeight: number,
  complexo: string = 'principal',
  area: string = 'lobby'
): Promise<PlayerLots> {
  const existing = await getPlayerLot(playerId);
  if (existing) return existing;

  const allLots = await getPlayerLotsByRegion(complexo, area);

  const sizeX = 2;
  const sizeZ = 2;

  const possiblePositions: { gridX: number; gridZ: number }[] = [];

  for (let z = 0; z <= gridHeight - sizeZ; z++) {
    for (let x = 0; x <= gridWidth - sizeX; x++) {
      const candidate = { gridX: x, gridZ: z, sizeX, sizeZ };

      const isBlocked = allLots.some((lot) =>
        overlaps(candidate, {
          gridX: lot.gridX || 0,
          gridZ: lot.gridZ || 0,
          sizeX: lot.sizeX || 2,
          sizeZ: lot.sizeZ || 2,
        })
      );

      if (!isBlocked) {
        possiblePositions.push({ gridX: x, gridZ: z });
      }
    }
  }

  if (possiblePositions.length === 0) {
    throw new Error('Mapa cheio, sem espaço para novo jogador.');
  }

  const chosen =
    possiblePositions[Math.floor(Math.random() * possiblePositions.length)];

  const now = new Date().toISOString();

  const newLot: PlayerLots = {
    _id: crypto.randomUUID(),
    playerId,
    playerName,
    gridX: chosen.gridX,
    gridZ: chosen.gridZ,
    sizeX,
    sizeZ,
    rotation: 0,
    complexo,
    area,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  return BaseCrudService.create<PlayerLots>(COLLECTION_ID, newLot);
}

/**
 * Move o lote do jogador
 */
export async function movePlayerLot(
  playerId: string,
  nextGridX: number,
  nextGridZ: number
): Promise<PlayerLots> {
  const currentLot = await getPlayerLot(playerId);

  if (!currentLot) {
    throw new Error('Lote do jogador não encontrado.');
  }

  const sizeX = currentLot.sizeX || 2;
  const sizeZ = currentLot.sizeZ || 2;
  const complexo = currentLot.complexo || 'principal';
  const area = currentLot.area || 'lobby';

  const regionLots = await getPlayerLotsByRegion(complexo, area);

  const candidate: LotArea = {
    gridX: nextGridX,
    gridZ: nextGridZ,
    sizeX,
    sizeZ,
  };

  const occupied = regionLots.some((lot) => {
    if (lot.playerId === playerId) return false;

    return overlaps(candidate, {
      gridX: lot.gridX || 0,
      gridZ: lot.gridZ || 0,
      sizeX: lot.sizeX || 2,
      sizeZ: lot.sizeZ || 2,
    });
  });

  if (occupied) {
    throw new Error('Esse lote já está ocupado.');
  }

  const updatedLot: PlayerLots = {
    ...currentLot,
    gridX: nextGridX,
    gridZ: nextGridZ,
    updatedAt: new Date().toISOString(),
  };

  return BaseCrudService.update<PlayerLots>(COLLECTION_ID, updatedLot);
}