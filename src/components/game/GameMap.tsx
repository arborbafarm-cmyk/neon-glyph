import { useEffect, useRef } from 'react';

export default function GameMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    // Dynamically load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Add styles for neon tooltips and giroflex animation
    const style = document.createElement('style');
    style.innerHTML = `
      body, html { margin: 0; padding: 0; overflow: hidden; }
      #map { margin: 0; padding: 0; }
      .leaflet-container { background: #000 !important; }
      .leaflet-marker-icon { 
        border: none !important; 
        background: none !important;
        filter: drop-shadow(0 0 3px rgba(0, 255, 255, 0.5));
      }
      .leaflet-marker-icon.animacao-policia { 
        animation: giroflex 0.6s infinite !important;
      }
      .tooltip-neon {
        background: rgba(10, 10, 15, 0.95) !important;
        border: 2px solid #0ff !important;
        color: #0ff !important;
        font-family: 'space grotesk', sans-serif;
        text-align: center;
        border-radius: 8px !important;
        padding: 8px !important;
      }
      .tooltip-neon b {
        color: #0ff;
        font-weight: bold;
      }
      .btn-entrar {
        display: inline-block; 
        margin-top: 8px; 
        padding: 5px 12px;
        border: 1px solid #0ff; 
        color: #0ff; 
        background: rgba(0, 255, 255, 0.1);
        border-radius: 6px; 
        font-weight: bold;
        cursor: pointer;
        font-size: 12px;
      }
      .btn-entrar:hover {
        background: rgba(0, 255, 255, 0.2);
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
      }
      @keyframes giroflex {
        0% { filter: drop-shadow(0 0 5px #ff0000) drop-shadow(0 0 10px #ff0000); }
        50% { filter: drop-shadow(0 0 10px #0000ff) drop-shadow(0 0 15px #0000ff); }
        100% { filter: drop-shadow(0 0 5px #ff0000) drop-shadow(0 0 10px #ff0000); }
      }
      .leaflet-popup-content-wrapper {
        background: rgba(10, 10, 15, 0.95) !important;
        border: 2px solid #0ff !important;
        border-radius: 8px !important;
      }
      .leaflet-popup-tip {
        background: rgba(10, 10, 15, 0.95) !important;
        border: 2px solid #0ff !important;
      }
    `;
    document.head.appendChild(style);

    // Dynamically load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      if (mapContainer.current && (window as any).L) {
        const L = (window as any).L;
        const urlMapaFundo = 'https://static.wixstatic.com/media/50f4bf_9dbf16b020134b02adc81709d1e774b9~mv2.png';
        
        // Destroy existing map if it exists
        if (mapInstance.current) {
          mapInstance.current.remove();
        }
        
        const map = L.map(mapContainer.current, {
          crs: L.CRS.Simple,
          minZoom: -2,
          maxZoom: 3,
          zoom: 0,
          zoomControl: false,
          attributionControl: false,
          dragging: true,
          touchZoom: true,
          scrollWheelZoom: true,
        });
        
        mapInstance.current = map;
        
        const bounds = [[0, 0], [1000, 600]];
        L.imageOverlay(urlMapaFundo, bounds).addTo(map);
        map.fitBounds(bounds);

        // Helper function to add locations with proper icon handling
        function addLocal(nome: string, img: string, x: number, y: number, size: number, css = '') {
          const icon = L.icon({
            iconUrl: img,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2],
            className: css,
          });
          
          const marker = L.marker([y, x], { icon: icon }).addTo(map);
          
          marker.bindTooltip(`<b>${nome}</b><br><div class="btn-entrar">ENTRAR</div>`, {
            direction: 'top',
            offset: [0, -10],
            className: 'tooltip-neon',
            permanent: false,
            sticky: true,
          });
          
          // Add click event
          marker.on('click', () => {
            console.log(`Clicked: ${nome}`);
          });
        }

        // 1. Police Vehicle (at the entrance of the favela - adjusted coordinates)
        addLocal(
          'VIATURA PM',
          'https://static.wixstatic.com/media/50f4bf_73f5f22017304e5198d1a876f1537486~mv2.png',
          420,
          380,
          80,
          'animacao-policia'
        );

        // 2. Your Initial QG (deeper inside the community)
        addLocal(
          'SEU QG',
          'https://static.wixstatic.com/media/50f4bf_1776337cd2dc4ff1982d01b0079a48d2~mv2.png',
          250,
          280,
          120
        );
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      id="map"
      style={{
        width: '100%',
        height: '100%',
        background: '#000',
        margin: 0,
        padding: 0,
      }}
    />
  );
}
