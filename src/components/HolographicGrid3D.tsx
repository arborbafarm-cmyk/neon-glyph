import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function HolographicGrid3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Configuração da Cena e Transparência
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Iluminação "Noite Estrelada"
    const ambientLight = new THREE.AmbientLight(0x4040ff, 1.0);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(10, 20, 10);
    scene.add(pointLight);

    // 3. O Grid Holográfico (Fundo/Plataforma)
    const geometry = new THREE.PlaneGeometry(0.8, 0.8);
    const material = new THREE.MeshLambertMaterial({
      color: 0x00aaff,
      emissive: 0x0055ff,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });

    const grid = new THREE.Group();
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 40; j++) {
        const tile = new THREE.Mesh(geometry, material);
        tile.position.set(j - 20, 0, i - 10);
        tile.rotation.x = Math.PI / 2;
        grid.add(tile);
      }
    }
    scene.add(grid);

    // 4. Inserindo e Redimensionando o Novo Objeto (4x4 tiles)
    const loader = new GLTFLoader();
    loader.load(
      'https://static.wixstatic.com/3d/50f4bf_938928189a844f56ac340bada0b551bd.glb',
      function (gltf) {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        model.position.x += model.position.x - center.x;
        model.position.z += model.position.z - center.z;
        model.position.y = 0.3;

        const desiredSize = 4.0;
        const scale = desiredSize / Math.max(size.x, size.z);
        model.scale.set(scale, scale, scale);

        scene.add(model);
      },
      undefined,
      function (error) {
        console.error('Erro ao carregar o modelo 3D:', error);
      }
    );

    // 5. Controles de Câmera e Animação
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    camera.position.set(10, 15, 25);
    controls.update();

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Ajuste de tela responsivo
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        backgroundColor: 'transparent',
      }}
    />
  );
}
