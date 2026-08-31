'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BOUNDS, LAYERS, layerIndexAt, surfaceHeight } from '@/lib/geology';

type Point = { x: number; y: number };
type Props = { strike: number; dip: number; sectionZ: number; showAnswer: boolean; onShowAnswerChange: (value: boolean) => void };

export function CrossSection({ strike, dip, sectionZ, showAnswer, onShowAnswerChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [drawing, setDrawing] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = 720;
    const height = 300;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#f2ede3';
    context.fillRect(0, 0, width, height);
    if (showAnswer) {
      const image = context.createImageData(width, height);
      for (let py = 0; py < height; py += 1) {
        for (let px = 0; px < width; px += 1) {
          const x = BOUNDS.minX + (px / width) * (BOUNDS.maxX - BOUNDS.minX);
          const y = BOUNDS.top - (py / height) * (BOUNDS.top - BOUNDS.bottom);
          const offset = (py * width + px) * 4;
          if (y <= surfaceHeight(x, sectionZ)) {
            const layer = LAYERS[layerIndexAt(x, y, sectionZ, strike, dip)];
            const hex = layer.color.slice(1);
            image.data[offset] = Number.parseInt(hex.slice(0, 2), 16);
            image.data[offset + 1] = Number.parseInt(hex.slice(2, 4), 16);
            image.data[offset + 2] = Number.parseInt(hex.slice(4, 6), 16);
          } else {
            image.data[offset] = 242;
            image.data[offset + 1] = 237;
            image.data[offset + 2] = 227;
          }
          image.data[offset + 3] = 255;
        }
      }
      context.putImageData(image, 0, 0);
    }
    context.strokeStyle = 'rgba(42,60,59,.13)';
    context.lineWidth = 1;
    for (let i = 1; i < 8; i += 1) {
      context.beginPath(); context.moveTo((width * i) / 8, 0); context.lineTo((width * i) / 8, height); context.stroke();
    }
    for (let i = 1; i < 5; i += 1) {
      context.beginPath(); context.moveTo(0, (height * i) / 5); context.lineTo(width, (height * i) / 5); context.stroke();
    }
    context.strokeStyle = '#233d3e';
    context.lineWidth = 3;
    context.beginPath();
    for (let px = 0; px <= width; px += 2) {
      const x = BOUNDS.minX + (px / width) * (BOUNDS.maxX - BOUNDS.minX);
      const y = surfaceHeight(x, sectionZ);
      const py = ((BOUNDS.top - y) / (BOUNDS.top - BOUNDS.bottom)) * height;
      if (px === 0) context.moveTo(px, py); else context.lineTo(px, py);
    }
    context.stroke();
    if (points.length > 1) {
      context.lineJoin = 'round'; context.lineCap = 'round';
      context.beginPath();
      points.forEach((point, index) => index === 0 ? context.moveTo(point.x * width, point.y * height) : context.lineTo(point.x * width, point.y * height));
      context.strokeStyle = '#fffdf4'; context.lineWidth = 6; context.stroke();
      context.strokeStyle = '#d24f3f'; context.lineWidth = 2.5; context.stroke();
    }
    context.fillStyle = '#153135'; context.font = '700 16px sans-serif';
    context.fillText('X', 10, 21); context.fillText('Y', width - 22, 21);
  }, [dip, points, sectionZ, showAnswer, strike]);

  useEffect(draw, [draw]);

  const pointFromEvent = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setPoints((current) => [...current, {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    }]);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <canvas
        ref={canvasRef}
        className="min-h-[190px] w-full flex-1 touch-none cursor-crosshair rounded-xl border border-[#2f4c4a]/15"
        aria-label="지층 경계를 직접 그릴 수 있는 X-Y 지질 단면도"
        onPointerDown={(event) => { setDrawing(true); setPoints([]); event.currentTarget.setPointerCapture(event.pointerId); pointFromEvent(event.clientX, event.clientY); }}
        onPointerMove={(event) => drawing && pointFromEvent(event.clientX, event.clientY)}
        onPointerUp={() => setDrawing(false)}
        onPointerCancel={() => setDrawing(false)}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[#61716d]">경계선을 그린 뒤 정답과 비교해 보세요.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPoints([])} aria-label="그린 선 지우기"><RotateCcw /> 지우기</Button>
          <Button size="sm" onClick={() => onShowAnswerChange(!showAnswer)}>{showAnswer ? '정답 숨기기' : '정답 보기'}</Button>
        </div>
      </div>
    </div>
  );
}
