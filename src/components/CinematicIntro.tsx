import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  type: 'money' | 'bullet' | 'spark';
}

export default function CinematicIntro() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const [showTitle, setShowTitle] = useState(false);
  const bulletHolesRef = useRef<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1420);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xff4500, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create luxury car
    const carGeometry = new THREE.BoxGeometry(0.8, 0.4, 1.5);
    const carMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      metalness: 0.8,
      roughness: 0.2,
    });
    const car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.set(-3, 0, 0);
    scene.add(car);

    // Create helicopter
    const helicopterGroup = new THREE.Group();
    const helicopterBody = new THREE.BoxGeometry(0.6, 0.4, 1);
    const helicopterMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.6,
      roughness: 0.4,
    });
    const helicopterMesh = new THREE.Mesh(helicopterBody, helicopterMaterial);
    helicopterGroup.add(helicopterMesh);

    // Helicopter rotor
    const rotorGeometry = new THREE.BoxGeometry(2, 0.05, 0.3);
    const rotorMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.7,
    });
    const rotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
    rotor.position.y = 0.5;
    helicopterGroup.add(rotor);

    helicopterGroup.position.set(3, 2, -2);
    scene.add(helicopterGroup);

    // Animation loop
    let animationFrameId: number;
    let startTime = Date.now();
    const duration = 8000; // 8 seconds

    const createParticle = (
      position: THREE.Vector3,
      type: 'money' | 'bullet' | 'spark'
    ) => {
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        Math.random() * 0.05,
        (Math.random() - 0.5) * 0.1
      );

      particlesRef.current.push({
        position: position.clone(),
        velocity,
        life: 1,
        maxLife: type === 'money' ? 3 : 1,
        type,
      });
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Car movement (fleeing)
      car.position.x = -3 + progress * 8;
      car.rotation.z = Math.sin(progress * Math.PI * 4) * 0.1;

      // Helicopter pursuit
      helicopterGroup.position.x = 3 - progress * 6;
      helicopterGroup.position.y = 2 + Math.sin(progress * Math.PI * 3) * 0.5;

      // Rotor rotation
      rotor.rotation.z += 0.3;

      // Camera shake effect
      if (progress > 0.3) {
        camera.position.x = (Math.random() - 0.5) * 0.1;
        camera.position.y = (Math.random() - 0.5) * 0.1;
      }

      // Generate particles
      if (progress > 0.2 && progress < 0.8) {
        if (Math.random() > 0.7) {
          createParticle(
            car.position.clone().add(new THREE.Vector3(0.5, 0, 0)),
            'money'
          );
        }
        if (Math.random() > 0.85) {
          createParticle(
            helicopterGroup.position.clone(),
            'bullet'
          );
        }
      }

      // Update particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.life -= 0.016 / particle.maxLife;
        particle.position.add(particle.velocity);
        particle.velocity.y -= 0.001;

        if (particle.life > 0) {
          return true;
        }
        return false;
      });

      renderer.render(scene, camera);

      if (progress >= 0.6 && !showTitle) {
        setShowTitle(true);
      }
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current?.removeChild(renderer.domElement);
      }
    };
  }, [showTitle]);

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black">
      {/* Canvas will be appended here */}

      {/* Particle effects overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {particlesRef.current.map((particle, idx) => (
          <circle
            key={idx}
            cx={((particle.position.x + 5) / 10) * window.innerWidth}
            cy={((particle.position.y + 5) / 10) * window.innerHeight}
            r={particle.type === 'money' ? 4 : 2}
            fill={
              particle.type === 'money'
                ? '#FFD700'
                : particle.type === 'bullet'
                  ? '#FF0000'
                  : '#FFFF00'
            }
            opacity={particle.life}
          />
        ))}
      </svg>

      {/* Title - Gold lettering with diamonds */}
      <AnimatePresence>
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotateZ: -10 }}
            animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, type: 'spring' }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="relative">
              {/* Diamond decorations */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-12 -left-12 text-4xl"
              >
                ◆
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-12 -right-12 text-4xl"
              >
                ◆
              </motion.div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-12 -left-12 text-4xl"
              >
                ◆
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-12 -right-12 text-4xl"
              >
                ◆
              </motion.div>

              {/* Main title */}
              <motion.h1
                animate={{
                  textShadow: [
                    '0 0 10px #FFD700, 0 0 20px #FFD700',
                    '0 0 20px #FFD700, 0 0 40px #FFD700',
                    '0 0 10px #FFD700, 0 0 20px #FFD700',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="font-heading text-7xl md:text-8xl font-black text-center"
                style={{
                  color: '#FFD700',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  filter: 'drop-shadow(0 0 20px #FFD700)',
                }}
              >
                Dominio do
                <br />
                Comando
              </motion.h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Muzzle flash effects */}
      <AnimatePresence>
        {showTitle && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`flash-${i}`}
                initial={{ opacity: 1, scale: 0 }}
                animate={{ opacity: 0, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.15,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="absolute pointer-events-none"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                  width: '40px',
                  height: '40px',
                  background: 'radial-gradient(circle, #FF4500 0%, transparent 70%)',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
