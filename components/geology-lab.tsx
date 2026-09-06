'use client';

import { useMemo, useState } from 'react';
import { Layers3, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { CrossSection } from '@/components/cross-section';
import { GeologyMap } from '@/components/geology-map';
import { GeologyScene } from '@/components/geology-scene';
import {
  ROCK_SUITES,
  TERRAIN_PRESETS,
  formatDipDirection,
  formatStrike,
  layerBoundaries,
  layersForSuite,
  type RockSuite,
  type TerrainPreset,
} from '@/lib/geology';

type ParameterSliderProps = {
  label: string;
  valueLabel: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function ParameterSlider({ label, valueLabel, value, min, max, step, onChange }: ParameterSliderProps) {
  return (
    <label className="min-w-0 space-y-2">
      <span className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-600">
        <span>{label}</span><strong className="font-mono text-[10px] text-blue-700">{valueLabel}</strong>
      </span>
      <Slider value={value} min={min} max={max} step={step} onValueChange={onChange} aria-label={label} />
    </label>
  );
}

export function GeologyLab() {
  const [strike, setStrike] = useState(35);
  const [dip, setDip] = useState(32);
  const [layerCount, setLayerCount] = useState(5);
  const [layerSpacing, setLayerSpacing] = useState(0.63);
  const [rockSuite, setRockSuite] = useState<RockSuite>('mixed');
  const [sectionZ, setSectionZ] = useState(0.35);
  const [terrain, setTerrain] = useState<TerrainPreset>('ridge-valley');
  const layers = useMemo(() => layersForSuite(rockSuite, layerCount), [rockSuite, layerCount]);
  const boundaries = useMemo(() => layerBoundaries(layerCount, layerSpacing), [layerCount, layerSpacing]);

  return (
    <main className="flex min-h-dvh flex-col overflow-y-auto bg-[#f4f6f8] text-slate-900 lg:h-dvh lg:overflow-hidden">
      <header className="shrink-0 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-blue-600 shadow-sm"><Layers3 className="size-5" /></div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold tracking-[-0.03em]">지질 구조 시뮬레이터</p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Strata 3D · Model 01</p>
            </div>
          </div>
          <div className="flex max-w-[62vw] items-center gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1">
            <span className="hidden shrink-0 px-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-500 xl:inline">지형 유형</span>
            {TERRAIN_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                size="xs"
                variant={terrain === preset.id ? 'default' : 'ghost'}
                className={terrain === preset.id ? 'bg-blue-600 hover:bg-blue-600/90' : 'text-slate-600'}
                aria-pressed={terrain === preset.id}
                onClick={() => setTerrain(preset.id)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <section className="shrink-0 border-b border-slate-200 bg-white px-4 py-2.5 md:px-6">
        <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_.8fr_.9fr_1.5fr] lg:items-end">
          <ParameterSlider label="지층 방향(주향)" valueLabel={formatStrike(strike)} value={strike} min={0} max={179} step={1} onChange={setStrike} />
          <ParameterSlider label="지층 경사" valueLabel={`${dip}° ${formatDipDirection(strike)}`} value={dip} min={0} max={75} step={1} onChange={setDip} />
          <ParameterSlider label="지층 개수" valueLabel={`${layerCount}층`} value={layerCount} min={3} max={7} step={1} onChange={setLayerCount} />
          <ParameterSlider label="층 간격" valueLabel={`${Math.round(layerSpacing * 100)} m`} value={layerSpacing} min={0.35} max={0.9} step={0.05} onChange={setLayerSpacing} />
          <fieldset className="min-w-0 space-y-1.5">
            <legend className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600"><SlidersHorizontal className="size-3.5 text-blue-600" /> 암석 종류</legend>
            <div className="flex gap-1 overflow-x-auto">
              {ROCK_SUITES.map((suite) => (
                <Button
                  key={suite.id}
                  size="xs"
                  variant={rockSuite === suite.id ? 'default' : 'outline'}
                  className={rockSuite === suite.id ? 'bg-blue-600 hover:bg-blue-600/90' : ''}
                  aria-pressed={rockSuite === suite.id}
                  onClick={() => setRockSuite(suite.id)}
                >
                  {suite.label}
                </Button>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <div className="grid w-full gap-3 p-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,.85fr)] lg:p-4">
        <section className="min-h-0 min-w-0">
          <Card className="flex h-full min-h-0 flex-col border border-slate-200 bg-white py-3 shadow-sm ring-0">
            <CardHeader className="px-4 md:px-5">
              <div>
                <div className="mb-1 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600"><Sparkles className="size-3.5" /> 3D viewport</div>
                <CardTitle className="text-xl font-bold tracking-[-0.025em]">3D 지형</CardTitle>
              </div>
              <CardAction><Badge variant="outline" className="border-slate-200 bg-slate-50 font-mono text-[10px] text-slate-500">ORBIT · ZOOM</Badge></CardAction>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 px-3 md:px-4">
              <GeologyScene strike={strike} dip={dip} sectionZ={sectionZ} terrain={terrain} layers={layers} boundaries={boundaries} layerSpacing={layerSpacing} />
            </CardContent>
          </Card>
        </section>

        <aside className="grid min-h-0 min-w-0 gap-3 lg:grid-rows-2">
          <Card className="flex min-h-0 flex-col border border-slate-200 bg-white shadow-sm ring-0">
            <CardHeader className="border-b border-slate-100">
              <div><p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">Map view</p><CardTitle className="font-bold">지질 평면도</CardTitle></div>
              <CardAction><Badge variant="outline" className="border-slate-200 bg-slate-50 font-mono text-[10px] text-slate-500">DRAG X–Y</Badge></CardAction>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 px-3">
              <GeologyMap strike={strike} dip={dip} sectionZ={sectionZ} terrain={terrain} layers={layers} boundaries={boundaries} onSectionChange={setSectionZ} />
            </CardContent>
          </Card>

          <Card className="flex min-h-0 flex-col border border-slate-200 bg-white shadow-sm ring-0">
            <CardHeader className="border-b border-slate-100">
              <div><p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">Section view</p><CardTitle className="font-bold">X–Y 단면</CardTitle></div>
              <CardAction><span className="font-mono text-xs text-slate-500">Z {sectionZ.toFixed(1)}</span></CardAction>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 px-3">
              <CrossSection strike={strike} dip={dip} sectionZ={sectionZ} terrain={terrain} layers={layers} boundaries={boundaries} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
