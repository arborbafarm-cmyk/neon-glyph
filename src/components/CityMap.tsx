import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

interface Tile {
  x: number;
  y: number;
  state: 'empty' | 'occupied';
  playerId?: string;
}

interface CityMapProps {
  onTileClick?: (tile: Tile) => void;
}

const CityMap: React.FC<CityMapProps> = ({ onTileClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const tilesRef = useRef<Map<string, Tile>>(new Map());
  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const cameraControlsRef = useRef({
    isRotating: false,
    isPanning: false,
    previousMousePosition: { x: 0, y: 0 },
    targetZoom: 50,
    currentZoom: 50,
  });

  const GRID_WIDTH = 40;
  const GRID_HEIGHT = 20;
  const TILE_SIZE = 1;
  const TILE_SPACING = 0.05;
  const TOTAL_TILES = GRID_WIDTH * GRID_HEIGHT;

  // Initialize scene, camera, and renderer
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 150, 300);
    sceneRef.current = scene;

    // Camera setup - Isometric view
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(20, 30, 20);
    camera.lookAt(20, 0, 10);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting setup - Urban night lighting
    const ambientLight = new THREE.AmbientLight(0x4a5f8f, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00eaff, 0.8);
    directionalLight.position.set(50, 40, 30);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);

    // Point lights for urban night effect
    const pointLight1 = new THREE.PointLight(0xff4500, 0.5, 100);
    pointLight1.position.set(10, 15, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00eaff, 0.4, 100);
    pointLight2.position.set(30, 15, 30);
    scene.add(pointLight2);

    // Create instanced mesh for tiles
    const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2a3a4a,
      metalness: 0.3,
      roughness: 0.8,
      emissive: 0x0a1a2a,
    });

    const instancedMesh = new THREE.InstancedMesh(geometry, material, TOTAL_TILES);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    instancedMeshRef.current = instancedMesh;

    // Position tiles in grid
    const dummy = new THREE.Object3D();
    let index = 0;

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const posX = x * (TILE_SIZE + TILE_SPACING) - (GRID_WIDTH * (TILE_SIZE + TILE_SPACING)) / 2;
        const posZ = y * (TILE_SIZE + TILE_SPACING) - (GRID_HEIGHT * (TILE_SIZE + TILE_SPACING)) / 2;

        dummy.position.set(posX, 0, posZ);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(index, dummy.matrix);

        // Store tile data
        const tileKey = `${x},${y}`;
        tilesRef.current.set(tileKey, {
          x,
          y,
          state: 'empty',
        });

        index++;
      }
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);

    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(
      GRID_WIDTH * (TILE_SIZE + TILE_SPACING) + 5,
      GRID_HEIGHT * (TILE_SIZE + TILE_SPACING) + 5
    );
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f1420,
      metalness: 0.1,
      roughness: 0.9,
      emissive: 0x050a10,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Mouse events for raycasting and camera control
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        // Left click - tile selection
        mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycasterRef.current.setFromCamera(mouseRef.current, camera);

        const intersects = raycasterRef.current.intersectObject(instancedMesh);
        if (intersects.length > 0) {
          const instanceId = intersects[0].instanceId;
          if (instanceId !== undefined) {
            const x = instanceId % GRID_WIDTH;
            const y = Math.floor(instanceId / GRID_WIDTH);
            const tileKey = `${x},${y}`;
            const tile = tilesRef.current.get(tileKey);
            if (tile && onTileClick) {
              onTileClick(tile);
            }
          }
        }
      } else if (event.button === 2) {
        // Right click - pan
        cameraControlsRef.current.isPanning = true;
        cameraControlsRef.current.previousMousePosition = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (cameraControlsRef.current.isPanning) {
        const deltaX = event.clientX - cameraControlsRef.current.previousMousePosition.x;
        const deltaY = event.clientY - cameraControlsRef.current.previousMousePosition.y;

        const speed = 0.05;
        const moveX = deltaX * speed;
        const moveZ = deltaY * speed;

        camera.position.x -= moveX;
        camera.position.z -= moveZ;

        cameraControlsRef.current.previousMousePosition = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseUp = () => {
      cameraControlsRef.current.isPanning = false;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoomSpeed = 2;
      const direction = event.deltaY > 0 ? 1 : -1;
      cameraControlsRef.current.targetZoom += direction * zoomSpeed;
      cameraControlsRef.current.targetZoom = Math.max(15, Math.min(80, cameraControlsRef.current.targetZoom));
    };

    // Touch events for mobile
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        cameraControlsRef.current.isPanning = true;
        cameraControlsRef.current.previousMousePosition = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      } else if (event.touches.length === 2) {
        // Pinch zoom
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        cameraControlsRef.current.previousMousePosition = { x: distance, y: 0 };
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && cameraControlsRef.current.isPanning) {
        const deltaX = event.touches[0].clientX - cameraControlsRef.current.previousMousePosition.x;
        const deltaY = event.touches[0].clientY - cameraControlsRef.current.previousMousePosition.y;

        const speed = 0.05;
        camera.position.x -= deltaX * speed;
        camera.position.z -= deltaY * speed;

        cameraControlsRef.current.previousMousePosition = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      } else if (event.touches.length === 2) {
        // Pinch zoom
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const previousDistance = cameraControlsRef.current.previousMousePosition.x;
        const delta = distance - previousDistance;
        cameraControlsRef.current.targetZoom -= delta * 0.1;
        cameraControlsRef.current.targetZoom = Math.max(15, Math.min(80, cameraControlsRef.current.targetZoom));
        cameraControlsRef.current.previousMousePosition = { x: distance, y: 0 };
      }
    };

    const handleTouchEnd = () => {
      cameraControlsRef.current.isPanning = false;
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });
    renderer.domElement.addEventListener('touchstart', handleTouchStart);
    renderer.domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    renderer.domElement.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth zoom
      cameraControlsRef.current.currentZoom += (cameraControlsRef.current.targetZoom - cameraControlsRef.current.currentZoom) * 0.1;
      const distance = cameraControlsRef.current.currentZoom;
      const angle = Math.PI / 4; // 45 degrees for isometric view

      camera.position.x = Math.sin(angle) * distance;
      camera.position.y = Math.sin(angle) * distance;
      camera.position.z = Math.cos(angle) * distance;

      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('touchstart', handleTouchStart);
      renderer.domElement.removeEventListener('touchmove', handleTouchMove);
      renderer.domElement.removeEventListener('touchend', handleTouchEnd);
      containerRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      groundMaterial.dispose();
      renderer.dispose();
    };
  }, [onTileClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0f1420',
      }}
    />
  );
};

export default CityMap;
