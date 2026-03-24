import { create } from 'zustand';

interface DragPosition {
  x: number;
  y: number;
}

interface DragCustomizationState {
  // Global drag mode toggle
  isDragModeEnabled: boolean;
  toggleDragMode: () => void;
  setDragMode: (enabled: boolean) => void;

  // Position storage for all draggable elements
  positions: Record<string, DragPosition>;
  setPosition: (id: string, position: DragPosition) => void;
  getPosition: (id: string) => DragPosition | undefined;
  
  // Reset all positions
  resetAllPositions: () => void;
  resetPosition: (id: string) => void;

  // Load from localStorage
  loadPositions: () => void;
  savePositions: () => void;
}

export const useDragCustomizationStore = create<DragCustomizationState>((set, get) => ({
  isDragModeEnabled: false,
  
  toggleDragMode: () => {
    set((state) => ({ isDragModeEnabled: !state.isDragModeEnabled }));
  },
  
  setDragMode: (enabled: boolean) => {
    set({ isDragModeEnabled: enabled });
  },

  positions: {},

  setPosition: (id: string, position: DragPosition) => {
    set((state) => ({
      positions: {
        ...state.positions,
        [id]: position,
      },
    }));
    // Auto-save to localStorage
    const state = get();
    localStorage.setItem('drag-positions', JSON.stringify(state.positions));
  },

  getPosition: (id: string) => {
    return get().positions[id];
  },

  resetAllPositions: () => {
    set({ positions: {} });
    localStorage.removeItem('drag-positions');
  },

  resetPosition: (id: string) => {
    set((state) => {
      const newPositions = { ...state.positions };
      delete newPositions[id];
      return { positions: newPositions };
    });
  },

  loadPositions: () => {
    const saved = localStorage.getItem('drag-positions');
    if (saved) {
      try {
        set({ positions: JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to load drag positions:', e);
      }
    }
  },

  savePositions: () => {
    const state = get();
    localStorage.setItem('drag-positions', JSON.stringify(state.positions));
  },
}));
