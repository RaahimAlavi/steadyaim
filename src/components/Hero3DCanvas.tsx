import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { audioEngine } from '../utils/audioEngine';

export const Hero3DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.2, 5.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient and directional lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(0x00f5d4, 4, 15);
    keyLight.position.set(-2, 3, 3);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xff4655, 3.5, 15);
    rimLight.position.set(2, 2, -1);
    scene.add(rimLight);

    // 3D Cyber Bot Target Group
    const botGroup = new THREE.Group();

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.3, 0.22, 1.0, 16);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x161a26,
      roughness: 0.3,
      metalness: 0.8,
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.0;
    botGroup.add(torso);

    // Chest Core Reactor (Glowing cyan)
    const coreGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 1.15, 0.22);
    botGroup.add(core);

    // Head
    const headGeo = new THREE.SphereGeometry(0.24, 24, 24);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xff4655,
      emissive: 0xff4655,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.6,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.75;
    head.name = 'head';
    botGroup.add(head);

    // Floating Target Ring around Head
    const haloGeo = new THREE.TorusGeometry(0.36, 0.02, 16, 48);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 1.75;
    botGroup.add(halo);

    // Base Pedestal
    const baseGeo = new THREE.CylinderGeometry(0.65, 0.8, 0.2, 6);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0e111a,
      roughness: 0.4,
      metalness: 0.9,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.1;
    botGroup.add(baseMesh);

    scene.add(botGroup);

    // Holographic Scope Reticle Overlay (in 3D)
    const reticleGroup = new THREE.Group();

    // Outer Target Bracket
    const reticleRingGeo = new THREE.RingGeometry(1.2, 1.23, 64);
    const reticleRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const reticleRing = new THREE.Mesh(reticleRingGeo, reticleRingMat);
    reticleGroup.add(reticleRing);

    // Crosshair Lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.6 });
    const lineGeoH = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.8, 0, 0),
      new THREE.Vector3(-0.6, 0, 0),
    ]);
    const lineGeoH2 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0.6, 0, 0),
      new THREE.Vector3(1.8, 0, 0),
    ]);
    const lineGeoV = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.6, 0),
      new THREE.Vector3(0, 1.8, 0),
    ]);
    const lineGeoV2 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.6, 0),
      new THREE.Vector3(0, -1.8, 0),
    ]);

    reticleGroup.add(new THREE.Line(lineGeoH, lineMat));
    reticleGroup.add(new THREE.Line(lineGeoH2, lineMat));
    reticleGroup.add(new THREE.Line(lineGeoV, lineMat));
    reticleGroup.add(new THREE.Line(lineGeoV2, lineMat));

    reticleGroup.position.set(0, 1.5, 2.5);
    scene.add(reticleGroup);

    // Ambient floating particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = Math.random() * 6 - 1;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f5d4,
      size: 0.035,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Particle burst array for click hits
    const sparkMeshes: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];

    // Interactive Mouse Tracking
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = normX * 0.4;
      targetY = normY * 0.3;
    };

    const onClick = () => {
      audioEngine.playShot();
      audioEngine.playHeadshot();

      // Shake bot on hit
      botGroup.position.z = -0.15;

      // Spawn spark particles at head location
      const pGeo = new THREE.BoxGeometry(0.04, 0.04, 0.04);
      const pMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
      for (let i = 0; i < 16; i++) {
        const p = new THREE.Mesh(pGeo, pMat);
        p.position.set(botGroup.position.x, 1.75, botGroup.position.z);
        const vel = new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          Math.random() * 3 + 1,
          (Math.random() - 0.5) * 3
        );
        scene.add(p);
        sparkMeshes.push({ mesh: p, vel, life: 0 });
      }
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();

      // Smooth camera parallax
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      camera.position.x = currentX * 1.5;
      camera.position.y = 1.2 + currentY * 1.2;
      camera.lookAt(0, 1.4, 0);

      // Bot gentle idle float and head ring rotation
      botGroup.rotation.y = Math.sin(t * 0.8) * 0.15;
      halo.rotation.z += dt * 2.5;
      reticleRing.rotation.z -= dt * 0.6;

      // Recover from hit shake
      botGroup.position.z += (0 - botGroup.position.z) * 0.15;

      // Reticle tracks subtle mouse motion
      reticleGroup.position.x = currentX * 0.8;
      reticleGroup.position.y = 1.5 + currentY * 0.6;

      // Animate hit sparks
      for (let i = sparkMeshes.length - 1; i >= 0; i--) {
        const item = sparkMeshes[i];
        item.life += dt;
        item.mesh.position.addScaledVector(item.vel, dt);
        item.vel.y -= 9.8 * dt * 0.5;
        if (item.life > 0.45) {
          scene.remove(item.mesh);
          sparkMeshes.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      sparkMeshes.forEach((s) => scene.remove(s.mesh));
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-crosshair overflow-hidden pointer-events-auto"
      title="Click bot head to test headshot feedback"
    />
  );
};
