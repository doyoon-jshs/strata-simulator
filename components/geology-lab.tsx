'use client';

import { useMemo, useState } from 'react';
import { Layers3, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrossSection } from '@/components/cross-section';
import { GeologyMap } from '@/components/geology-map';
import { GeologyScene } from '@/components/geology-scene';
import {
  ROCK_SUITES,
  STRUCTURE_PRESETS,
  TERRAIN_PRESETS,
  formatDipDirection,
  formatStrike,
  layerBoundaries,
  layersForSuite,
  type GeologicStructure,
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
  const [structure, setStructure] = useState<GeologicStructure>('tilted');
  const [geologyOffset, setGeologyOffset] = useState(0);
  const [faultDip, setFaultDip] = useState(70);
  const [unconformityDip, setUnconformityDip] = useState(5);
  const layers = useMemo(() => layersForSuite(rockSuite, layerCount), [rockSuite, layerCount]);
  const boundaries = useMemo(() => layerBoundaries(layerCount, layerSpacing), [layerCount, layerSpacing]);
  const totalThickness = Math.round(layerCount * layerSpacing * 100);
  const hasStructureDip = structure === 'fault' || structure === 'unconformity';

  return (
    <main className="flex min-h-dvh flex-col overflow-y-auto bg-[#f4f6f8] text-slate-900 lg:h-dvh lg:overflow-hidden">
      <Tabs defaultValue="simulation" className="min-h-0 flex-1 gap-0">
        <header className="shrink-0 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-blue-600 shadow-sm"><Layers3 className="size-5" /></div>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold tracking-[-0.03em]">지질 구조 시뮬레이터</p>
                <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Strata 3D · Model 01</p>
              </div>
            </div>
            <TabsList aria-label="시뮬레이터 화면 선택" className="h-9">
              <TabsTrigger value="simulation" className="px-3"><Sparkles /> 시뮬레이션</TabsTrigger>
              <TabsTrigger value="column" className="px-3"><Layers3 /> 지질 주상도</TabsTrigger>
            </TabsList>
          </div>
        </header>

        <TabsContent value="simulation" keepMounted className="flex min-h-0 flex-1 flex-col data-[hidden]:hidden">
          <section className="shrink-0 border-b border-slate-200 bg-white px-4 py-2.5 md:px-6">
            <div className={`grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 lg:items-end ${hasStructureDip ? 'xl:grid-cols-6' : 'xl:grid-cols-5'}`}>
              <ParameterSlider label="지층 방향(주향)" valueLabel={formatStrike(strike)} value={strike} min={0} max={179} step={1} onChange={setStrike} />
              <ParameterSlider label="지층 경사" valueLabel={`${dip}° ${formatDipDirection(strike)}`} value={dip} min={0} max={75} step={1} onChange={setDip} />
              <ParameterSlider
                label="지질 위치 오프셋"
                valueLabel={`${geologyOffset > 0 ? '+' : ''}${Math.round(geologyOffset * 100)} m`}
                value={geologyOffset}
                min={-1.8}
                max={1.8}
                step={0.05}
                onChange={setGeologyOffset}
              />
              {structure === 'fault' && (
                <ParameterSlider label="단층면 경사" valueLabel={`${faultDip}°`} value={faultDip} min={35} max={90} step={1} onChange={setFaultDip} />
              )}
              {structure === 'unconformity' && (
                <ParameterSlider label="부정합면 경사" valueLabel={`${unconformityDip}°`} value={unconformityDip} min={0} max={25} step={1} onChange={setUnconformityDip} />
              )}
              <fieldset className="min-w-0 space-y-1.5">
                <legend className="text-[11px] font-semibold text-slate-600">지질 구조</legend>
                <div className="flex gap-1 overflow-x-auto">
                  {STRUCTURE_PRESETS.map((preset) => (
                    <Button
                      key={preset.id}
                      size="xs"
                      variant={structure === preset.id ? 'default' : 'outline'}
                      className={structure === preset.id ? 'bg-slate-800 hover:bg-slate-700' : ''}
                      aria-pressed={structure === preset.id}
                      onClick={() => setStructure(preset.id)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </fieldset>
              <fieldset className={`min-w-0 space-y-1.5 sm:col-span-2 ${hasStructureDip ? 'lg:col-span-1' : 'lg:col-span-2'} xl:col-span-1`}>
                <legend className="text-[11px] font-semibold text-slate-600">지형 유형</legend>
                <div className="flex gap-1 overflow-x-auto">
                  {TERRAIN_PRESETS.map((preset) => (
                    <Button
                      key={preset.id}
                      size="xs"
                      variant={terrain === preset.id ? 'default' : 'outline'}
                      className={terrain === preset.id ? 'bg-blue-600 hover:bg-blue-600/90' : ''}
                      aria-pressed={terrain === preset.id}
                      onClick={() => setTerrain(preset.id)}
                    >
                      {preset.label}
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
                  <GeologyScene strike={strike} dip={dip} sectionZ={sectionZ} terrain={terrain} structure={structure} geologyOffset={geologyOffset} faultDip={faultDip} unconformityDip={unconformityDip} layers={layers} boundaries={boundaries} />
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
                  <GeologyMap strike={strike} dip={dip} sectionZ={sectionZ} terrain={terrain} structure={structure} geologyOffset={geologyOffset} faultDip={faultDip} unconformityDip={unconformityDip} layers={layers} boundaries={boundaries} onSectionChange={setSectionZ} />
                </CardContent>
              </Card>

              <Card className="flex min-h-0 flex-col border border-slate-200 bg-white shadow-sm ring-0">
                <CardHeader className="border-b border-slate-100">
                  <div><p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">Section view</p><CardTitle className="font-bold">X–Y 단면</CardTitle></div>
                  <CardAction><span className="font-mono text-xs text-slate-500">Z {sectionZ.toFixed(1)}</span></CardAction>
                </CardHeader>
                <CardContent className="min-h-0 flex-1 px-3">
                  <CrossSection strike={strike} dip={dip} sectionZ={sectionZ} terrain={terrain} structure={structure} geologyOffset={geologyOffset} faultDip={faultDip} unconformityDip={unconformityDip} layers={layers} boundaries={boundaries} />
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="column" className="flex min-h-0 flex-1 overflow-y-auto p-3 lg:p-5">
          <div className="mx-auto grid h-full min-h-[600px] w-full max-w-6xl gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(320px,.75fr)_minmax(460px,1.25fr)]">
            <Card className="flex min-h-0 flex-col border border-slate-200 bg-white shadow-sm ring-0">
              <CardHeader className="border-b border-slate-100">
                <div><p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">Column settings</p><CardTitle className="font-bold">지층 구성</CardTitle></div>
                <CardAction><SlidersHorizontal className="size-4 text-slate-400" /></CardAction>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-8 px-5 py-6">
                <ParameterSlider label="지층 개수" valueLabel={`${layerCount}층`} value={layerCount} min={3} max={7} step={1} onChange={setLayerCount} />
                <ParameterSlider label="각 지층의 두께" valueLabel={`${Math.round(layerSpacing * 100)} m`} value={layerSpacing} min={0.35} max={0.9} step={0.05} onChange={setLayerSpacing} />

                <fieldset className="space-y-3">
                  <legend className="text-sm font-semibold text-slate-700">암석 구성</legend>
                  <div className="grid gap-2">
                    {ROCK_SUITES.map((suite) => {
                      const previewLayers = layersForSuite(suite.id, layerCount);
                      const selected = rockSuite === suite.id;
                      return (
                        <Button
                          key={suite.id}
                          variant="outline"
                          className={`h-auto justify-start gap-3 px-3 py-3 text-left ${selected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100 hover:bg-blue-50' : ''}`}
                          aria-pressed={selected}
                          onClick={() => setRockSuite(suite.id)}
                        >
                          <span className="flex shrink-0 overflow-hidden rounded border border-white shadow-sm">
                            {previewLayers.map((layer) => <i key={layer.short} className="h-8 w-3" style={{ backgroundColor: layer.color }} />)}
                          </span>
                          <span className="min-w-0">
                            <strong className="block text-sm text-slate-800">{suite.label}</strong>
                            <span className="block truncate text-[10px] font-normal text-slate-500">{previewLayers.map((layer) => layer.name.replace(` ${layer.short}`, '')).join(' · ')}</span>
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                  총 두께 <strong className="font-mono text-slate-900">{totalThickness} m</strong> · 설정한 지층 구성은 시뮬레이션의 3D 모델, 평면도, 단면도에 동시에 적용됩니다.
                </div>
              </CardContent>
            </Card>

            <Card className="flex min-h-0 flex-col border border-slate-200 bg-white shadow-sm ring-0">
              <CardHeader className="border-b border-slate-100">
                <div><p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">Stratigraphic column</p><CardTitle className="font-bold">지질 주상도 미리보기</CardTitle></div>
                <CardAction><Badge variant="outline" className="font-mono text-[10px]">{layerCount} LAYERS · {totalThickness} m</Badge></CardAction>
              </CardHeader>
              <CardContent className="grid min-h-0 flex-1 grid-cols-[70px_minmax(240px,360px)] justify-center gap-3 px-5 py-6">
                <div className="flex min-h-[430px] flex-col items-end justify-between py-0.5 font-mono text-[10px] text-slate-500">
                  <span>0 m</span>
                  {layers.slice(1).map((layer, index) => <span key={layer.short}>{Math.round((index + 1) * layerSpacing * 100)} m</span>)}
                  <span>{totalThickness} m</span>
                </div>
                <div className="flex min-h-[430px] flex-col overflow-hidden rounded-lg border-2 border-slate-300 bg-white shadow-inner">
                  {layers.map((layer, index) => (
                    <div
                      key={layer.short}
                      className="flex min-h-14 flex-1 items-center justify-between gap-4 border-b border-black/15 px-4 text-slate-900 last:border-b-0"
                      style={{ backgroundColor: layer.color }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 place-items-center rounded-md border border-black/10 bg-white/65 font-mono text-sm font-black">{layer.short}</span>
                        <div><strong className="block text-sm">{layer.name.replace(` ${layer.short}`, '')}</strong><span className="font-mono text-[10px] opacity-65">Layer {index + 1}</span></div>
                      </div>
                      <span className="rounded bg-white/65 px-2 py-1 font-mono text-[10px] font-bold">{Math.round(layerSpacing * 100)} m</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
