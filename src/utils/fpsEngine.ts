import * as THREE from 'three';
import { VALORANT_M_YAW, VALORANT_HORIZONTAL_FOV } from './aimMath';
import { audioEngine } from './audioEngine';

export interface Target3D {
  id: string;
  mesh: THREE.Group;
  headMesh: THREE.Mesh;
  worldPosition: THREE.Vector3;
  spawnTime: number;
  isHit: boolean;
  type: 'micro' | 'flick' | 'tile';
}

export interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class FPSEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;

  private targets: Target3D[] = [];
  private particles: Particle[] = [];
  private raycaster: THREE.Raycaster;
  private centerCoord: THREE.Vector2;

  // Dynamic muzzle flash light
  private muzzleLight: THREE.PointLight;
  private flashTimer: number | null = null;

  // Camera angles (radians)
  public yaw: number = 0;
  public pitch: number = 0;

  private animFrameId: number = 0;
  private isDestroyed: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07090e);
    this.scene.fog = new THREE.FogExp2(0x07090e, 0.022);

    // Initial camera with Valorant horizontal FOV (103 deg)
    const aspect = canvas.clientWidth / canvas.clientHeight || 16 / 9;
    const vFov = this.calculateVerticalFov(aspect);
    this.camera = new THREE.PerspectiveCamera(vFov, aspect, 0.1, 100);
    this.camera.position.set(0, 1.65, 0); // Standing eye height (1.65m)
    this.camera.rotation.order = 'YXZ';

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.raycaster = new THREE.Raycaster();
    this.centerCoord = new THREE.Vector2(0, 0); // Exactly screen center

    // Muzzle flash light attached to camera
    this.muzzleLight = new THREE.PointLight(0xfffaed, 0, 16);
    this.muzzleLight.position.set(0.2, -0.2, -0.6);
    this.camera.add(this.muzzleLight);
    this.scene.add(this.camera);

    this.buildTacticalRange();
    this.startLoop();
  }

  private calculateVerticalFov(aspect: number): number {
    const hFovRad = (VALORANT_HORIZONTAL_FOV * Math.PI) / 180;
    const vFovRad = 2 * Math.atan(Math.tan(hFovRad / 2) / aspect);
    return (vFovRad * 180) / Math.PI;
  }

  public resize() {
    if (this.isDestroyed || !this.canvas) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (width === 0 || height === 0) return;

    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.fov = this.calculateVerticalFov(aspect);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  /**
   * Builds high-tech esports tactical shooting range environment (3D Aim Trainer style)
   */
  private buildTacticalRange() {
    // Ambient tactical light
    const ambientLight = new THREE.AmbientLight(0x181f2f, 1.9);
    this.scene.add(ambientLight);

    // Overhead stadium key lights
    const keyLight = new THREE.DirectionalLight(0xdde5ff, 2.4);
    keyLight.position.set(4, 14, 6);
    this.scene.add(keyLight);

    // Radiant Cyan left fill light
    const cyanLight = new THREE.PointLight(0x00f5d4, 3.5, 30);
    cyanLight.position.set(-8, 4, -12);
    this.scene.add(cyanLight);

    // VCT Red right fill light
    const redLight = new THREE.PointLight(0xff4655, 3.5, 30);
    redLight.position.set(8, 4, -12);
    this.scene.add(redLight);

    // Checkered cybernetic ground plane
    const floorGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0d15,
      roughness: 0.65,
      metalness: 0.35,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    this.scene.add(floor);

    // Neon floor grid
    const gridHelper = new THREE.GridHelper(80, 40, 0xff4655, 0x182033);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // Concentric distance arc rings on ground (5m, 10m, 15m, 20m)
    [5, 10, 15, 20].forEach((dist) => {
      const ringGeo = new THREE.RingGeometry(dist - 0.06, dist + 0.06, 64, 1, 0, Math.PI);
      const ringMat = new THREE.MeshBasicMaterial({
        color: dist === 10 ? 0x00f5d4 : 0x222c42,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.02, 0);
      this.scene.add(ring);
    });

    // Back Arena Firing Wall
    const wallGeo = new THREE.PlaneGeometry(60, 14);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0e121d,
      roughness: 0.85,
      metalness: 0.2,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 7, -24);
    this.scene.add(wall);

    // Head-level reference beam (Valorant standing eye height ~1.65m)
    const beamGeo = new THREE.BoxGeometry(50, 0.05, 0.05);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, 1.65, -23.9);
    this.scene.add(beam);

    // Arena neon framing borders
    const topBorderGeo = new THREE.BoxGeometry(50, 0.1, 0.1);
    const topBorderMat = new THREE.MeshBasicMaterial({ color: 0xff4655 });
    const topBorder = new THREE.Mesh(topBorderGeo, topBorderMat);
    topBorder.position.set(0, 13.5, -23.9);
    this.scene.add(topBorder);

    // Tactical side pillars with neon accent strips
    [-15, 15].forEach((x) => {
      const pillarGeo = new THREE.BoxGeometry(2, 14, 2);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0x141a29,
        roughness: 0.5,
        metalness: 0.4,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(x, 7, -23);
      this.scene.add(pillar);

      // Neon vertical strip
      const stripGeo = new THREE.BoxGeometry(0.08, 13.8, 0.08);
      const stripMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(x > 0 ? x - 1.05 : x + 1.05, 7, -21.9);
      this.scene.add(strip);
    });
  }

  /**
   * Triggers realistic muzzle flash burst upon firing
   */
  public triggerMuzzleFlash() {
    this.muzzleLight.intensity = 3.5;
    if (this.flashTimer) clearTimeout(this.flashTimer);
    this.flashTimer = window.setTimeout(() => {
      this.muzzleLight.intensity = 0;
    }, 45);
  }

  /**
   * Applies raw mouse movement using exact Valorant rotation math
   */
  public handleMouseMove(movementX: number, movementY: number, sensitivity: number) {
    const radPerDegree = Math.PI / 180;
    const yawDelta = -movementX * sensitivity * VALORANT_M_YAW * radPerDegree;
    const pitchDelta = -movementY * sensitivity * VALORANT_M_YAW * radPerDegree;

    this.yaw += yawDelta;
    this.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.pitch + pitchDelta));

    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  /**
   * Clears all active targets
   */
  public clearTargets() {
    this.targets.forEach((t) => this.scene.remove(t.mesh));
    this.targets = [];
  }

  /**
   * Spawns a 3D tactical target bot firmly anchored to the floor plane (y = 0)
   */
  public spawnTarget(
    offsetAngleYaw: number,
    verticalOffsetMeters: number = 0,
    distance: number = 12,
    type: 'micro' | 'flick' | 'tile' = 'micro'
  ): Target3D {
    // Remove existing single target
    this.clearTargets();

    const group = new THREE.Group();
    const headHeight = Math.max(1.52, Math.min(1.78, 1.65 + verticalOffsetMeters));

    // Base Pedestal at y = 0
    const baseGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.1, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x161c28,
      roughness: 0.8,
      metalness: 0.3,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.05;
    group.add(baseMesh);

    // Stem Pole
    const poleGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.72, 16);
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x242d40,
      roughness: 0.5,
      metalness: 0.6,
    });
    const poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.position.y = 0.46;
    group.add(poleMesh);

    // Tactical Torso
    const torsoGeo = new THREE.CylinderGeometry(0.23, 0.29, 0.62, 16);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x192132,
      roughness: 0.7,
      metalness: 0.4,
    });
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.position.y = 1.05;
    group.add(torsoMesh);

    // Head Hitbox
    const headRadius = type === 'micro' ? 0.21 : 0.24;
    const headGeo = new THREE.SphereGeometry(headRadius, 24, 24);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xff4655,
      emissive: 0xff4655,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.6,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.name = 'head';
    headMesh.position.y = headHeight;
    group.add(headMesh);

    // Rotating Energy Ring around Head
    const ringGeo = new THREE.TorusGeometry(headRadius * 1.35, 0.02, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.name = 'ring';
    ring.position.y = headHeight;
    group.add(ring);

    // Position bot anchored to ground at y = 0
    const targetYaw = this.yaw + offsetAngleYaw;
    const x = -Math.sin(targetYaw) * distance;
    const z = -Math.cos(targetYaw) * distance;

    group.position.set(x, 0, z);
    group.lookAt(new THREE.Vector3(this.camera.position.x, 0, this.camera.position.z));
    this.scene.add(group);

    const targetObj: Target3D = {
      id: `target-${Date.now()}-${Math.random()}`,
      mesh: group,
      headMesh,
      worldPosition: new THREE.Vector3(x, headHeight, z),
      spawnTime: performance.now(),
      isHit: false,
      type,
    };

    this.targets = [targetObj];
    return targetObj;
  }

  /**
   * Spawns a cobalt blue sphere target with orange core dots (matching 3D Aim Trainer benchmark)
   */
  public spawnTile(xPos: number, yPos: number, zPos: number = -15): Target3D {
    const group = new THREE.Group();

    // 1. Cobalt Blue Shaded Sphere
    const sphereGeo = new THREE.SphereGeometry(0.38, 24, 24);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.65,
      roughness: 0.3,
      metalness: 0.6,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMesh.name = 'head';
    group.add(sphereMesh);

    // 2. Subtle Geometric Latitude/Longitude Wireframe
    const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(0.382, 16, 16));
    const wireMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.35 });
    const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    group.add(wireMesh);

    // 3. Bright Orange Core & Equatorial Target Dots (matching screenshot)
    const dotGeo = new THREE.SphereGeometry(0.065, 12, 12);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xfb923c });

    const centerDot = new THREE.Mesh(dotGeo, dotMat);
    centerDot.position.set(0, 0, 0.35);
    group.add(centerDot);

    [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((ang) => {
      const d = new THREE.Mesh(dotGeo, dotMat);
      d.position.set(Math.cos(ang) * 0.35, Math.sin(ang) * 0.35, 0.08);
      group.add(d);
    });

    group.position.set(xPos, yPos, zPos);
    group.lookAt(this.camera.position);
    this.scene.add(group);

    const targetObj: Target3D = {
      id: `tile-${Date.now()}-${Math.random()}`,
      mesh: group,
      headMesh: sphereMesh,
      worldPosition: new THREE.Vector3(xPos, yPos, zPos),
      spawnTime: performance.now(),
      isHit: false,
      type: 'tile',
    };

    this.targets.push(targetObj);
    return targetObj;
  }

  /**
   * Removes a specific target
   */
  public removeTarget(id: string) {
    const idx = this.targets.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.scene.remove(this.targets[idx].mesh);
      this.targets.splice(idx, 1);
    }
  }

  /**
   * Checks hit against all active targets
   */
  public checkHit(): { isHit: boolean; target: Target3D | null } {
    this.triggerMuzzleFlash();
    audioEngine.playShot();

    if (this.targets.length === 0) {
      return { isHit: false, target: null };
    }

    this.raycaster.setFromCamera(this.centerCoord, this.camera);

    for (const t of this.targets) {
      if (t.isHit) continue;

      const intersects = this.raycaster.intersectObjects(t.mesh.children, true);
      if (intersects.length > 0) {
        t.isHit = true;
        audioEngine.playHeadshot();

        // Spawn shatter particles
        this.spawnShatterParticles(t.worldPosition);

        // Remove mesh from scene
        this.scene.remove(t.mesh);
        this.targets = this.targets.filter((item) => item.id !== t.id);

        return { isHit: true, target: t };
      }
    }

    return { isHit: false, target: null };
  }

  /**
   * Spawns neon shatter particles on hit
   */
  private spawnShatterParticles(pos: THREE.Vector3) {
    const pGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    const pMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });

    for (let i = 0; i < 22; i++) {
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.copy(pos);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 7,
        Math.random() * 6 + 1.5,
        (Math.random() - 0.5) * 7
      );

      this.scene.add(pMesh);
      this.particles.push({
        mesh: pMesh,
        velocity: vel,
        life: 0,
        maxLife: 380 + Math.random() * 220, // ms
      });
    }
  }

  public updateTargetTensionState(isTense: boolean) {
    this.targets.forEach((t) => {
      if (!t.isHit) {
        const mat = t.headMesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.color.setHex(isTense ? 0xff0033 : 0xff4655);
          mat.emissive.setHex(isTense ? 0xff0033 : 0xff4655);
          mat.emissiveIntensity = isTense ? 0.95 : 0.45;
        }
      }
    });
  }

  public getActiveTargetsCount(): number {
    return this.targets.length;
  }

  private startLoop() {
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (this.isDestroyed) return;

      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      // Update particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life += dt * 1000;
        p.velocity.y -= 9.8 * dt; // gravity
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.mesh.rotation.x += dt * 5;
        p.mesh.rotation.y += dt * 5;

        if (p.life >= p.maxLife) {
          this.scene.remove(p.mesh);
          this.particles.splice(i, 1);
        }
      }

      // Rotate target decorative energy rings
      this.targets.forEach((t) => {
        if (!t.isHit) {
          const ring = t.mesh.getObjectByName('ring');
          if (ring) {
            ring.rotation.z += dt * 2.2;
          }
        }
      });

      this.renderer.render(this.scene, this.camera);
      this.animFrameId = requestAnimationFrame(animate);
    };

    this.animFrameId = requestAnimationFrame(animate);
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);
    this.clearTargets();
    this.particles.forEach((p) => this.scene.remove(p.mesh));
    this.renderer.dispose();
  }
}
