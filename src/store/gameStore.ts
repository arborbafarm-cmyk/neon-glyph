import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Fluxo Event Interfaces
export interface FluxoPlayer {
  playerId: string;
  playerName: string;
  popularity: number;
  energyEarned: number;
  spinsEarned: number;
  emojiInteractions: number;
  giftInteractions: number;
  lastInteractionTime: number;
}

export interface FluxoState {
  active: boolean;
  startTime: string; // HH:MM format (e.g., "22:00")
  duration: number; // in minutes
  players: FluxoPlayer[];
  visualSpawned: boolean;
  eventStartTimestamp: number | null;
  // Fluxo event actions
  startFluxo: () => void;
  endFluxo: () => void;
  addFluxoPlayer: (playerId: string, playerName: string) => void;
  removeFluxoPlayer: (playerId: string) => void;
  updateFluxoPlayerPopularity: (playerId: string, popularity: number) => void;
  addEmojiInteraction: (playerId: string, energyGain: number) => void;
  addGiftInteraction: (playerId: string, spinsGain: number) => void;
  setVisualSpawned: (spawned: boolean) => void;
  getFluxoPlayerRanking: () => FluxoPlayer[];
  resetFluxoEvent: () => void;
}

export interface GameState {
  spins: number;
  dirtMoney: number;
  multiplier: number;
  playerLevel: number;
  hasInitialized: boolean;
  isSpinning: boolean;
  lastResult: string[] | null;
  fluxo: FluxoState;
  setSpins: (spins: number) => void;
  setDirtMoney: (money: number) => void;
  setMultiplier: (multiplier: number) => void;
  setPlayerLevel: (level: number) => void;
  setHasInitialized: (initialized: boolean) => void;
  setIsSpinning: (spinning: boolean) => void;
  setLastResult: (result: string[] | null) => void;
  addDirtMoney: (amount: number) => void;
  addSpins: (amount: number) => void;
  subtractSpins: (amount: number) => void;
  reset: () => void;
}

const initialFluxoState: FluxoState = {
  active: false,
  startTime: '22:00',
  duration: 60,
  players: [],
  visualSpawned: false,
  eventStartTimestamp: null,
  startFluxo: () => {},
  endFluxo: () => {},
  addFluxoPlayer: () => {},
  removeFluxoPlayer: () => {},
  updateFluxoPlayerPopularity: () => {},
  addEmojiInteraction: () => {},
  addGiftInteraction: () => {},
  setVisualSpawned: () => {},
  getFluxoPlayerRanking: () => [],
  resetFluxoEvent: () => {},
};

const initialState = {
  spins: 0,
  dirtMoney: 0,
  multiplier: 1,
  playerLevel: 1,
  hasInitialized: false,
  isSpinning: false,
  lastResult: null,
  fluxo: initialFluxoState,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setSpins: (spins) => set({ spins }),
      setDirtMoney: (money) => set({ dirtMoney: money }),
      setMultiplier: (multiplier) => set({ multiplier }),
      setPlayerLevel: (level) => set({ playerLevel: level }),
      setHasInitialized: (initialized) => set({ hasInitialized: initialized }),
      setIsSpinning: (spinning) => set({ isSpinning: spinning }),
      setLastResult: (result) => set({ lastResult: result }),
      addDirtMoney: (amount) => set((state) => ({ dirtMoney: state.dirtMoney + amount })),
      addSpins: (amount) => set((state) => ({ spins: state.spins + amount })),
      subtractSpins: (amount) => set((state) => ({ spins: Math.max(0, state.spins - amount) })),
      reset: () => set(initialState),
      // Fluxo event methods
      fluxo: {
        ...initialFluxoState,
        startFluxo: () =>
          set((state) => ({
            fluxo: {
              ...state.fluxo,
              active: true,
              players: [],
              eventStartTimestamp: Date.now(),
              visualSpawned: false,
            },
          })),
        endFluxo: () =>
          set((state) => ({
            fluxo: {
              ...state.fluxo,
              active: false,
              visualSpawned: false,
            },
          })),
        addFluxoPlayer: (playerId: string, playerName: string) =>
          set((state) => {
            if (!state.fluxo.players.some((p) => p.playerId === playerId)) {
              const newPlayer: FluxoPlayer = {
                playerId,
                playerName,
                popularity: 0,
                energyEarned: 0,
                spinsEarned: 0,
                emojiInteractions: 0,
                giftInteractions: 0,
                lastInteractionTime: 0,
              };
              return {
                fluxo: {
                  ...state.fluxo,
                  players: [...state.fluxo.players, newPlayer],
                },
              };
            }
            return state;
          }),
        removeFluxoPlayer: (playerId: string) =>
          set((state) => ({
            fluxo: {
              ...state.fluxo,
              players: state.fluxo.players.filter((p) => p.playerId !== playerId),
            },
          })),
        updateFluxoPlayerPopularity: (playerId: string, popularity: number) =>
          set((state) => ({
            fluxo: {
              ...state.fluxo,
              players: state.fluxo.players.map((p) =>
                p.playerId === playerId ? { ...p, popularity } : p
              ),
            },
          })),
        addEmojiInteraction: (playerId: string, energyGain: number) =>
          set((state) => {
            const playerLevel = state.playerLevel || 1;
            const multipliedEnergy = energyGain * playerLevel;
            return {
              fluxo: {
                ...state.fluxo,
                players: state.fluxo.players.map((p) =>
                  p.playerId === playerId
                    ? {
                        ...p,
                        emojiInteractions: p.emojiInteractions + 1,
                        energyEarned: p.energyEarned + multipliedEnergy,
                        popularity: p.popularity + 1,
                        lastInteractionTime: Date.now(),
                      }
                    : p
                ),
              },
            };
          }),
        addGiftInteraction: (playerId: string, spinsGain: number) =>
          set((state) => {
            const playerLevel = state.playerLevel || 1;
            const multipliedSpins = spinsGain * playerLevel;
            return {
              fluxo: {
                ...state.fluxo,
                players: state.fluxo.players.map((p) =>
                  p.playerId === playerId
                    ? {
                        ...p,
                        giftInteractions: p.giftInteractions + 1,
                        spinsEarned: p.spinsEarned + multipliedSpins,
                        popularity: p.popularity + 2,
                        lastInteractionTime: Date.now(),
                      }
                    : p
                ),
              },
            };
          }),
        setVisualSpawned: (spawned: boolean) =>
          set((state) => ({
            fluxo: {
              ...state.fluxo,
              visualSpawned: spawned,
            },
          })),
        getFluxoPlayerRanking: () => {
          const state = get();
          return [...state.fluxo.players].sort((a, b) => b.popularity - a.popularity);
        },
        resetFluxoEvent: () =>
          set((state) => ({
            fluxo: {
              ...initialFluxoState,
            },
          })),
      },
    }),
    {
      name: 'game-store',
    }
  )
);
