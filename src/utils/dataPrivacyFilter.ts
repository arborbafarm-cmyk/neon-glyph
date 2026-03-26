/**
 * Utilitário para filtrar dados privados vs públicos
 * Garante que apenas dados públicos sejam compartilhados com outros jogadores
 */

import { Players } from '@/entities';

/**
 * Dados que NUNCA devem ser compartilhados
 */
const PRIVATE_FIELDS = [
  'email',
  'cleanMoney',
  'dirtyMoney',
  'inventory',
  'skillTrees',
  'ownedLuxuryItems',
  'investments',
  'spins',
  'comercios',
  'externalPlayerId',
  '_owner',
];

/**
 * Dados públicos que podem ser compartilhados
 */
const PUBLIC_FIELDS = [
  '_id',
  'playerName',
  'level',
  'progress',
  'profilePicture',
  'barracoLevel',
  'isGuest',
  '_createdDate',
  '_updatedDate',
];

/**
 * Filtrar dados do jogador para compartilhamento público
 * Remove todos os dados privados
 */
export function filterPlayerDataForPublic(player: Players): Partial<Players> {
  const publicData: any = {};

  PUBLIC_FIELDS.forEach((field) => {
    if (field in player) {
      publicData[field] = (player as any)[field];
    }
  });

  return publicData;
}

/**
 * Validar se um campo é privado
 */
export function isPrivateField(fieldName: string): boolean {
  return PRIVATE_FIELDS.includes(fieldName);
}

/**
 * Validar se um campo é público
 */
export function isPublicField(fieldName: string): boolean {
  return PUBLIC_FIELDS.includes(fieldName);
}

/**
 * Obter lista de campos privados
 */
export function getPrivateFields(): string[] {
  return [...PRIVATE_FIELDS];
}

/**
 * Obter lista de campos públicos
 */
export function getPublicFields(): string[] {
  return [...PUBLIC_FIELDS];
}

/**
 * Validar dados antes de enviar para presença online
 * Garante que nenhum dado privado está sendo enviado
 */
export function validatePresenceData(data: any): boolean {
  const dataKeys = Object.keys(data);

  for (const key of dataKeys) {
    if (isPrivateField(key)) {
      console.warn(`⚠️ Tentativa de enviar dado privado: ${key}`);
      return false;
    }
  }

  return true;
}

/**
 * Sanitizar dados de presença
 * Remove qualquer campo privado que possa ter sido incluído
 */
export function sanitizePresenceData(data: any): any {
  const sanitized: any = {};

  Object.entries(data).forEach(([key, value]) => {
    if (!isPrivateField(key)) {
      sanitized[key] = value;
    }
  });

  return sanitized;
}

/**
 * Criar objeto de presença pública a partir de dados do jogador
 */
export function createPublicPresenceObject(
  player: Players,
  position: { x: number; y: number; complexo: string }
) {
  return {
    playerId: player._id,
    playerName: player.playerName,
    level: player.level,
    profilePicture: player.profilePicture,
    barracoLevel: player.barracoLevel,
    mapPosition: JSON.stringify(position),
    status: 'active',
    isOnline: true,
  };
}

/**
 * Documentação de segurança
 */
export const PRIVACY_DOCUMENTATION = {
  privateFields: {
    email: 'Informação sensível de conta - NUNCA compartilhar',
    cleanMoney: 'Saldo financeiro privado',
    dirtyMoney: 'Saldo financeiro privado',
    inventory: 'Itens privados do jogador',
    skillTrees: 'Dados internos de skill trees',
    ownedLuxuryItems: 'Itens de luxo privados',
    investments: 'Investimentos privados',
    spins: 'Número de spins disponíveis',
    comercios: 'Dados de comércios privados',
    externalPlayerId: 'ID externo privado',
  },
  publicFields: {
    playerName: 'Nome do jogador - visível para todos',
    level: 'Nível do jogador - visível para todos',
    profilePicture: 'Avatar do jogador - visível para todos',
    barracoLevel: 'Nível do barraco - visível para todos',
    isGuest: 'Se é jogador convidado - visível para todos',
  },
  mapPresenceFields: {
    playerId: 'ID único do jogador',
    playerName: 'Nome do jogador',
    level: 'Nível do jogador',
    profilePicture: 'Avatar do jogador',
    mapPosition: 'Posição no mapa (JSON)',
    status: 'Status (active, idle, in_combat)',
    isOnline: 'Flag de online',
  },
};
