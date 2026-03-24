import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GripHorizontal } from 'lucide-react';
import { useDragCustomizationStore } from '@/store/dragCustomizationStore';

interface DraggableElementProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function DraggableElement({
  id,
  children,
  className = '',
  title = 'Element'
}: DraggableElementProps) {
  const isDragModeEnabled = useDragCustomizationStore((state) => state.isDragModeEnabled);
  const position = useDragCustomizationStore((state) => state.getPosition(id));
  const setPosition = useDragCustomizationStore((state) => state.setPosition);

  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const currentPosition = position || { x: 0, y: 0 };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDragModeEnabled || !dragRef.current) return;
    
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setOffset({
        x: e.clientX - rect.left - currentPosition.x,
        y: e.clientY - rect.top - currentPosition.y
      });
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.parentElement?.getBoundingClientRect();
      if (rect) {
        setPosition(id, {
          x: e.clientX - rect.left - offset.x,
          y: e.clientY - rect.top - offset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset, id, setPosition]);

  return (
    <motion.div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        x: currentPosition.x,
        y: currentPosition.y,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Drag Handle - Only visible when drag mode is enabled */}
      {isDragModeEnabled && isHovered && (
        <div className="absolute -top-8 left-0 flex items-center gap-2 bg-black/80 border border-[#00eaff]/50 rounded px-2 py-1 z-50 backdrop-blur-sm">
          <div
            ref={dragRef}
            onMouseDown={handleMouseDown}
            className="flex items-center gap-1 cursor-grab active:cursor-grabbing hover:text-[#00eaff] transition-colors"
          >
            <GripHorizontal className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60 font-paragraph">{title}</span>
          </div>
        </div>
      )}

      {/* Container Content */}
      <div className={`${isDragModeEnabled && isHovered ? 'border border-[#00eaff]/30 rounded' : ''} transition-all`}>
        {children}
      </div>
    </motion.div>
  );
}
