import * as THREE from 'three';

/**
 * AAA 3D Visual System - ENHANCED
 * Transforms game buildings into AAA mobile game quality (GTA-style)
 * Handles: PBR materials, neon lighting, dynamic effects, cinematic atmosphere
 * 
 * CRITICAL RULES:
 * - NEVER alter base color of entire model
 * - NEVER apply solid color globally
 * - NEVER replace original materials with flat color
 * - Neon ONLY on details (max 10% of model)
 * - Realistic materials: concrete, glass, metal
 */

interface BuildingConfig {
  type: 'luxury' | 'casino' | 'qg' | 'delegacia' | 'commercial';
  neonColor: THREE.Color;
  emissiveIntensity: number; // 1-2.5 for neon details only
  metalness: number; // 0.5-0.8 for realistic materials
  roughness: number; // 0.3-0.6 for realistic materials
  glowIntensity: number;
  baseColorPreserve: boolean; // CRITICAL: preserve original base color
  neonAreaLimit: number; // Max 10% of model
}

const BUILDING_CONFIGS: Record<string, BuildingConfig> = {
  luxury: {
    type: 'luxury',
    neonColor: new THREE.Color(0xFFD700), // Gold elegant - ONLY on details
    emissiveIntensity: 1.2, // Subtle, elegant
    metalness: 0.6,
    roughness: 0.4,
    glowIntensity: 0.8,
    baseColorPreserve: true,
    neonAreaLimit: 0.08, // 8% - fine lines only
  },
  casino: {
    type: 'casino',
    neonColor: new THREE.Color(0xFF1493), // Deep pink - ONLY on signs/edges
    emissiveIntensity: 1.5,
    metalness: 0.65,
    roughness: 0.35,
    glowIntensity: 1.2,
    baseColorPreserve: true,
    neonAreaLimit: 0.10, // 10% - letreiros e bordas
  },
  qg: {
    type: 'qg',
    neonColor: new THREE.Color(0xFF4500), // Orange-red - ONLY strategic details
    emissiveIntensity: 1.0,
    metalness: 0.7,
    roughness: 0.3,
    glowIntensity: 1.0,
    baseColorPreserve: true,
    neonAreaLimit: 0.08, // 8% - doors, marks
  },
  delegacia: {
    type: 'delegacia',
    neonColor: new THREE.Color(0x00BFFF), // Cold blue - institutional
    emissiveIntensity: 0.8,
    metalness: 0.55,
    roughness: 0.45,
    glowIntensity: 0.6,
    baseColorPreserve: true,
    neonAreaLimit: 0.06, // 6% - discrete institutional light
  },
  commercial: {
    type: 'commercial',
    neonColor: new THREE.Color(0x00FF00), // Neon green - ONLY on signs
    emissiveIntensity: 1.3,
    metalness: 0.6,
    roughness: 0.4,
    glowIntensity: 1.0,
    baseColorPreserve: true,
    neonAreaLimit: 0.09, // 9% - placas e entrada
  },
};

