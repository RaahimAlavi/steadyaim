import * as THREE from 'three';
import { VALORANT_M_YAW, VALORANT_HORIZONTAL_FOV } from './aimMath';

export interface Target3D {
  mesh: THREE.Group;
  headMesh: THREE.Mesh;
  worldPosition: THREE.Vector3;
  spawnTime: number;
  isHit: boolean;
  type: 'micro' | 'flick';
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

  private currentTarget: Target3D | null = null;
  private particles: Particle[] = [];
  private raycaster: THREE.Raycaster;
  private centerCoord: THREE.Vector2;

  // Camera angles (radians)
  public yaw: number = 0;
  public pitch: number = 0;

  private animFrameId: number = 0;
  private isDestroyed: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c13);
    this.scene.fog = new THREE.FogExp2(0x0a0c13, 0.025);

    // Initial camera with Valorant horizontal FOV (103 deg)
    const aspect = canvas.clientWidth / canvas.clientHeight || 16 / 9;
    const vFov = this.calculateVerticalFov(aspect);
    this.camera = new THREE.PerspectiveCamera(vFov, aspect, 0.1, 100);
    this.camera.position.set(0, 1.65, 0); // Eye-level standing height (1.65m)
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
   * Builds high-tech tactical shooting range environment
   */
  private buildTacticalRange() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x202636, 1.8);
    this.scene.add(ambientLight);

    // Key directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(5, 12, 5);
    this.scene.add(dirLight);

    // Cyan tactical accent light
    const cyanLight = new THREE.PointLight(0x00f5d4, 3, 25);
    cyanLight.position.set(-6, 3, -10);
    this.scene.add(cyanLight);

    // Red tactical accent light
    const redLight = new THREE.PointLight(0xff4655, 3, 25);
    redLight.position.set(6, 3, -10);
    this.scene.add(redLight);

    // Floor grid (Tactical Checkered tiles)
    const floorGeo = new THREE.PlaneGeometry(60, 60, 30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f121b,
      roughness: 0.7,
      metalness: 0.3,
      wireframe: false,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    this.scene.add(floor);

    // Grid wire overlay on floor
    const gridHelper = new THREE.GridHelper(60, 60, 0xff4655, 0x1e2538);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // Distance markers on the ground (5m, 10m, 15m, 20m)
    [5, 10, 15, 20].forEach((dist) => {
      const ringGeo = new THREE.RingGeometry(dist - 0.05, dist + 0.05, 64, 1, 0, Math.PI);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x2a334d,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.02, 0);
      this.scene.add(ring);
    });

    // Back Firing Range Wall
    const wallGeo = new THREE.PlaneGeometry(50, 12);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x111520,
      roughness: 0.9,
      metalness: 0.1,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 6, -22);
    this.scene.add(wall);

    // Head-height reference horizontal line on back wall (Valorant head level ~1.65m)
    const lineGeo = new THREE.BoxGeometry(40, 0.04, 0.04);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
    const headLine = new THREE.Mesh(lineGeo, lineMat);
    headLine.position.set(0, 1.65, -21.9);
    this.scene.add(headLine);

    // Tactical side pillars
    [-12, 12].forEach((x) => {
      const pillarGeo = new THREE.BoxGeometry(1.5, 12, 1.5);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0x181e2c,
        roughness: 0.5,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(x, 6, -21);
      this.scene.add(pillar);
    });
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
   * Spawns a 3D tactical target bot
   * @param offsetAngleYaw Angle in radians offset from current view
   * @param offsetAnglePitch Angle in radians vertical offset from current view
   * @param distance Distance in meters from camera (e.g. 10m to 15m)
   */
  public spawnTarget(
    offsetAngleYaw: number,
    verticalOffsetMeters: number = 0,
    distance: number = 12,
    type: 'micro' | 'flick' = 'micro'
  ): Target3D {
    // Remove existing target
    if (this.currentTarget) {
      this.scene.remove(this.currentTarget.mesh);
    }

    const group = new THREE.Group();

    // Standing head level in tactical shooters (human eye height ~1.65m)
    // Small vertical variation: clamped between 1.55m and 1.75m
    const headHeight = Math.max(1.52, Math.min(1.75, 1.65 + verticalOffsetMeters));

    // 1. Pedestal Base on the Floor (World Y = 0)
    const baseGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.1, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x161c28,
      roughness: 0.8,
      metalness: 0.2,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.05;
    group.add(baseMesh);

    // 2. Tactical Stand / Legs
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 16);
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x222a3d,
      roughness: 0.6,
      metalness: 0.5,
    });
    const poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.position.y = 0.45;
    group.add(poleMesh);

    // 3. Armored Torso
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.30, 0.65, 16);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x1a2130,
      roughness: 0.7,
      metalness: 0.3,
    });
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.position.y = 1.05;
    group.add(torsoMesh);

    // 4. Target Head (Primary Hitbox Zone at exact Head Height)
    const headRadius = type === 'micro' ? 0.22 : 0.25;
    const headGeo = new THREE.SphereGeometry(headRadius, 24, 24);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xff4655, // Valorant red head
      emissive: 0xff4655,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.5,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.name = 'head';
    headMesh.position.y = headHeight;
    group.add(headMesh);

    // 5. Glowing core ring around head
    const ringGeo = new THREE.TorusGeometry(headRadius * 1.35, 0.02, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.name = 'ring';
    ring.position.y = headHeight;
    group.add(ring);


    // Calculate position in world coordinates
    // Yaw offset from current camera yaw, placing bot firmly on the ground plane (y = 0)
    const targetYaw = this.yaw + offsetAngleYaw;
    const x = -Math.sin(targetYaw) * distance;
    const z = -Math.cos(targetYaw) * distance;

    group.position.set(x, 0, z); // BASE RESTS FIRMLY ON THE FLOOR AT Y = 0
    group.lookAt(new THREE.Vector3(this.camera.position.x, 0, this.camera.position.z));

    this.scene.add(group);

    const targetObj: Target3D = {
      mesh: group,
      headMesh,
      worldPosition: new THREE.Vector3(x, headHeight, z),
      spawnTime: performance.now(),
      isHit: false,
      type,
    };

    this.currentTarget = targetObj;
    return targetObj;
  }

  /**
   * Fires raycast from screen center forward
   */
  public checkHit(): { isHit: boolean; target: Target3D | null } {
    if (!this.currentTarget || this.currentTarget.isHit) {
      return { isHit: false, target: null };
    }

    this.raycaster.setFromCamera(this.centerCoord, this.camera);
    const intersects = this.raycaster.intersectObjects(this.currentTarget.mesh.children, true);

    if (intersects.length > 0) {
      this.currentTarget.isHit = true;
      const hitTarget = this.currentTarget;

      // Spawn shatter particles
      this.spawnShatterParticles(hitTarget.worldPosition);

      // Animate hit target disappearance
      this.scene.remove(hitTarget.mesh);
      this.currentTarget = null;

      return { isHit: true, target: hitTarget };
    }

    return { isHit: false, target: this.currentTarget };
  }

  /**
   * Spawns headshot shatter sparks
   */
  private spawnShatterParticles(pos: THREE.Vector3) {
    const pGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    const pMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });

    for (let i = 0; i < 18; i++) {
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.copy(pos);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        Math.random() * 5 + 1,
        (Math.random() - 0.5) * 6
      );

      this.scene.add(pMesh);
      this.particles.push({
        mesh: pMesh,
        velocity: vel,
        life: 0,
        maxLife: 350 + Math.random() * 200, // ms
      });
    }
  }

  public updateTargetTensionState(isTense: boolean) {
    if (this.currentTarget && !this.currentTarget.isHit) {
      const headMat = this.currentTarget.headMesh.material as THREE.MeshStandardMaterial;
      if (headMat) {
        headMat.color.setHex(isTense ? 0xff0033 : 0xff4655);
        headMat.emissive.setHex(isTense ? 0xff0033 : 0xff4655);
        headMat.emissiveIntensity = isTense ? 0.9 : 0.35;
      }
    }
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

      // Rotate target decorative ring slightly
      if (this.currentTarget && !this.currentTarget.isHit) {
        const ring = this.currentTarget.mesh.getObjectByName('ring');
        if (ring) {
          ring.rotation.z += dt * 2;
        }
      }

      this.renderer.render(this.scene, this.camera);
      this.animFrameId = requestAnimationFrame(animate);
    };

    this.animFrameId = requestAnimationFrame(animate);
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);
    if (this.currentTarget) {
      this.scene.remove(this.currentTarget.mesh);
    }
    this.particles.forEach((p) => this.scene.remove(p.mesh));
    this.renderer.dispose();
  }
}
