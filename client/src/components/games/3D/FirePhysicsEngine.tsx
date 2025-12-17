import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { gsap } from 'gsap';

export class FirePhysicsEngine {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private world: CANNON.World;
  private fireParticles: THREE.Group[] = [];
  private smokeParticles: THREE.Group[] = [];
  private temperatureMap: Map<string, number> = new Map();
  private materialFlammability: Map<THREE.Material, number> = new Map();

  constructor(container: HTMLElement) {
    this.initScene(container);
    this.initPhysics();
    this.initLighting();
    this.setupMaterialProperties();
    this.animate();
  }

  private initScene(container: HTMLElement) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Sky blue

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Controls
    this.setupControls();
  }

  private initPhysics() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
  }

  private initLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Fire lighting will be added dynamically
  }

  private setupMaterialProperties() {
    // Define flammability levels (0 = fireproof, 1 = highly flammable)
    const woodMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const plasticMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const metalMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const concreteMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });

    this.materialFlammability.set(woodMaterial, 0.8);
    this.materialFlammability.set(plasticMaterial, 0.9);
    this.materialFlammability.set(metalMaterial, 0.1);
    this.materialFlammability.set(concreteMaterial, 0.0);
  }

  private setupControls() {
    // First-person controls
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;

    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();

    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
      }
    });

    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
      }
    });

    // Mouse look
    let isPointerLocked = false;
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');

    this.renderer.domElement.addEventListener('click', () => {
      this.renderer.domElement.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      isPointerLocked = document.pointerLockElement === this.renderer.domElement;
    });

    document.addEventListener('mousemove', (event) => {
      if (!isPointerLocked) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      euler.setFromQuaternion(this.camera.quaternion);
      euler.y -= movementX * 0.002;
      euler.x -= movementY * 0.002;
      euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));

      this.camera.quaternion.setFromEuler(euler);
    });

    // Movement update function
    const updateMovement = () => {
      const delta = 0.016; // ~60fps
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.normalize();

      if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
      if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

      this.camera.translateX(velocity.x * delta);
      this.camera.translateZ(velocity.z * delta);
    };

    // Add to animation loop
    this.updateMovement = updateMovement;
  }

  public createFireSource(position: THREE.Vector3, intensity: number = 1.0) {
    const fireGroup = new THREE.Group();
    
    // Fire particle system
    const fireGeometry = new THREE.BufferGeometry();
    const fireCount = 200 * intensity;
    const positions = new Float32Array(fireCount * 3);
    const colors = new Float32Array(fireCount * 3);
    const sizes = new Float32Array(fireCount);
    const lifetimes = new Float32Array(fireCount);

    for (let i = 0; i < fireCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;

      // Fire colors (red to yellow to white)
      const heat = Math.random();
      colors[i * 3] = 1; // R
      colors[i * 3 + 1] = heat; // G
      colors[i * 3 + 2] = heat * 0.1; // B

      sizes[i] = Math.random() * 5 + 1;
      lifetimes[i] = Math.random();
    }

    fireGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    fireGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    fireGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    fireGeometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    const fireMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: intensity }
      },
      vertexShader: `
        attribute float size;
        attribute float lifetime;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vLifetime;
        uniform float time;
        uniform float intensity;

        void main() {
          vColor = color;
          vLifetime = lifetime;
          
          vec3 pos = position;
          pos.y += time * 2.0 + lifetime * 3.0;
          pos.x += sin(time + lifetime * 10.0) * 0.5;
          pos.z += cos(time + lifetime * 8.0) * 0.5;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z) * intensity;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vLifetime;
        
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float dist = length(uv);
          if (dist > 0.5) discard;
          
          float alpha = (0.5 - dist) * 2.0;
          alpha *= (1.0 - vLifetime);
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      vertexColors: true
    });

    const fireParticles = new THREE.Points(fireGeometry, fireMaterial);
    fireGroup.add(fireParticles);

    // Smoke particles
    const smokeGeometry = new THREE.BufferGeometry();
    const smokeCount = 100 * intensity;
    const smokePositions = new Float32Array(smokeCount * 3);
    const smokeOpacities = new Float32Array(smokeCount);

    for (let i = 0; i < smokeCount; i++) {
      smokePositions[i * 3] = (Math.random() - 0.5) * 4;
      smokePositions[i * 3 + 1] = Math.random() * 5 + 2;
      smokePositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      smokeOpacities[i] = Math.random() * 0.8;
    }

    smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    smokeGeometry.setAttribute('opacity', new THREE.BufferAttribute(smokeOpacities, 1));

    const smokeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x333333) }
      },
      vertexShader: `
        attribute float opacity;
        varying float vOpacity;
        uniform float time;

        void main() {
          vOpacity = opacity;
          vec3 pos = position;
          pos.y += time * 1.5;
          pos.x += sin(time * 0.5 + position.y * 0.1) * 2.0;
          pos.z += cos(time * 0.3 + position.x * 0.1) * 2.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = 50.0 * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        uniform vec3 color;
        
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float dist = length(uv);
          if (dist > 0.5) discard;
          
          float alpha = (0.5 - dist) * 2.0 * vOpacity * 0.3;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      blending: THREE.NormalBlending,
      transparent: true
    });

    const smokeParticles = new THREE.Points(smokeGeometry, smokeMaterial);
    fireGroup.add(smokeParticles);

    // Fire light
    const fireLight = new THREE.PointLight(0xff4400, intensity * 2, 20);
    fireLight.position.set(0, 1, 0);
    fireGroup.add(fireLight);

    fireGroup.position.copy(position);
    this.scene.add(fireGroup);
    this.fireParticles.push(fireGroup);

    // Store fire data
    const fireData = {
      group: fireGroup,
      intensity: intensity,
      material: fireMaterial,
      smokeMaterial: smokeMaterial,
      startTime: Date.now()
    };

    return fireData;
  }

  public extinguishFire(fireGroup: THREE.Group, extinguishType: 'water' | 'foam' | 'co2' | 'powder') {
    // Different extinguishing effects
    const effectiveness = {
      water: { wood: 0.9, plastic: 0.7, metal: 0.3, electrical: 0.1 },
      foam: { wood: 0.8, plastic: 0.9, metal: 0.5, electrical: 0.2 },
      co2: { wood: 0.6, plastic: 0.8, metal: 0.9, electrical: 0.95 },
      powder: { wood: 0.7, plastic: 0.8, metal: 0.8, electrical: 0.8 }
    };

    // Create extinguishing particle effect
    this.createExtinguishingEffect(fireGroup.position, extinguishType);

    // Gradually reduce fire intensity
    const fireParticles = fireGroup.children.find(child => child instanceof THREE.Points);
    if (fireParticles && fireParticles.material instanceof THREE.ShaderMaterial) {
      gsap.to(fireParticles.material.uniforms.intensity, {
        value: 0,
        duration: 3,
        onComplete: () => {
          this.scene.remove(fireGroup);
          const index = this.fireParticles.indexOf(fireGroup);
          if (index > -1) this.fireParticles.splice(index, 1);
        }
      });
    }
  }

  private createExtinguishingEffect(position: THREE.Vector3, type: string) {
    let color: THREE.Color;
    let particleCount: number;

    switch (type) {
      case 'water':
        color = new THREE.Color(0x4488ff);
        particleCount = 150;
        break;
      case 'foam':
        color = new THREE.Color(0xffffff);
        particleCount = 200;
        break;
      case 'co2':
        color = new THREE.Color(0xcccccc);
        particleCount = 100;
        break;
      case 'powder':
        color = new THREE.Color(0xffff88);
        particleCount = 180;
        break;
      default:
        color = new THREE.Color(0xffffff);
        particleCount = 100;
    }

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = position.y + Math.random() * 2;
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 2;

      velocities[i * 3] = (Math.random() - 0.5) * 10;
      velocities[i * 3 + 1] = Math.random() * 5 - 2;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
      color: color,
      size: 2,
      transparent: true,
      opacity: 0.8
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);

    // Animate particles
    gsap.to(particles.material, {
      opacity: 0,
      duration: 2,
      onComplete: () => {
        this.scene.remove(particles);
      }
    });
  }

  public createBuilding(type: 'office' | 'hospital' | 'factory' | 'residential') {
    const building = new THREE.Group();
    
    // Building geometry based on type
    let geometry: THREE.BoxGeometry;
    let materials: THREE.Material[];

    switch (type) {
      case 'office':
        geometry = new THREE.BoxGeometry(20, 15, 30);
        materials = [
          new THREE.MeshLambertMaterial({ color: 0x888888 }), // concrete
          new THREE.MeshLambertMaterial({ color: 0x4488ff, transparent: true, opacity: 0.7 }) // glass
        ];
        break;
      case 'hospital':
        geometry = new THREE.BoxGeometry(25, 12, 35);
        materials = [
          new THREE.MeshLambertMaterial({ color: 0xffffff }),
          new THREE.MeshLambertMaterial({ color: 0x44ff44 }) // medical green
        ];
        break;
      case 'factory':
        geometry = new THREE.BoxGeometry(40, 20, 50);
        materials = [
          new THREE.MeshLambertMaterial({ color: 0x666666 }), // metal
          new THREE.MeshLambertMaterial({ color: 0x444444 })
        ];
        break;
      default:
        geometry = new THREE.BoxGeometry(15, 10, 20);
        materials = [
          new THREE.MeshLambertMaterial({ color: 0xaa6644 }) // brick
        ];
    }

    const buildingMesh = new THREE.Mesh(geometry, materials[0]);
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    building.add(buildingMesh);

    // Add interior elements
    this.addBuildingInterior(building, type);

    return building;
  }

  private addBuildingInterior(building: THREE.Group, type: string) {
    // Add rooms, corridors, and fire safety equipment
    const room1 = new THREE.Mesh(
      new THREE.BoxGeometry(8, 3, 8),
      new THREE.MeshLambertMaterial({ color: 0xffeedd })
    );
    room1.position.set(-5, -4, -8);
    building.add(room1);

    // Fire extinguisher
    const extinguisher = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 1.5),
      new THREE.MeshLambertMaterial({ color: 0xff0000 })
    );
    extinguisher.position.set(-8, -3, -8);
    building.add(extinguisher);

    // Fire alarm
    const alarm = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.5),
      new THREE.MeshLambertMaterial({ color: 0xff4444 })
    );
    alarm.position.set(-5, -1, -12);
    building.add(alarm);

    // Emergency exit sign
    const exitSign = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.8, 0.1),
      new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    );
    exitSign.position.set(8, -1, -12);
    building.add(exitSign);
  }

  private updateMovement: () => void = () => {};

  private animate() {
    requestAnimationFrame(() => this.animate());

    // Update movement
    this.updateMovement();

    // Update physics
    this.world.step(1/60);

    // Update fire particles
    const time = Date.now() * 0.001;
    this.fireParticles.forEach(fireGroup => {
      fireGroup.children.forEach(child => {
        if (child instanceof THREE.Points && child.material instanceof THREE.ShaderMaterial) {
          child.material.uniforms.time.value = time;
        }
      });
    });

    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.fireParticles.forEach(fire => this.scene.remove(fire));
    this.smokeParticles.forEach(smoke => this.scene.remove(smoke));
    
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }

  public getScene() { return this.scene; }
  public getCamera() { return this.camera; }
  public getRenderer() { return this.renderer; }
}