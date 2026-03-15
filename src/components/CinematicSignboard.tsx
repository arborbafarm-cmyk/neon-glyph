import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function CinematicSignboard() {
const containerRef = useRef<HTMLDivElement>(null);
const sceneRef = useRef<THREE.Scene | null>(null);
const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
const signboardRef = useRef<THREE.Group | null>(null);

useEffect(() => {
if (!containerRef.current) return;

const scene = new THREE.Scene();
sceneRef.current = scene;
scene.background = new THREE.Color(0x020205); // Preto mais profundo
scene.fog = new THREE.Fog(0x020205, 50, 300);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Começa muito mais longe para um zoom de alto impacto
camera.position.set(0, 20, 150);
cameraRef.current = camera;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
containerRef.current.appendChild(renderer.domElement);
rendererRef.current = renderer;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Luz Dourada de Ostentação
const spotLight = new THREE.SpotLight(0xffd700, 4, 300, Math.PI / 4, 0.3, 1);
spotLight.position.set(0, 50, 50);
spotLight.castShadow = true;
scene.add(spotLight);

// Neon Tático Azul (Vibe Polícia/Comando)
const neonLight = new THREE.PointLight(0x00eaff, 2, 200);
neonLight.position.set(0, -10, 20);
scene.add(neonLight);

const cityLights = new THREE.Group();
for (let i = 0; i < 60; i++) {
const light = new THREE.PointLight(0xffaa00, Math.random() * 1.5, 120);
light.position.set((Math.random() - 0.5) * 400, Math.random() * 60, Math.random() * -250 - 50);
cityLights.add(light);
}
scene.add(cityLights);

const signboard = new THREE.Group();
signboardRef.current = signboard;
scene.add(signboard);

const canvas = document.createElement('canvas');
canvas.width = 2048;
canvas.height = 512;
const ctx = canvas.getContext('2d');
if (ctx) {
ctx.fillStyle = '#050505';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Estilo de Letra Impactante/Industrial
ctx.font = '900 160px "Impact", "Arial Black", sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// Brilho de fundo do texto
ctx.shadowColor = '#00eaff';
ctx.shadowBlur = 40;
ctx.fillStyle = '#ffd700';
ctx.fillText('COMPLEXO 1 DO COMANDO NORTE', canvas.width / 2, canvas.height / 2);

// Gradiente Metálico por cima
const grad = ctx.createLinearGradient(0, 100, 0, 400);
grad.addColorStop(0, '#fff3a0');
grad.addColorStop(0.5, '#ffd700');
grad.addColorStop(1, '#b8860b');
ctx.shadowBlur = 0;
ctx.fillStyle = grad;
ctx.fillText('COMPLEXO 1 DO COMANDO NORTE', canvas.width / 2, canvas.height / 2);
}

const texture = new THREE.CanvasTexture(canvas);
const material = new THREE.MeshStandardMaterial({
map: texture,
emissive: new THREE.Color(0xffd700),
emissiveIntensity: 0.4,
metalness: 1,
roughness: 0.1,
});

const geometry = new THREE.PlaneGeometry(55, 14); // Um pouco maior e mais imponente
const mesh = new THREE.Mesh(geometry, material);
signboard.add(mesh);

const frameGeometry = new THREE.BoxGeometry(57, 16, 0.8);
const frameMaterial = new THREE.MeshStandardMaterial({
color: 0xffd700,
metalness: 1,
roughness: 0.1,
});
const frame = new THREE.Mesh(frameGeometry, frameMaterial);
frame.position.z = -0.5;
signboard.add(frame);

const particleGeometry = new THREE.BufferGeometry();
const particleCount = 300;
const positionArray = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i += 3) {
positionArray[i] = (Math.random() - 0.5) * 150;
positionArray[i + 1] = Math.random() * 100;
positionArray[i + 2] = (Math.random() - 0.5) * 150;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
const particleMaterial = new THREE.PointsMaterial({ color: 0xffd700, size: 0.4, transparent: true, opacity: 0.4 });
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

let time = 0;
const startTime = Date.now();
const zoomDuration = 2000; // Zoom mais rápido e agressivo (2 segundos)

const animate = () => {
requestAnimationFrame(animate);
time = Date.now() - startTime;

if (time < zoomDuration) {
const progress = time / zoomDuration;
// Curva de aceleração mais cinematográfica (ease-out-expo)
const easeProgress = 1 - Math.pow(2, -10 * progress);
camera.position.z = 150 - (easeProgress * 115); // Termina em 35
camera.position.y = 20 - (easeProgress * 15);  // Termina em 5
} else {
// Tremor sutil de câmera (efeito de poder)
camera.position.x = Math.sin(time * 0.01) * 0.05;
camera.position.y = 5 + Math.cos(time * 0.01) * 0.05;
}

signboard.rotation.y = Math.sin(time * 0.0008) * 0.05;
const pulse = Math.sin(time * 0.005) * 0.5 + 0.5;
material.emissiveIntensity = 0.3 + (pulse * 0.7);
neonLight.intensity = 1.5 + (pulse * 1.5);

cityLights.children.forEach((light: any) => {
light.intensity = Math.random() * 1.5;
});

renderer.render(scene, camera);
};

animate();

const handleResize = () => {
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(width, height);
};
window.addEventListener('resize', handleResize);

return () => {
window.removeEventListener('resize', handleResize);
containerRef.current?.removeChild(renderer.domElement);
};
}, []);

return <div ref={containerRef} className="w-full h-full" style={{ position: 'relative', overflow: 'hidden' }} />;
}
