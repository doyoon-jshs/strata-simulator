'use client';

import { useEffect, useRef } from 'react';
import { BOUNDS, LAYERS, layerIndexAt, surfaceHeight, type TerrainPreset } from '@/lib/geology';

type Props = { strike: number; dip: number; sectionZ: number; terrain: TerrainPreset };

export function CrossSection({ strike, dip, sectionZ, terrain }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = 720;
    const height = 300;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return;
    const image = context.createImageData(width, height);

    for (let py = 0; py < height; py += 1) {
      for (let px = 0; px < width; px += 1) {
        const x = BOUNDS.minX + (px / width) * (BOUNDS.maxX - BOUNDS.minX);
        const y = BOUNDS.top - (py / height) * (BOUNDS.top - BOUNDS.bottom);
        const offset = (py * width + px) * 4;
        if (y <= surfaceHeight(x, sectionZ, terrain)) {
          const layer = LAYERS[layerIndexAt(x, y, sectionZ, strike, dip)];
          const hex = layer.color.slice(1);
          image.data[offset] = Number.parseInt(hex.slice(0, 2), 16);
          image.data[offset + 1] = Number.parseInt(hex.slice(2, 4), 16);
          image.data[offset + 2] = Number.parseInt(hex.slice(4, 6), 16);
        } else {
          image.data[offset] = 248;
          image.data[offset + 1] = 250;
          image.data[offset + 2] = 252;
        }
        image.data[offset + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);

    context.strokeStyle = 'rgba(100,116,139,.18)';
    context.lineWidth = 1;
    for (let i = 1; i < 8; i += 1) {
      context.beginPath();
      context.moveTo((width * i) / 8, 0);
      context.lineTo((width * i) / 8, height);
      context.stroke();
    }
    for (let i = 1; i < 5; i += 1) {
      context.beginPath();
      context.moveTo(0, (height * i) / 5);
      context.lineTo(width, (height * i) / 5);
      context.stroke();
    }

    context.strokeStyle = '#334155';
    context.lineWidth = 3;
    context.beginPath();
    for (let px = 0; px <= width; px += 2) {
      const x = BOUNDS.minX + (px / width) * (BOUNDS.maxX - BOUNDS.minX);
      const y = surfaceHeight(x, sectionZ, terrain);
      const py = ((BOUNDS.top - y) / (BOUNDS.top - BOUNDS.bottom)) * height;
      if (px === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    context.stroke();

    context.fillStyle = '#1e293b';
    context.font = '700 16px sans-serif';
    context.fillText('X', 10, 21);
    context.fillText('Y', width - 22, 21);
  }, [dip, sectionZ, strike, terrain]);

  return (
    <div className="flex h-full flex-col gap-3">
      <canvas
        ref={canvasRef}
        className="min-h-[250px] w-full flex-1 rounded-lg border border-slate-200 lg:min-h-0"
        aria-label="X-Y 지질 단면 시뮬레이션 결과"
      />
      <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500">Live section · linked to X–Y position</p>
    </div>
  );
}
