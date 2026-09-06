'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BOUNDS, LAYERS, formatDipDirection, formatStrike, layerIndexAt, surfaceHeight } from '@/lib/geology';

export type SurfaceMeasurement = {
  strike: number;
  dip: number;
  direction: string;
  x: number;
  z: number;
  elevation: number;
  layer: string;
};

type Props = {
  strike: number;
  dip: number;
  sectionZ: number;
  showSlice: boolean;
  measurement: SurfaceMeasurement | null;
  onMeasure: (result: SurfaceMeasurement) => void;
};

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

function createClinometerModel(strike: number, dip: number) {
  const group = new THREE.Group();
  const caseMaterial = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.42, metalness: 0.08 });
  const faceMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.72 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.48 });
  const vialMaterial = new THREE.MeshStandardMaterial({ color: '#67e8f9', transparent: true, opacity: 0.78, roughness: 0.2 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 0.42), caseMaterial);
  body.castShadow = true;
  group.add(body);

  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.035, 40), faceMaterial);
  dial.position.set(0.23, 0.078, 0);
  group.add(dial);

  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.035, 0.035), accentMaterial);
  needle.position.set(0.23, 0.108, 0);
  group.add(needle);

  const vial = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.045, 0.085), vialMaterial);
  vial.position.set(-0.25, 0.093, 0);
  group.add(vial);

  const marker = new THREE.Mesh(new THREE.RingGeometry(0.27, 0.32, 40), accentMaterial);
  marker.rotation.x = -Math.PI / 2;
  marker.position.y = -0.067;
  group.add(marker);

  const directionArrow = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.19, 24), accentMaterial);
  directionArrow.rotation.z = -Math.PI / 2;
  directionArrow.position.set(0.48, 0.1, 0);
  group.add(directionArrow);

  const strikeRadians = (strike * Math.PI) / 180;
  const dipDirectionRadians = ((strike + 90) * Math.PI) / 180;
  const dipRadians = (dip * Math.PI) / 180;
  const strikeVector = new THREE.Vector3(Math.sin(strikeRadians), 0, Math.cos(strikeRadians)).normalize();
  const downDipVector = new THREE.Vector3(
    Math.sin(dipDirectionRadians) * Math.cos(dipRadians),
    -Math.sin(dipRadians),
    Math.cos(dipDirectionRadians) * Math.cos(dipRadians),
  ).normalize();
  const normal = new THREE.Vector3().crossVectors(strikeVector, downDipVector).normalize();
  group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(downDipVector, normal, strikeVector));
  group.userData.normal = normal;
  return group;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => material.dispose());
  });
}

export function GeologyScene({ strike, dip, sectionZ, showSlice, measurement, onMeasure }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f4f6f8');
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
    controls.maxDistance = 34;
    controls.maxPolarAngle = Math.PI * 0.49;
    scene.add(new THREE.HemisphereLight('#ffffff', '#94a3b8', 2.35));
    const sun = new THREE.DirectionalLight('#ffffff', 2.75);
    sun.position.set(-6, 10, 7);
    scene.add(sun);

    const surfaceMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, flatShading: true, side: THREE.DoubleSide });
    const wallMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide });
    const sliceMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.92, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
    const surface = new THREE.Mesh(terrainGeometry(strike, dip), surfaceMaterial);
    surface.name = 'terrain-surface';
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
      topLineMaterial = new THREE.LineBasicMaterial({ color: '#2563eb' });
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), topLineMaterial));
    }
    const grid = new THREE.GridHelper(12, 12, '#cbd5e1', '#e2e8f0');
    grid.position.y = BOUNDS.bottom - 0.03;
    scene.add(grid);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerStart: { x: number; y: number } | null = null;
    let instrument: THREE.Group | null = null;

    const handlePointerDown = (event: PointerEvent) => {
      pointerStart = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!pointerStart) return;
      const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
      pointerStart = null;
      if (distance > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(surface, false)[0];
      if (!hit) return;

      if (instrument) {
        scene.remove(instrument);
        disposeObject(instrument);
      }
      instrument = createClinometerModel(strike, dip);
      const normal = instrument.userData.normal as THREE.Vector3;
      instrument.position.copy(hit.point).addScaledVector(normal, 0.14);
      instrument.position.y += 0.08;
      scene.add(instrument);

      const layer = LAYERS[layerIndexAt(hit.point.x, hit.point.y, hit.point.z, strike, dip)];
      onMeasure({
        strike,
        dip,
        direction: formatDipDirection(strike),
        x: hit.point.x,
        z: hit.point.z,
        elevation: hit.point.y,
        layer: layer.name,
      });
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.style.cursor = 'crosshair';

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
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      if (instrument) {
        scene.remove(instrument);
        disposeObject(instrument);
      }
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
  }, [strike, dip, sectionZ, showSlice, onMeasure]);

  return (
    <div className="relative h-full min-h-[430px] overflow-hidden rounded-xl border border-slate-200 bg-[#f4f6f8]">
      <div ref={mountRef} className="absolute inset-0" aria-label="회전 가능한 다층 3D 지질 모형" />
      <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-blue-200 bg-white/95 px-3 py-1.5 font-mono text-[10px] font-semibold tracking-wide text-blue-700 shadow-sm backdrop-blur">CLICK TO MEASURE · DRAG TO ORBIT</div>
      <div className="pointer-events-none absolute right-4 top-4 min-w-44 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur" aria-live="polite">
        {measurement ? (
          <>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">Clinometer · {measurement.layer}</p>
            <div className="mt-1.5 grid grid-cols-2 gap-x-4">
              <div><span className="block text-[10px] text-slate-500">주향</span><strong className="font-mono text-sm text-slate-900">{formatStrike(measurement.strike)}</strong></div>
              <div><span className="block text-[10px] text-slate-500">경사</span><strong className="font-mono text-sm text-slate-900">{measurement.dip}°{measurement.direction}</strong></div>
            </div>
            <p className="mt-1.5 font-mono text-[9px] text-slate-500">X {measurement.x.toFixed(2)} · Z {measurement.z.toFixed(2)} · H {measurement.elevation.toFixed(2)}</p>
          </>
        ) : (
          <p className="text-xs font-medium text-slate-500">지형을 클릭해 주향과 경사를 측정하세요.</p>
        )}
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur">
        <span className="absolute top-1 text-[10px] font-bold">N</span>
        <span className="h-7 w-px -translate-y-0.5 bg-blue-600" />
        <span className="absolute top-4 h-0 w-0 border-x-[4px] border-b-[9px] border-x-transparent border-b-blue-600" />
      </div>
    </div>
  );
}
