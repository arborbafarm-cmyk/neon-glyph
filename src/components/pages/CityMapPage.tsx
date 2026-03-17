import React, { useState } from 'react';
import CityMap from '@/components/CityMap';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Tile {
  x: number;
  y: number;
  state: 'empty' | 'occupied';
  playerId?: string;
}

export default function CityMapPage() {
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);

  const handleTileClick = (tile: Tile) => {
    setSelectedTile(tile);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 relative">
        <CityMap onTileClick={handleTileClick} />
        
        {/* Tile Info Panel */}
        {selectedTile && (
          <div className="absolute bottom-6 left-6 bg-black/80 border border-secondary p-4 rounded-lg max-w-xs">
            <h3 className="text-secondary font-heading text-lg mb-2">Tile Information</h3>
            <div className="text-foreground font-paragraph space-y-1 text-sm">
              <p>Coordinates: ({selectedTile.x}, {selectedTile.y})</p>
              <p>State: <span className={selectedTile.state === 'occupied' ? 'text-primary' : 'text-secondary'}>
                {selectedTile.state}
              </span></p>
              {selectedTile.playerId && (
                <p>Player ID: {selectedTile.playerId}</p>
              )}
            </div>
          </div>
        )}

        {/* Controls Info */}
        <div className="absolute top-6 right-6 bg-black/80 border border-secondary p-4 rounded-lg max-w-xs">
          <h3 className="text-secondary font-heading text-lg mb-2">Controls</h3>
          <div className="text-foreground font-paragraph space-y-1 text-sm">
            <p>🖱️ Left Click: Select Tile</p>
            <p>🖱️ Right Click + Drag: Pan Camera</p>
            <p>🖱️ Scroll: Zoom In/Out</p>
            <p>📱 Touch: Pan & Pinch Zoom</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
