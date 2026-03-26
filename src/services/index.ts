/**
 * SERVICES INDEX - REFACTORED
 * 
 * Central export point for all services.
 * Import services from here instead of individual files.
 * 
 * CRITICAL: Use the new unified services for all operations.
 * Legacy services are kept for backward compatibility only.
 */

// ✅ NEW UNIFIED SERVICES (Use these!)
export * from './playerCoreService';
export * from './economyService';
export * from './spinsService';
export * from './barracoService';
export * from './luxuryService';
export * from './skillTreeService';
export * from './inventoryService';
export * from './investmentService';

// ⚠️ LEGACY SERVICES (Backward compatibility only)
export * from './authService';
export * from './playerService';
export * from './playerDataService';
export * from './playerEconomyService';
export * from './playerProgressService';
export * from './playerProfileService';
export * from './playerPresenceService';
export * from './spinEconomyService';
export * from './slotService';
export * from './comerciosService';
export * from './financialHistoryService';
export * from './sessionResetService';
export * from './criticalActionService';
export * from './backgroundService';
export * from './indexedDBService';
export * from './multiplayerPresenceService';
