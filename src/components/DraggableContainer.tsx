import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GripHorizontal, X, Edit2 } from 'lucide-react';

interface DraggableContainerProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  title?: string;
}

export default function DraggableContainer({
  id,
  children,
  className = '',
  onRemove,
  onEdit,
  title = 'Container'
}: DraggableContainerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Load position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`container-pos-${id}`);
    if (saved) {
      setPosition(JSON.parse(saved));
    }
  }, [id]);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem(`container-pos-${id}`, JSON.stringify(position));
  }, [position, id]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
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
  }, [isDragging, offset]);

  return (
    <motion.div
      ref={containerRef}
      className={`fixed ${className}`}
      style={{
        x: position.x,
        y: position.y,
        zIndex: isDragging ? 1000 : 10,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Drag Handle & Controls */}
      {isHovered && (
        <div className="absolute -top-8 left-0 right-0 flex items-center gap-2 bg-black/80 border border-[#00eaff]/50 rounded px-2 py-1 z-50 backdrop-blur-sm">
          <div
            ref={dragRef}
            onMouseDown={handleMouseDown}
            className="flex items-center gap-1 cursor-grab active:cursor-grabbing hover:text-[#00eaff] transition-colors"
          >
            <GripHorizontal className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60 font-paragraph">{title}</span>
          </div>
          
          <div className="flex-1" />
          
          {onEdit && (
            <button
              onClick={() => onEdit(id)}
              className="p-1 text-white/60 hover:text-[#00eaff] transition-colors"
              title="Edit"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
          
          {onRemove && (
            <button
              onClick={() => onRemove(id)}
              className="p-1 text-white/60 hover:text-red-500 transition-colors"
              title="Remove"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Container Content */}
      <div className={`${isHovered ? 'border border-[#00eaff]/30 rounded' : ''} transition-all`}>
        {children}
      </div>
    </motion.div>
  );
}
