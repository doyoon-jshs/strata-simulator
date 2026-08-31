'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BOUNDS, LAYERS, layerIndexAt, surfaceHeight } from '@/lib/geology';

type Props = { strike: number; dip: number; sectionZ: number; showSlice: boolean };

function pushTriangle(
  positions: number[],
  colors: number[],
  points: [THREE.Vector3, THREE.Vector3, THREE.Vector3],
  color: THREE.Color,
) {
  for (const point of points) {
    positions.push(point.x, point.y, point.z);
    colors.push(color.r, color.g, color.b);
  }
}

function makeGeometry(positions: number[], colors: number[]) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function terrainGeometry(strike: number, dip: number) {
  const positions: number[] = [];
  const colors: number[] = [];
  const nx = 72;
  const nz = 54;
  const dx = (BOUNDS.maxX - BOUNDS.minX) / nx;
  const dz = (BOUNDS.maxZ - BOUNDS.minZ) / nz;

  for (let iz = 0; iz < nz; iz += 1) {
    for (let ix = 0; ix < nx; ix += 1) {
      const x0 = BOUNDS.minX + ix * dx;
      const x1 = x0 + dx;
      const z0 = BOUNDS.minZ + iz * dz;
      const z1 = z0 + dz;
      const a = new THREE.Vector3(x0, surfaceHeight(x0, z0), z0);
      const b = new THREE.Vector3(x1, surfaceHeight(x1, z0), z0);
      const c = new THREE.Vector3(x1, surfaceHeight(x1, z1), z1);
      const d = new THREE.Vector3(x0, surfaceHeight(x0, z1), z1);
      const layer1 = layerIndexAt((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3, strike, dip);
      const layer2 = layerIndexAt((a.x + c.x + d.x) / 3, (a.y + c.y + d.y) / 3, (a.z + c.z + d.z) / 3, strike, dip);
      pushTriangle(positions, colors, [a, b, c], new THREE.Color(LAYERS[layer1].color));
      pushTriangle(positions, colors, [a, c, d], new THREE.Color(LAYERS[layer2].color));
    }
  }
  return makeGeometry(positions, colors);
}

function wallGeometry(axis: 'x' | 'z', constant: number, strike: number, dip: number) {
  const positions: number[] = [];
  const colors: number[] = [];
  const horizontalSteps = 64;
  const verticalSteps = 40;
  const min = axis === 'z' ? BOUNDS.minX : BOUNDS.minZ;
  const max = axis === 'z' ? BOUNDS.maxX : BOUNDS.maxZ;

  for (let i = 0; i < horizontalSteps; i += 1) {
    const h0 = min + ((max - min) * i) / horizontalSteps;
    const h1 = min + ((max - min) * (i + 1)) / horizontalSteps;
    const x0 = axis === 'z' ? h0 : constant;
    const z0 = axis === 'z' ? constant : h0;
    const x1 = axis === 'z' ? h1 : constant;
    const z1 = axis === 'z' ? constant : h1;
    const top0 = surfaceHeight(x0, z0);
    const top1 = surfaceHeight(x1, z1);

    for (let j = 0; j < verticalSteps; j += 1) {
      const y00 = BOUNDS.bottom + ((top0 - BOUNDS.bottom) * j) / verticalSteps;
      const y01 = BOUNDS.bottom + ((top1 - BOUNDS.bottom) * j) / verticalSteps;
      const y10 = BOUNDS.bottom + ((top0 - BOUNDS.bottom) * (j + 1)) / verticalSteps;
      const y11 = BOUNDS.bottom + ((top1 - BOUNDS.bottom) * (j + 1)) / verticalSteps;
      const a = new THREE.Vector3(x0, y00, z0);
      const b = new THREE.Vector3(x1, y01, z1);
      const c = new THREE.Vector3(x1, y11, z1);
      const d = new THREE.Vector3(x0, y10, z0);
      const layer1 = layerIndexAt((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3, strike, dip);
      const layer2 = layerIndexAt((a.x + c.x + d.x) / 3, (a.y + c.y + d.y) / 3, (a.z + c.z + d.z) / 3, strike, dip);
      pushTriangle(positions, colors, [a, b, c], new THREE.Color(LAYERS[layer1].dark));
      pushTriangle(positions, colors, [a, c, d], new THREE.Color(LAYERS[layer2].dark));
    }
  }
  return makeGeometry(positions, colors);
}

function sliceGeometry(sectionZ: number, strike: number, dip: number) {
  const positions: number[] = [];
  const colors: number[] = [];
  const nx = 86;
  const ny = 48;
  const dx = (BOUNDS.maxX - BOUNDS.minX) / nx;

  for (let ix = 0; ix < nx; ix += 1) {
    const x0 = BOUNDS.minX + ix * dx;
    const x1 = x0 + dx;
    const top0 = surfaceHeight(x0, sectionZ);
    const top1 = surfaceHeight(x1, sectionZ);
    for (let iy = 0; iy < ny; iy += 1) {
      const y00 = BOUNDS.bottom + ((top0 - BOUNDS.bottom) * iy) / ny;
      const y01 = BOUNDS.bottom + ((top1 - BOUNDS.bottom) * iy) / ny;
      const y10 = BOUNDS.bottom + ((top0 - BOUNDS.bottom) * (iy + 1)) / ny;
      const y11 = BOUNDS.bottom + ((top1 - BOUNDS.bottom) * (iy + 1)) / ny;
      const a = new THREE.Vector3(x0, y00, sectionZ);
      const b = new THREE.Vector3(x1, y01, sectionZ);
      const c = new THREE.Vector3(x1, y11, sectionZ);
      const d = new THREE.Vector3(x0, y10, sectionZ);
      const layer1 = layerIndexAt((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, sectionZ, strike, dip);
      const layer2 = layerIndexAt((a.x + c.x + d.x) / 3, (a.y + c.y + d.y) / 3, sectionZ, strike, dip);
      pushTriangle(positions, colors, [a, b, c], new THREE.Color(LAYERS[layer1].color));
      pushTriangle(positions, colors, [a, c, d], new THREE.Color(LAYERS[layer2].color));
    }
  }
  return makeGeometry(positions, colors);
}

export function GeologyScene({ strike, dip, sectionZ, showSlice }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#112a2d');
    scene.fog = new THREE.Fog('#112a2d', 11, 22);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(8.2, 6.5, 8.7);
    camera.lookAt(0, -0.1, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, -0.2, 0);
    controls.minDistance = 7;
    controls.maxDistance = 19;
    controls.maxPolarAngle = Math.PI * 0.49;
    scene.add(new THREE.HemisphereLight('#e9f1d8', '#274147', 2.15));
    const sun = new THREE.DirectionalLight('#fff4d1', 2.6);
    sun.position.set(-6, 10, 7);
    scene.add(sun);

    const surfaceMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, flatShading: true, side: THREE.DoubleSide });
    const wallMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide });
    const sliceMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.92, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
    const surface = new THREE.Mesh(terrainGeometry(strike, dip), surfaceMaterial);
    scene.add(surface);
    scene.add(
      new THREE.Mesh(wallGeometry('z', BOUNDS.maxZ, strike, dip), wallMaterial),
      new THREE.Mesh(wallGeometry('x', BOUNDS.maxX, strike, dip), wallMaterial),
      new THREE.Mesh(wallGeometry('z', BOUNDS.minZ, strike, dip), wallMaterial),
      new THREE.Mesh(wallGeometry('x', BOUNDS.minX, strike, dip), wallMaterial),
    );

    let topLineMaterial: THREE.LineBasicMaterial | null = null;
    if (showSlice) {
      scene.add(new THREE.Mesh(sliceGeometry(sectionZ, strike, dip), sliceMaterial));
      const points = Array.from({ length: 90 }, (_, index) => {
        const x = BOUNDS.minX + ((BOUNDS.maxX - BOUNDS.minX) * index) / 89;
        return new THREE.Vector3(x, surfaceHeight(x, sectionZ) + 0.012, sectionZ);
      });
      topLineMaterial = new THREE.LineBasicMaterial({ color: '#fff3c4' });
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), topLineMaterial));
    }
    const grid = new THREE.GridHelper(12, 12, '#44676a', '#29474a');
    grid.position.y = BOUNDS.bottom - 0.03;
    scene.add(grid);

    const resize = () => {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = Math.max(clientWidth / Math.max(clientHeight, 1), 0.1);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    let frame = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) object.geometry.dispose();
      });
      surfaceMaterial.dispose();
      wallMaterial.dispose();
      sliceMaterial.dispose();
      topLineMaterial?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [strike, dip, sectionZ, showSlice]);

  return (
    <div className="relative h-full min-h-[430px] overflow-hidden rounded-[22px] bg-[#112a2d]">
      <div ref={mountRef} className="absolute inset-0" aria-label="회전 가능한 다층 3D 지질 모형" />
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-[#0d2225]/75 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white/80 backdrop-blur">드래그하여 회전 · 스크롤하여 확대</div>
      <div className="pointer-events-none absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-[#0d2225]/80 text-white shadow-lg backdrop-blur">
        <span className="absolute top-1 text-[10px] font-bold">N</span>
        <span className="h-7 w-px -translate-y-0.5 bg-[#e9c96f]" />
        <span className="absolute top-4 h-0 w-0 border-x-[4px] border-b-[9px] border-x-transparent border-b-[#e9c96f]" />
      </div>
    </div>
  );
}
