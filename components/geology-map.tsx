'use client';

import { useEffect, useRef, useState } from 'react';
import { BOUNDS, LAYERS, layerIndexAt, mapToWorldZ, surfaceHeight, worldToMap, type TerrainPreset } from '@/lib/geology';

type Props = { strike: number; dip: number; sectionZ: number; terrain: TerrainPreset; onSectionChange: (value: number) => void };

export function GeologyMap({ strike, dip, sectionZ, terrain, onSectionChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState(false);

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
        const x = BOUNDS.minX + (px / width) * (BOUNDS.maxX - BOUNDS.minX);
        const z = BOUNDS.maxZ - (py / height) * (BOUNDS.maxZ - BOUNDS.minZ);
        const y = surfaceHeight(x, z, terrain);
        const layer = LAYERS[layerIndexAt(x, y, z, strike, dip)];
        const hex = layer.color.slice(1);
        let r = Number.parseInt(hex.slice(0, 2), 16);
        let g = Number.parseInt(hex.slice(2, 4), 16);
        let b = Number.parseInt(hex.slice(4, 6), 16);
        const neighborX = surfaceHeight(x + 0.018, z, terrain);
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
  }, [strike, dip, sectionZ, terrain]);

  const updateFromPointer = (clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const localY = ((clientY - rect.top) / rect.height) * canvas.height;
    onSectionChange(Number(mapToWorldZ(Math.max(0, Math.min(canvas.height, localY)), canvas.height).toFixed(2)));
  };

  return (
    <canvas
      ref={canvasRef}
      className="h-full min-h-[250px] w-full cursor-ns-resize rounded-lg border border-slate-200 object-cover lg:min-h-0"
      aria-label="단면선 X-Y를 위아래로 이동할 수 있는 지질도"
      onPointerDown={(event) => {
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
        updateFromPointer(event.clientY);
      }}
      onPointerMove={(event) => dragging && updateFromPointer(event.clientY)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    />
  );
}
