import { create } from 'zustand';

export interface SelectedTile {
  id: string;
  x: number;
  y: number;
}

interface SelectedTilesState {
  selectedTiles: SelectedTile[];
  addTile: (tile: SelectedTile) => void;
  removeTile: (tileId: string) => void;
  clearTiles: () => void;
  setTiles: (tiles: SelectedTile[]) => void;
  getSelectedTiles: () => SelectedTile[];
  getAveragePosition: () => { x: number; y: number } | null;
}

export const useSelectedTilesStore = create<SelectedTilesState>((set, get) => ({
  selectedTiles: [],

  addTile: (tile: SelectedTile) => {
    set((state) => {
      // Check if tile already exists
      const exists = state.selectedTiles.some((t) => t.id === tile.id);
      if (exists) return state;
      return { selectedTiles: [...state.selectedTiles, tile] };
    });
  },

  removeTile: (tileId: string) => {
    set((state) => ({
      selectedTiles: state.selectedTiles.filter((t) => t.id !== tileId),
    }));
  },

  clearTiles: () => {
    set({ selectedTiles: [] });
  },

  setTiles: (tiles: SelectedTile[]) => {
    set({ selectedTiles: tiles });
  },

  getSelectedTiles: () => {
    return get().selectedTiles;
  },

  getAveragePosition: () => {
    const tiles = get().selectedTiles;
    if (tiles.length === 0) return null;

    const avgX = tiles.reduce((sum, t) => sum + t.x, 0) / tiles.length;
    const avgY = tiles.reduce((sum, t) => sum + t.y, 0) / tiles.length;

    return { x: avgX, y: avgY };
  },
}));
