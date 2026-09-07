'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BOUNDS,
  beddingOrientationAt,
  faultPlaneCoordinate,
  layerIndexAt,
  mapToWorldZ,
  surfaceHeight,
  worldToMap,
  type GeologicStructure,
  type GeologyLayer,
  type TerrainPreset,
} from '@/lib/geology';

type Props = {
  strike: number;
  dip: number;
  sectionZ: number;
  terrain: TerrainPreset;
  structure: GeologicStructure;
  geologyOffset: number;
  faultDip: number;
  unconformityDip: number;
  layers: readonly GeologyLayer[];
  boundaries: readonly number[];
  onSectionChange: (value: number) => void;
};

function worldToMapX(x: number, width: number) {
  return ((BOUNDS.maxX - x) / (BOUNDS.maxX - BOUNDS.minX)) * width;
}

function mapToWorldX(px: number, width: number) {
  return BOUNDS.maxX - (px / width) * (BOUNDS.maxX - BOUNDS.minX);
}

export function GeologyMap({ strike, dip, sectionZ, terrain, structure, geologyOffset, faultDip, unconformityDip, layers, boundaries, onSectionChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [markers, setMarkers] = useState<Array<{ x: number; z: number }>>([]);
  const draggingRef = useRef(false);
  const draggedRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = 620;
    const height = 410;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return;
    const image = context.createImageData(width, height);
    for (let py = 0; py < height; py += 1) {
      for (let px = 0; px < width; px += 1) {
        const x = mapToWorldX(px, width);
        const z = BOUNDS.maxZ - (py / height) * (BOUNDS.maxZ - BOUNDS.minZ);
        const y = surfaceHeight(x, z, terrain);
        const layer = layers[layerIndexAt(x, y, z, strike, dip, boundaries, structure, geologyOffset, faultDip, unconformityDip)];
        const hex = layer.color.slice(1);
        let r = Number.parseInt(hex.slice(0, 2), 16);
        let g = Number.parseInt(hex.slice(2, 4), 16);
        let b = Number.parseInt(hex.slice(4, 6), 16);
        const neighborX = surfaceHeight(x - 0.018, z, terrain);
        const neighborZ = surfaceHeight(x, z + 0.018, terrain);
        const contour = Math.floor(y / 0.14) !== Math.floor(neighborX / 0.14) || Math.floor(y / 0.14) !== Math.floor(neighborZ / 0.14);
        if (contour) {
          r = Math.round(r * 0.59);
          g = Math.round(g * 0.59);
          b = Math.round(b * 0.59);
        }
        const offset = (py * width + px) * 4;
        image.data[offset] = r;
        image.data[offset + 1] = g;
        image.data[offset + 2] = b;
        image.data[offset + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);

    if (structure === 'fault') {
      context.strokeStyle = 'rgba(15,23,42,.88)';
      context.lineWidth = 4;
      context.setLineDash([10, 6]);
      context.beginPath();
      let drawing = false;
      for (let py = 0; py <= height; py += 2) {
        const z = BOUNDS.maxZ - (py / height) * (BOUNDS.maxZ - BOUNDS.minZ);
        let previousX: number = BOUNDS.minX;
        let previousValue = faultPlaneCoordinate(previousX, surfaceHeight(previousX, z, terrain), z, faultDip);
        let root: number | null = null;
        for (let step = 1; step <= 160; step += 1) {
          const x = BOUNDS.minX + ((BOUNDS.maxX - BOUNDS.minX) * step) / 160;
          const value = faultPlaneCoordinate(x, surfaceHeight(x, z, terrain), z, faultDip);
          if (value === 0 || previousValue * value < 0) {
            const mix = Math.abs(previousValue) / (Math.abs(previousValue) + Math.abs(value));
            root = previousX + (x - previousX) * mix;
            break;
          }
          previousX = x;
          previousValue = value;
        }
        if (root !== null) {
          if (!drawing) context.moveTo(worldToMapX(root, width), py);
          else context.lineTo(worldToMapX(root, width), py);
          drawing = true;
        } else {
          drawing = false;
        }
      }
      context.stroke();
      context.setLineDash([]);
    }

    const lineY = worldToMap(sectionZ, height);
    context.strokeStyle = 'rgba(255,255,255,.92)';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(28, lineY);
    context.lineTo(width - 28, lineY);
    context.stroke();
    context.fillStyle = '#1e293b';
    context.font = '700 22px sans-serif';
    context.textAlign = 'center';
    for (const [label, x] of [['X', 18], ['Y', width - 18]] as const) {
      context.beginPath();
      context.arc(x, lineY, 15, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#ffffff';
      context.fillText(label, x, lineY + 7);
      context.fillStyle = '#1e293b';
    }

    for (const marker of markers) {
      context.save();
      const centerX = worldToMapX(marker.x, width);
      const centerY = worldToMap(marker.z, height);
      const orientation = beddingOrientationAt(
        marker.x,
        marker.z,
        strike,
        dip,
        terrain,
        structure,
        boundaries,
        geologyOffset,
        unconformityDip,
      );
      const strikeRadians = (orientation.strike * Math.PI) / 180;
      const strikeX = -Math.sin(strikeRadians);
      const strikeY = -Math.cos(strikeRadians);
      const dipDirectionRadians = (orientation.dipDirection * Math.PI) / 180;
      const dipX = -Math.sin(dipDirectionRadians);
      const dipY = -Math.cos(dipDirectionRadians);

      const drawSymbolPath = () => {
        context.beginPath();
        if (orientation.dip < 0.5) {
          context.arc(centerX, centerY, 10, 0, Math.PI * 2);
          context.moveTo(centerX - 7, centerY);
          context.lineTo(centerX + 7, centerY);
          context.moveTo(centerX, centerY - 7);
          context.lineTo(centerX, centerY + 7);
          return;
        }

        const halfStrike = 18;
        context.moveTo(centerX - strikeX * halfStrike, centerY - strikeY * halfStrike);
        context.lineTo(centerX + strikeX * halfStrike, centerY + strikeY * halfStrike);
        context.moveTo(centerX, centerY);
        context.lineTo(centerX + dipX * 12, centerY + dipY * 12);
      };

      context.setLineDash([]);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = 'rgba(255,255,255,.96)';
      context.lineWidth = 6;
      drawSymbolPath();
      context.stroke();
      context.strokeStyle = '#0f172a';
      context.lineWidth = 2.5;
      drawSymbolPath();
      context.stroke();

      if (orientation.dip >= 0.5) {
        const labelX = centerX + dipX * 23;
        const labelY = centerY + dipY * 23;
        context.font = '700 15px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.lineWidth = 4;
        context.strokeStyle = 'rgba(255,255,255,.96)';
        context.strokeText(`${Math.round(orientation.dip)}°`, labelX, labelY);
        context.fillStyle = '#0f172a';
        context.fillText(`${Math.round(orientation.dip)}°`, labelX, labelY);
      }
      context.restore();
    }

    context.fillStyle = 'rgba(30,41,59,.9)';
    context.beginPath();
    context.roundRect(width - 67, 15, 48, 62, 14);
    context.fill();
    context.fillStyle = '#ffffff';
    context.font = '700 17px sans-serif';
    context.fillText('N', width - 43, 39);
    context.beginPath();
    context.moveTo(width - 43, 47);
    context.lineTo(width - 52, 65);
    context.lineTo(width - 34, 65);
    context.closePath();
    context.fill();
  }, [strike, dip, sectionZ, terrain, structure, geologyOffset, faultDip, unconformityDip, layers, boundaries, markers]);

  const updateFromPointer = (clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const localY = ((clientY - rect.top) / rect.height) * canvas.height;
    onSectionChange(Number(mapToWorldZ(Math.max(0, Math.min(canvas.height, localY)), canvas.height).toFixed(2)));
  };

  const placeMarker = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * canvas.width;
    const py = ((clientY - rect.top) / rect.height) * canvas.height;
    const x = mapToWorldX(Math.max(0, Math.min(canvas.width, px)), canvas.width);
    const z = mapToWorldZ(Math.max(0, Math.min(canvas.height, py)), canvas.height);
    setMarkers((current) => [...current, { x, z }]);
  };

  const removeMarker = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || markers.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const pointerX = ((clientX - rect.left) / rect.width) * canvas.width;
    const pointerY = ((clientY - rect.top) / rect.height) * canvas.height;
    let nearestIndex = -1;
    let nearestDistance = 30;

    markers.forEach((marker, index) => {
      const markerX = worldToMapX(marker.x, canvas.width);
      const markerY = worldToMap(marker.z, canvas.height);
      const distance = Math.hypot(pointerX - markerX, pointerY - markerY);
      if (distance < nearestDistance) {
        nearestIndex = index;
        nearestDistance = distance;
      }
    });

    if (nearestIndex >= 0) {
      setMarkers((current) => current.filter((_, index) => index !== nearestIndex));
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="h-full min-h-[250px] w-full cursor-crosshair rounded-lg border border-slate-200 object-cover lg:min-h-0"
      aria-label="클릭할 때마다 주향과 경사 기호를 추가하고, 기호를 우클릭하면 삭제하며, 드래그하면 단면선 X-Y를 이동할 수 있는 지질도"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        draggingRef.current = true;
        draggedRef.current = false;
        pointerStartRef.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!draggingRef.current || !pointerStartRef.current) return;
        const distance = Math.hypot(event.clientX - pointerStartRef.current.x, event.clientY - pointerStartRef.current.y);
        if (distance >= 6) draggedRef.current = true;
        if (draggedRef.current) updateFromPointer(event.clientY);
      }}
      onPointerUp={(event) => {
        if (!draggingRef.current) return;
        if (!draggedRef.current) placeMarker(event.clientX, event.clientY);
        draggingRef.current = false;
        pointerStartRef.current = null;
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
        pointerStartRef.current = null;
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        removeMarker(event.clientX, event.clientY);
      }}
    />
  );
}
