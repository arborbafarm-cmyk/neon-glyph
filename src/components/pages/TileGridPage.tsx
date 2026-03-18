import React, { useState } from 'react';
import InteractiveTileGrid from '@/components/game/InteractiveTileGrid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface SelectedTileInfo {
  tileId: number;
  position: { x: number; z: number };
}

export default function TileGridPage() {
  const [selectedTile, setSelectedTile] = useState<SelectedTileInfo | null>(null);

  const handleTileSelect = (tileId: number, position: { x: number; z: number }) => {
    setSelectedTile({ tileId, position });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 w-full">
        <div className="w-full h-screen relative">
          {/* 3D Grid Container */}
          <div className="w-full h-full">
            <InteractiveTileGrid
              gridSize={28}
              tileSize={1}
              onTileSelect={handleTileSelect}
            />
          </div>

          {/* UI Overlay */}
          <div className="absolute top-0 left-0 right-0 p-6 pointer-events-none">
            <div className="max-w-[100rem] mx-auto">
              <h1 className="font-heading text-5xl font-bold text-foreground mb-2">
                Plataforma de Construção 3D
              </h1>
              <p className="font-paragraph text-lg text-secondary">
                Clique em um tile para selecionar e começar a construir
              </p>
            </div>
          </div>

          {/* Tile Info Panel */}
          {selectedTile && (
            <div className="absolute bottom-6 left-6 bg-background border border-secondary rounded-lg p-4 pointer-events-auto max-w-xs">
              <h3 className="font-heading text-lg text-secondary mb-2">Tile Selecionado</h3>
              <div className="font-paragraph text-sm text-foreground space-y-1">
                <p>ID: <span className="text-secondary">{selectedTile.tileId}</span></p>
                <p>Posição X: <span className="text-secondary">{selectedTile.position.x.toFixed(2)}</span></p>
                <p>Posição Z: <span className="text-secondary">{selectedTile.position.z.toFixed(2)}</span></p>
              </div>
              <p className="font-paragraph text-xs text-gray-400 mt-3">
                Pronto para construção futura
              </p>
            </div>
          )}

          {/* Controls Info */}
          <div className="absolute bottom-6 right-6 bg-background border border-secondary rounded-lg p-4 pointer-events-auto max-w-xs">
            <h3 className="font-heading text-lg text-secondary mb-2">Controles</h3>
            <div className="font-paragraph text-sm text-foreground space-y-2">
              <p><span className="text-secondary">Clique</span> - Selecionar tile</p>
              <p><span className="text-secondary">Arrastar</span> - Rotacionar câmera</p>
              <p><span className="text-secondary">Scroll</span> - Zoom in/out</p>
            </div>
          </div>

          {/* Grid Stats */}
          <div className="absolute top-6 right-6 bg-background border border-secondary rounded-lg p-4 pointer-events-auto">
            <div className="font-paragraph text-sm text-foreground space-y-1">
              <p>Grid: <span className="text-secondary">28 x 28</span></p>
              <p>Total de Tiles: <span className="text-secondary">784</span></p>
              <p>Tamanho do Tile: <span className="text-secondary">1.0 unidade</span></p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
