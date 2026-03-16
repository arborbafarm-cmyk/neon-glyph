import React, { useCallback } from 'react';
import { useHotspotStore, type HotspotData } from '@/store/hotspotStore';
import { useNavigate } from 'react-router-dom';

interface HotspotLayerProps {
  pageId: string;
  containerRef?: React.RefObject<HTMLDivElement>;
  onHotspotClick?: (hotspot: HotspotData) => void;
  isEditing?: boolean;
  onAddHotspot?: (x: number, y: number) => void;
}

export default function HotspotLayer({
  pageId,
  containerRef,
  onHotspotClick,
  isEditing = false,
  onAddHotspot,
}: HotspotLayerProps) {
  const hotspots = useHotspotStore((state) => state.getHotspots(pageId));
  const navigate = useNavigate();

  const handleHotspotClick = useCallback(
    (hotspot: HotspotData, e: React.MouseEvent) => {
      e.stopPropagation();

      if (onHotspotClick) {
        onHotspotClick(hotspot);
        return;
      }

      // Default actions
      if (hotspot.action === 'navigate' && hotspot.actionValue) {
        navigate(hotspot.actionValue);
      }
    },
    [navigate, onHotspotClick]
  );

  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isEditing || !onAddHotspot || !containerRef?.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      onAddHotspot(x, y);
    },
    [isEditing, onAddHotspot, containerRef]
  );

  return (
    <div
      className={`absolute inset-0 ${isEditing ? 'cursor-crosshair' : 'cursor-pointer'}`}
      onClick={handleContainerClick}
      style={{ pointerEvents: hotspots.length > 0 || isEditing ? 'auto' : 'none' }}
    >
      {hotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          className={`absolute rounded-full transition-all ${
            isEditing
              ? 'bg-blue-500 bg-opacity-30 border-2 border-blue-500 hover:bg-opacity-50'
              : 'bg-transparent hover:bg-blue-500 hover:bg-opacity-20 border border-blue-400'
          }`}
          style={{
            left: `${hotspot.x}%`,
            top: `${hotspot.y}%`,
            width: `${hotspot.size || 40}px`,
            height: `${hotspot.size || 40}px`,
            transform: 'translate(-50%, -50%)',
            opacity: hotspot.visible !== false ? 1 : 0.3,
          }}
          onClick={(e) => handleHotspotClick(hotspot, e)}
          title={hotspot.label}
          aria-label={hotspot.label}
        />
      ))}
    </div>
  );
}
