import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { getInitialComercioData } from '@/types/comercios';
import {
  registerCredentials,
  validateCredentials,
  createSession,
  destroySession,
  getAuthSession,
} from './authService';
import { resetPlayerSession } from './sessionResetService';

const COLLECTION_ID = 'players';

function buildNewPlayer(playerId: string, email: string, playerName: string): Players {
  const now = new Date().toISOString();
  const comercios = getInitialComercioData();

  return {
    _id: playerId,
    email,
    playerId: email,
    playerName: playerName || 'Player',

    cleanMoney: 0,
    dirtyMoney: 0,
    spins: 10,

    level: 1,
    progress: 0,
    xp: 0,
    power: 0,
    barracoLevel: 1,

    comercios: JSON.stringify(comercios),
    inventory: JSON.stringify([]),
    skillTrees: JSON.stringify({}),
    ownedLuxuryItems: JSON.stringify([]),
    investments: JSON.stringify({}),

    isGuest: false,
    profilePicture: '',

    createdAt: now,
    updatedAt: now,
    lastUpdated: now,
    lastLoginAt: now,
  };
}

export async function savePlayer(player: Partial<Players>) {
  const now = new Date().toISOString();

  if (!player._id) {
    const newPlayer: Players = {
      _id: crypto.randomUUID(),
      email: player.email || '',
      playerId: player.playerId || player.email || '',
      playerName: player.playerName || 'Player',

      cleanMoney: player.cleanMoney ?? 0,
      dirtyMoney: player.dirtyMoney ?? 0,
      spins: player.spins ?? 10,

      level: player.level ?? 1,
      progress: player.progress ?? 0,
      xp: player.xp ?? 0,
      power: player.power ?? 0,
      barracoLevel: player.barracoLevel ?? 1,

      comercios: player.comercios ?? JSON.stringify(getInitialComercioData()),
      inventory: player.inventory ?? JSON.stringify([]),
      skillTrees: player.skillTrees ?? JSON.stringify({}),
      ownedLuxuryItems: player.ownedLuxuryItems ?? JSON.stringify([]),
      investments: player.investments ?? JSON.stringify({}),

      isGuest: player.isGuest ?? false,
      profilePicture: player.profilePicture ?? '',

      createdAt: player.createdAt ?? now,
      updatedAt: now,
      lastUpdated: now,
      lastLoginAt: player.lastLoginAt ?? now,
      _createdDate: player._createdDate,
      _updatedDate: player._updatedDate,
      externalPlayerId: player.externalPlayerId,
    };

    return BaseCrudService.create(COLLECTION_ID, newPlayer);
  }

  return BaseCrudService.update(COLLECTION_ID, {
    ...player,
    updatedAt: now,
    lastUpdated: now,
  });
}

export async function updatePlayer(playerId: string, updates: Partial<Players>) {
  const now = new Date().toISOString();

  return BaseCrudService.update(COLLECTION_ID, {
    _id: playerId,
    ...updates,
    updatedAt: now,
    lastUpdated: now,
  });
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

export async function registerPlayer(email: string, playerName: string, _nickname: string) {
  const playerId = crypto.randomUUID();
  const newPlayer = buildNewPlayer(playerId, email, playerName);

  return BaseCrudService.create(COLLECTION_ID, newPlayer);
}

/**
 * Register new player with email/password
 * Step 1: Create player in database with fixed _id
 * Step 2: Register credentials in auth system
 * Step 3: Create authenticated session
 */
export async function registerLocalPlayer(email: string, password: string, playerName: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const playerId = crypto.randomUUID();
  const newPlayer = buildNewPlayer(playerId, normalizedEmail, playerName.trim());

  const createdPlayer = await BaseCrudService.create(COLLECTION_ID, newPlayer);

  await registerCredentials(normalizedEmail, password, playerId);
  await createSession(playerId, normalizedEmail);

  return createdPlayer;
}

/**
 * Login player with email/password
 *
 * Step 1: Reset old session
 * Step 2: Validate email and password
 * Step 3: Load player data from database
 * Step 4: Create authenticated session
 * Step 5: Return player data
 */
export async function loginLocalPlayer(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  console.log('🔄 Resetting old session before login...');
  await resetPlayerSession();

  console.log('🔐 Validating credentials...');
  const playerId = await validateCredentials(normalizedEmail, password);

  console.log('📥 Loading player data from database...');
  const player = await getPlayerById(playerId);

  if (!player) {
    throw new Error('Jogador não encontrado no banco de dados');
  }

  console.log('🔑 Creating authenticated session...');
  await createSession(playerId, normalizedEmail);

  const now = new Date().toISOString();
  const updatedPlayer = await updatePlayer(playerId, {
    lastLoginAt: now,
  });

  console.log('✅ Login successful - player session ready');
  return updatedPlayer;
}

export async function logoutLocalPlayer() {
  await destroySession();
}

export async function getCurrentLocalPlayer() {
  const session = await getAuthSession();
  if (!session) return null;
  return getPlayerById(session.playerId);
}

export async function isPlayerAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  if (!session) return false;

  try {
    const player = await getPlayerById(session.playerId);
    return !!player;
  } catch {
    return false;
  }
}