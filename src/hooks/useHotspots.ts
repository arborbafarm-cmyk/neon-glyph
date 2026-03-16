import { useHotspotStore, type HotspotData } from '@/store/hotspotStore';
import { useCallback } from 'react';

export function useHotspots(pageId: string) {
  const hotspots = useHotspotStore((state) => state.getHotspots(pageId));
  const addHotspot = useHotspotStore((state) => state.addHotspot);
  const removeHotspot = useHotspotStore((state) => state.removeHotspot);
  const updateHotspot = useHotspotStore((state) => state.updateHotspot);
  const setHotspots = useHotspotStore((state) => state.setHotspots);
  const clearHotspots = useHotspotStore((state) => state.clearHotspots);

  const createHotspot = useCallback(
    (x: number, y: number, label: string = 'Hotspot') => {
      const hotspot: HotspotData = {
        id: `hotspot-${Date.now()}-${Math.random()}`,
        x,
        y,
        label,
        size: 40,
        visible: true,
      };
      addHotspot(pageId, hotspot);
      return hotspot;
    },
    [pageId, addHotspot]
  );

  const deleteHotspot = useCallback(
    (hotspotId: string) => {
      removeHotspot(pageId, hotspotId);
    },
    [pageId, removeHotspot]
  );

  const editHotspot = useCallback(
    (hotspotId: string, updates: Partial<HotspotData>) => {
      updateHotspot(pageId, hotspotId, updates);
    },
    [pageId, updateHotspot]
  );

  const bulkSetHotspots = useCallback(
    (newHotspots: HotspotData[]) => {
      setHotspots(pageId, newHotspots);
    },
    [pageId, setHotspots]
  );

  const clear = useCallback(() => {
    clearHotspots(pageId);
  }, [pageId, clearHotspots]);

  return {
    hotspots,
    createHotspot,
    deleteHotspot,
    editHotspot,
    bulkSetHotspots,
    clear,
  };
}
