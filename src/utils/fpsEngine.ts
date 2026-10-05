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
    this.scene.background = new THREE.Color(0x181e2b);

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
   * Builds high-tech esports tactical shooting range environment (matching 3D Aim Trainer benchmark)
   */
  private buildTacticalRange() {
    // 1. Clean Industrial Shooting Bay Lighting
    const ambientLight = new THREE.AmbientLight(0x384560, 2.6);
    this.scene.add(ambientLight);

    // Overhead stadium key downlight
    const keyLight = new THREE.DirectionalLight(0xf1f5f9, 3.2);
    keyLight.position.set(0, 8.0, -2);
    this.scene.add(keyLight);

    // Dedicated Firing Wall Key Illuminator
    const wallLight = new THREE.DirectionalLight(0xdbeafe, 2.6);
    wallLight.position.set(0, 4.0, 4);
    this.scene.add(wallLight);

    // 2. Industrial Modular Floor (y = 0, z from 0 to -10m)
    const floorGeo = new THREE.PlaneGeometry(36, 22);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x161d2a,
      roughness: 0.65,
      metalness: 0.35,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -5);
    this.scene.add(floor);

    // Floor tactical grid seams
    const gridHelper = new THREE.GridHelper(36, 36, 0x242f45, 0x1b2334);
    gridHelper.position.set(0, 0.01, -5);
    this.scene.add(gridHelper);

    // 3. Back Firing Wall (Tactical Steel Panels at z = -10.0m, height 14m spanning y = -2m to 12m)
    const wallGeo = new THREE.PlaneGeometry(36, 14.0);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x283347,
      roughness: 0.7,
      metalness: 0.32,
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 5.0, -10.0);
    this.scene.add(backWall);

    // Vertical structural columns on back wall
    [-12, -8, -4, 0, 4, 8, 12].forEach((x) => {
      const seamGeo = new THREE.BoxGeometry(0.22, 14.0, 0.08);
      const seamMat = new THREE.MeshStandardMaterial({
        color: 0x3d4d6a,
        roughness: 0.55,
        metalness: 0.5,
      });
      const seam = new THREE.Mesh(seamGeo, seamMat);
      seam.position.set(x, 5.0, -9.95);
      this.scene.add(seam);
    });

    // Horizontal architectural rails across back wall
    [3.6, 6.8].forEach((y) => {
      const railGeo = new THREE.BoxGeometry(36, 0.18, 0.1);
      const railMat = new THREE.MeshStandardMaterial({
        color: 0x3d4d6a,
        roughness: 0.55,
        metalness: 0.5,
      });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(0, y, -9.94);
      this.scene.add(rail);
    });

    // Industrial overhead ventilation pipe
    const pipeGeo = new THREE.CylinderGeometry(0.28, 0.28, 36, 24);
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x3b4a64,
      roughness: 0.45,
      metalness: 0.65,
    });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, 8.0, -9.6);
    this.scene.add(pipe);

    // 4. Industrial Overhead Catwalk & Roof Girders
    const ceilingGeo = new THREE.PlaneGeometry(36, 22);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x1b2332,
      roughness: 0.75,
      side: THREE.DoubleSide,
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 8.5, -5);
    this.scene.add(ceiling);

    // Industrial roof trusses / steel girders spanning across the bay
    [-10, -5, 0, 5, 10].forEach((x) => {
      const girderGeo = new THREE.BoxGeometry(0.24, 0.45, 16);
      const girderMat = new THREE.MeshStandardMaterial({
        color: 0x2d3a50,
        roughness: 0.5,
        metalness: 0.6,
      });
      const girder = new THREE.Mesh(girderGeo, girderMat);
      girder.position.set(x, 8.2, -4);
      this.scene.add(girder);
    });

    // Top Catwalk Warning Accent Rail matching 3D Aim Trainer reference
    const catwalkGeo = new THREE.BoxGeometry(36, 0.08, 0.08);
    const catwalkMat = new THREE.MeshBasicMaterial({ color: 0xff4655 });
    const catwalk = new THREE.Mesh(catwalkGeo, catwalkMat);
    catwalk.position.set(0, 8.4, -8.7);
    this.scene.add(catwalk);

    // 5. Side Enclosure Walls
    const sideWallGeo = new THREE.PlaneGeometry(22, 14.0);
    const sideWallMat = new THREE.MeshStandardMaterial({
      color: 0x1f2738,
      roughness: 0.8,
    });

    const leftWall = new THREE.Mesh(sideWallGeo, sideWallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-16, 5.0, -5);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeo, sideWallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(16, 5.0, -5);
    this.scene.add(rightWall);

    // Baseboard Floor Trim
    const baseboardGeo = new THREE.BoxGeometry(36, 0.2, 0.2);
    const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x2b374c });
    const baseboard = new THREE.Mesh(baseboardGeo, baseboardMat);
    baseboard.position.set(0, 0.1, -8.92);
    this.scene.add(baseboard);

    // Subtle side runner floor accent lights
    [-15.9, 15.9].forEach((x) => {
      const runnerGeo = new THREE.BoxGeometry(0.08, 0.04, 18);
      const runnerMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
      const runner = new THREE.Mesh(runnerGeo, runnerMat);
      runner.position.set(x, 0.02, -5);
      this.scene.add(runner);
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
   * Creates an authentic esports Cobalt Blue sphere target with high-precision center bullseye
   */
  public createCobaltTargetMesh(): { group: THREE.Group; headMesh: THREE.Mesh } {
    const group = new THREE.Group();

    // 1. Cobalt Blue Shaded Sphere
    const sphereGeo = new THREE.SphereGeometry(0.48, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.5,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMesh.name = 'head';
    group.add(sphereMesh);

    // 2. Subtle Precision Latitude/Longitude Wireframe
    const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(0.483, 16, 16));
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.22,
    });
    const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    group.add(wireMesh);

    // 3. Crisp Flat Bullseye Center Facing Player (Clean and pristine, no pimples)
    const bullseyeGroup = new THREE.Group();

    // Outer Orange Bullseye Ring
    const outerGeo = new THREE.CircleGeometry(0.088, 32);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      side: THREE.DoubleSide,
    });
    const outerDot = new THREE.Mesh(outerGeo, outerMat);
    bullseyeGroup.add(outerDot);

    // Inner White Pinpoint Dot for surgical center aiming
    const innerGeo = new THREE.CircleGeometry(0.028, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const innerDot = new THREE.Mesh(innerGeo, innerMat);
    innerDot.position.z = 0.002;
    bullseyeGroup.add(innerDot);

    bullseyeGroup.position.set(0, 0, 0.485);
    group.add(bullseyeGroup);

    return { group, headMesh: sphereMesh };
  }

  /**
   * Spawns a target for single-target drills (Whisper Grip, Stopping Power)
   */
  public spawnTarget(
    offsetAngleYaw: number,
    verticalOffsetMeters: number = 0,
    distance: number = 9.6,
    type: 'micro' | 'flick' | 'tile' = 'micro'
  ): Target3D {
    this.clearTargets();

    const { group, headMesh } = this.createCobaltTargetMesh();

    const targetYaw = this.yaw + offsetAngleYaw;
    const x = -Math.sin(targetYaw) * distance;
    const z = -Math.cos(targetYaw) * distance;
    const y = Math.max(1.2, Math.min(2.4, 1.65 + verticalOffsetMeters));

    group.position.set(x, y, z);
    group.lookAt(this.camera.position);
    this.scene.add(group);

    const targetObj: Target3D = {
      id: `target-${Date.now()}-${Math.random()}`,
      mesh: group,
      headMesh,
      worldPosition: new THREE.Vector3(x, y, z),
      spawnTime: performance.now(),
      isHit: false,
      type,
    };

    this.targets = [targetObj];
    return targetObj;
  }

  /**
   * Spawns a cobalt blue sphere target with orange core bullseye (matching 3D Aim Trainer benchmark)
   */
  public spawnTile(xPos: number, yPos: number, zPos: number = -9.6): Target3D {
    const { group, headMesh } = this.createCobaltTargetMesh();

    group.position.set(xPos, yPos, zPos);
    group.lookAt(this.camera.position);
    this.scene.add(group);

    const targetObj: Target3D = {
      id: `tile-${Date.now()}-${Math.random()}`,
      mesh: group,
      headMesh,
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
   * Spawns crisp cobalt blue and orange shatter sparks on target break
   */
  private spawnShatterParticles(pos: THREE.Vector3) {
    const pGeo = new THREE.BoxGeometry(0.065, 0.065, 0.065);
    const blueMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const orangeMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });

    for (let i = 0; i < 24; i++) {
      const mat = i % 3 === 0 ? orangeMat : blueMat;
      const pMesh = new THREE.Mesh(pGeo, mat);
      pMesh.position.copy(pos);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6 + 1.2,
        (Math.random() - 0.5) * 8
      );

      this.scene.add(pMesh);
      this.particles.push({
        mesh: pMesh,
        velocity: vel,
        life: 0,
        maxLife: 260 + Math.random() * 180, // ms
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

  public getActiveTargets(): Target3D[] {
    return this.targets;
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