export class AAA3DVisualSystem {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private buildingLights: Map<THREE.Group, THREE.Light[]> = new Map();
  private buildingAnimations: Map<THREE.Group, { time: number; type: string }> = new Map();
  private particleSystems: THREE.Points[] = [];
  private bloomPass: any = null;

  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.setupCinematicLighting();
    this.setupAtmosphere();
  }

  /**
   * Setup cinematic global lighting system - ENHANCED for realistic night urban
   */
  private setupCinematicLighting() {
    // Remove default lights
    this.scene.children.forEach((child) => {
      if (child instanceof THREE.Light) {
        this.scene.remove(child);
      }
    });

    // 1. Dark blue ambient light (night urban) - REDUCED for contrast
    const ambientLight = new THREE.AmbientLight(0x1a2a4a, 0.25);
    this.scene.add(ambientLight);

    // 2. Lateral directional light for dramatic shadows - ENHANCED
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(40, 50, 30);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -120;
    directionalLight.shadow.camera.right = 120;
    directionalLight.shadow.camera.top = 120;
    directionalLight.shadow.camera.bottom = -120;
    directionalLight.shadow.bias = -0.0001;
    this.scene.add(directionalLight);

    // 3. Warm fill light (orange/gold) for neon aesthetic
    const fillLight = new THREE.DirectionalLight(0xFF6B35, 0.35);
    fillLight.position.set(-40, 35, -25);
    this.scene.add(fillLight);

    // 4. Rim light for edge definition - ENHANCED
    const rimLight = new THREE.DirectionalLight(0x00EAFF, 0.4);
    rimLight.position.set(0, 25, -60);
    this.scene.add(rimLight);
  }

  /**
   * Setup atmospheric effects (fog, environment)
   */
  private setupAtmosphere() {
    // Dark fog for night urban scenery
    this.scene.fog = new THREE.Fog(0x0a0f1a, 80, 200);
    this.scene.background = new THREE.Color(0x0a0f1a);

    // Add subtle ground fog effect via particle system
    this.createGroundFog();
  }

  /**
   * Create ground fog particle effect
   */
  private createGroundFog() {
    const fogGeometry = new THREE.BufferGeometry();
    const fogCount = 200;
    const positions = new Float32Array(fogCount * 3);
    const velocities = new Float32Array(fogCount * 3);

    for (let i = 0; i < fogCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = Math.random() * 0.005;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    fogGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    fogGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const fogMaterial = new THREE.PointsMaterial({
      color: 0x1a3a5a,
      size: 0.5,
      transparent: true,
      opacity: 0.15,
      sizeAttenuation: true,
    });

    const fogParticles = new THREE.Points(fogGeometry, fogMaterial);
    this.scene.add(fogParticles);
    this.particleSystems.push(fogParticles);
  }

  /**
   * Apply AAA visual transformation to a building
   */
  applyBuildingVisuals(
    buildingGroup: THREE.Group,
    buildingType: 'luxury' | 'casino' | 'qg' | 'delegacia' | 'commercial'
  ) {
    const config = BUILDING_CONFIGS[buildingType];
    if (!config) return;

    // Apply PBR materials
    this.applyPBRMaterials(buildingGroup, config);

    // Add neon emissive details
    this.addNeonEmissive(buildingGroup, config);

    // Add dynamic point lights
    this.addDynamicLighting(buildingGroup, config);

    // Setup animation state
    this.buildingAnimations.set(buildingGroup, {
      time: 0,
      type: buildingType,
    });

    // Add interaction data
    buildingGroup.userData.aaa3d = {
      config,
      originalScale: buildingGroup.scale.clone(),
      isHovered: false,
      glowIntensity: config.glowIntensity,
    };
  }

  /**
   * Apply PBR material simulation - ENHANCED for realism
   * CRITICAL: Preserve base colors, only enhance material properties
   */
  private applyPBRMaterials(group: THREE.Group, config: BuildingConfig) {
    group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        const material = child.material as THREE.MeshStandardMaterial;

        // PRESERVE original base color - CRITICAL RULE
        const originalColor = material.color.clone();

        // Apply realistic material properties
        // Concrete: metalness 0.1-0.3, roughness 0.7-0.9
        // Glass: metalness 0.3-0.5, roughness 0.1-0.3
        // Metal: metalness 0.6-0.9, roughness 0.2-0.5
        
        const isGlass = child.name.toLowerCase().includes('glass') || 
                       child.name.toLowerCase().includes('window');
        const isMetal = child.name.toLowerCase().includes('metal') || 
                       child.name.toLowerCase().includes('frame');

        if (isGlass) {
          material.metalness = 0.4;
          material.roughness = 0.15;
          material.transparent = true;
          material.opacity = 0.85;
        } else if (isMetal) {
          material.metalness = Math.min(1, config.metalness);
          material.roughness = Math.max(0, config.roughness);
        } else {
          // Concrete/walls - realistic
          material.metalness = Math.min(0.3, config.metalness * 0.3);
          material.roughness = Math.min(1, config.roughness + 0.3);
        }

        // NO global emissive on base materials - only on details
        material.emissive = new THREE.Color(0x000000);
        material.emissiveIntensity = 0;

        // Restore original color
        material.color.copy(originalColor);

        // Increase map intensity for better contrast
        if (material.map) {
          material.map.magFilter = THREE.LinearFilter;
        }

        material.needsUpdate = true;
      }
    });
  }

  /**
   * Add neon emissive details to windows and architectural elements
   * CRITICAL: Neon ONLY on specific details, max 10% of model
   */
  private addNeonEmissive(group: THREE.Group, config: BuildingConfig) {
    let neonAreaCount = 0;
    const totalMeshes = this.countMeshes(group);
    const maxNeonMeshes = Math.ceil(totalMeshes * config.neonAreaLimit);

    group.traverse((child) => {
      if (child instanceof THREE.Mesh && neonAreaCount < maxNeonMeshes) {
        const material = child.material as THREE.MeshStandardMaterial;

        // Detect window-like materials (usually lighter or with specific names)
        const isWindow =
          child.name.toLowerCase().includes('window') ||
          child.name.toLowerCase().includes('glass') ||
          child.name.toLowerCase().includes('light');

        if (isWindow) {
          // Windows get neon glow - ONLY if within area limit
          material.emissive = config.neonColor;
          material.emissiveIntensity = config.emissiveIntensity * 0.6;
          material.metalness = 0.3;
          material.roughness = 0.1;
          neonAreaCount++;
        }

        // Add glow to edges and details - ONLY specific parts
        const isDetail =
          child.name.toLowerCase().includes('sign') ||
          child.name.toLowerCase().includes('detail') ||
          child.name.toLowerCase().includes('edge') ||
          child.name.toLowerCase().includes('neon') ||
          child.name.toLowerCase().includes('logo');

        if (isDetail && neonAreaCount < maxNeonMeshes) {
          material.emissive = config.neonColor;
          material.emissiveIntensity = config.emissiveIntensity;
          neonAreaCount++;
        }

        material.needsUpdate = true;
      }
    });
  }

  /**
   * Count total meshes in group
   */
  private countMeshes(group: THREE.Group): number {
    let count = 0;
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) count++;
    });
    return count;
  }

  /**
   * Add dynamic point lights to buildings - ENHANCED
   * Lights positioned strategically, not covering entire building
   */
  private addDynamicLighting(group: THREE.Group, config: BuildingConfig) {
    // Main building light - positioned at top for dramatic effect
    const mainLight = new THREE.PointLight(config.neonColor, 1.5, 40);
    mainLight.position.set(0, 8, 0);
    mainLight.castShadow = true;
    group.add(mainLight);

    // Secondary accent light - positioned at corner
    const accentLight = new THREE.PointLight(config.neonColor, 1.0, 30);
    accentLight.position.set(4, 4, 4);
    group.add(accentLight);

    // Store lights for animation
    this.buildingLights.set(group, [mainLight, accentLight]);
  }

  /**
   * Update animations and dynamic effects - ENHANCED
   * Window blinking, subtle pulsation, realistic variations
   */
  update(deltaTime: number) {
    // Update building animations
    this.buildingAnimations.forEach((anim, group) => {
      anim.time += deltaTime;

      const lights = this.buildingLights.get(group);
      if (lights) {
        // Realistic window blinking (some windows on/off)
        const blinkCycle = 2 + (Math.sin(anim.time * 0.3) * 0.5 + 0.5) * 3; // 2-5 second cycles
        const blinkPhase = (anim.time % blinkCycle) / blinkCycle;

        // Subtle pulsing intensity (simulating electrical variations)
        const pulse = Math.sin(anim.time * 1.2) * 0.2 + 0.8; // 0.6-1.0 range

        lights.forEach((light, index) => {
          if (light instanceof THREE.PointLight) {
            // Apply realistic window blinking (not all at once)
            if (index === 0 && (blinkPhase < 0.15 || (blinkPhase > 0.5 && blinkPhase < 0.65))) {
              light.intensity *= 0.3; // Dim, not off
            } else if (index === 1 && (blinkPhase < 0.08 || (blinkPhase > 0.6 && blinkPhase < 0.72))) {
              light.intensity *= 0.4;
            }

            // Apply subtle pulse (electrical variation)
            light.intensity *= pulse;
          }
        });
      }

      // Idle animation (subtle breathing - very minimal)
      const breathe = Math.sin(anim.time * 0.3) * 0.01 + 1;
      group.scale.copy(group.userData.aaa3d.originalScale).multiplyScalar(breathe);
    });

    // Update fog particles
    this.particleSystems.forEach((particles) => {
      const positions = particles.geometry.attributes.position.array as Float32Array;
      const velocities = particles.geometry.attributes.velocity.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        // Wrap around
        if (Math.abs(positions[i]) > 50) positions[i] *= -1;
        if (Math.abs(positions[i + 2]) > 50) positions[i + 2] *= -1;
      }

      particles.geometry.attributes.position.needsUpdate = true;
    });
  }

  /**
   * Handle hover effect (GTA-style) - ENHANCED
   * Subtle scale, glow increase, no color change
   */
  onBuildingHover(group: THREE.Group, isHovering: boolean) {
    if (!group.userData.aaa3d) return;

    const aaa3d = group.userData.aaa3d;
    aaa3d.isHovered = isHovering;

    if (isHovering) {
      // Subtle scale up
      group.scale.multiplyScalar(1.05);

      // Increase glow slightly
      const lights = this.buildingLights.get(group);
      if (lights) {
        lights.forEach((light) => {
          if (light instanceof THREE.PointLight) {
            light.intensity *= 1.2;
          }
        });
      }

      // Subtle emissive enhancement (only on neon details)
      group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          if (child.material.emissiveIntensity > 0) {
            child.material.emissiveIntensity *= 1.15;
          }
        }
      });
    } else {
      // Scale back
      group.scale.copy(aaa3d.originalScale);

      // Restore glow
      const lights = this.buildingLights.get(group);
      if (lights) {
        lights.forEach((light) => {
          if (light instanceof THREE.PointLight) {
            light.intensity /= 1.2;
          }
        });
      }

      // Restore emissive
      group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          if (child.material.emissiveIntensity > 0) {
            child.material.emissiveIntensity /= 1.15;
          }
        }
      });
    }
  }

  /**
   * Handle click effect (GTA-style) - ENHANCED
   * Subtle feedback without exaggeration
   */
  onBuildingClick(group: THREE.Group) {
    if (!group.userData.aaa3d) return;

    const originalScale = group.userData.aaa3d.originalScale.clone();

    // Subtle scale down
    group.scale.multiplyScalar(0.97);

    // Subtle flash effect
    const lights = this.buildingLights.get(group);
    if (lights) {
      lights.forEach((light) => {
        if (light instanceof THREE.PointLight) {
          light.intensity *= 1.2;
        }
      });
    }

    // Animate back quickly
    setTimeout(() => {
      group.scale.copy(originalScale);

      if (lights) {
        lights.forEach((light) => {
          if (light instanceof THREE.PointLight) {
            light.intensity /= 1.2;
          }
        });
      }
    }, 80);
  }

  /**
   * Add shadow plane under building
   */
  addGroundShadow(group: THREE.Group, size: number = 4) {
    const shadowGeometry = new THREE.PlaneGeometry(size, size);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
    });

    const shadowPlane = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.1;
    group.add(shadowPlane);
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.buildingLights.clear();
    this.buildingAnimations.clear();
    this.particleSystems.forEach((particles) => {
      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();
    });
    this.particleSystems = [];
  }
}
