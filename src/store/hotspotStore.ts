import { create } from 'zustand';

export interface HotspotData {
  id: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  label: string;
  action?: 'navigate' | 'dialog' | 'callback';
  actionValue?: string; // URL, dialog ID, or callback name
  size?: number; // radius in pixels
  visible?: boolean;
}

interface HotspotStore {
  hotspots: Record<string, HotspotData[]>; // pageId -> hotspots
  addHotspot: (pageId: string, hotspot: HotspotData) => void;
  removeHotspot: (pageId: string, hotspotId: string) => void;
  updateHotspot: (pageId: string, hotspotId: string, updates: Partial<HotspotData>) => void;
  getHotspots: (pageId: string) => HotspotData[];
  setHotspots: (pageId: string, hotspots: HotspotData[]) => void;
  clearHotspots: (pageId: string) => void;
}

export const useHotspotStore = create<HotspotStore>((set, get) => ({
  hotspots: {},

  addHotspot: (pageId: string, hotspot: HotspotData) => {
    set((state) => ({
      hotspots: {
        ...state.hotspots,
        [pageId]: [...(state.hotspots[pageId] || []), hotspot],
      },
    }));
  },

  removeHotspot: (pageId: string, hotspotId: string) => {
    set((state) => ({
      hotspots: {
        ...state.hotspots,
        [pageId]: (state.hotspots[pageId] || []).filter((h) => h.id !== hotspotId),
      },
    }));
  },

  updateHotspot: (pageId: string, hotspotId: string, updates: Partial<HotspotData>) => {
    set((state) => ({
      hotspots: {
        ...state.hotspots,
        [pageId]: (state.hotspots[pageId] || []).map((h) =>
          h.id === hotspotId ? { ...h, ...updates } : h
        ),
      },
    }));
  },

  getHotspots: (pageId: string) => {
    return get().hotspots[pageId] || [];
  },

  setHotspots: (pageId: string, hotspots: HotspotData[]) => {
    set((state) => ({
      hotspots: {
        ...state.hotspots,
        [pageId]: hotspots,
      },
    }));
  },

  clearHotspots: (pageId: string) => {
    set((state) => ({
      hotspots: {
        ...state.hotspots,
        [pageId]: [],
      },
    }));
  },
}));
