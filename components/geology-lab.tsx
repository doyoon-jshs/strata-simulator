'use client';

import { useState } from 'react';
import { Compass, Layers3, Scissors, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Clinometer, type ClinometerResult } from '@/components/clinometer';
import { CrossSection } from '@/components/cross-section';
import { GeologyMap } from '@/components/geology-map';
import { GeologyScene } from '@/components/geology-scene';
import { LAYERS, formatDipDirection, formatStrike } from '@/lib/geology';

export function GeologyLab() {
  const [strike, setStrike] = useState(35);
  const [dip, setDip] = useState(32);
  const [sectionZ, setSectionZ] = useState(0.35);
  const [showSlice, setShowSlice] = useState(true);
  const [showAnswer, setShowAnswer] = useState(true);
  const [measurement, setMeasurement] = useState<ClinometerResult | null>(null);

  return (
    <main className="min-h-screen bg-[#e9e6dc] text-[#173335]">
      <header className="border-b border-[#173335]/10 bg-[#f8f4e9]/95 px-4 py-3 backdrop-blur md:px-7">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#173b3c] text-[#f0ce75] shadow-sm"><Layers3 className="size-5" /></div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold tracking-[-0.03em]">지층 탐사실</p>
              <p className="truncate text-xs text-[#66736f]">주향·경사에서 지질 단면도까지</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Badge variant="outline" className="border-[#173335]/15 bg-white/50 text-[#536561]">가상실험</Badge>
            <Badge className="bg-[#d9eedb] text-[#28543b]">다층 모형</Badge>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(380px,.8fr)] lg:p-6">
        <section className="flex min-w-0 flex-col gap-4">
          <Card className="border-0 bg-[#f8f4e9] py-3 shadow-[0_18px_50px_rgba(35,52,50,.10)] ring-[#173335]/8">
            <CardHeader className="px-4 md:px-5">
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#ba6b45]"><Sparkles className="size-3.5" /> 실시간 3D 지질 블록</div>
                <CardTitle className="text-xl font-bold tracking-[-0.025em]">지형 아래 지층을 관찰하세요</CardTitle>
              </div>
              <CardAction>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Clinometer strike={strike} dip={dip} onComplete={setMeasurement} />
                  <div className="flex items-center gap-2 rounded-full bg-[#e7e2d5] px-3 py-2 text-xs font-medium text-[#51625e]">
                    <Scissors className="size-3.5" /> 절단면
                    <Switch checked={showSlice} onCheckedChange={setShowSlice} aria-label="3D 절단면 표시" />
                  </div>
                </div>
              </CardAction>
            </CardHeader>
            <CardContent className="px-3 md:px-4">
              <GeologyScene strike={strike} dip={dip} sectionZ={sectionZ} showSlice={showSlice} />
              {measurement && (
                <div className="mx-1 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#2c6840]/15 bg-[#dcecd8] px-3 py-2 text-xs text-[#315c3f]">
                  <span className="font-semibold">노두 A 측정 완료</span>
                  <strong className="font-mono">{formatStrike(measurement.strike)}, {measurement.dip}°{measurement.direction}</strong>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-[#f8f4e9] shadow-sm ring-[#173335]/8">
            <CardContent className="grid gap-5 md:grid-cols-[1fr_1fr_auto] md:items-center">
              <label className="space-y-3">
                <span className="flex items-center justify-between text-sm font-semibold">
                  <span className="flex items-center gap-2"><Compass className="size-4 text-[#bb704d]" /> 주향</span>
                  <strong className="rounded-md bg-[#e6dfcf] px-2 py-1 font-mono text-xs">{formatStrike(strike)}</strong>
                </span>
                <Slider min={0} max={179} step={1} value={[strike]} onValueChange={(value) => { setStrike(value[0]); setMeasurement(null); }} aria-label="주향 조절" />
              </label>
              <label className="space-y-3">
                <span className="flex items-center justify-between text-sm font-semibold">
                  <span className="flex items-center gap-2"><Scissors className="size-4 rotate-45 text-[#bb704d]" /> 경사</span>
                  <strong className="rounded-md bg-[#e6dfcf] px-2 py-1 font-mono text-xs">{dip}°{formatDipDirection(strike)}</strong>
                </span>
                <Slider min={10} max={65} step={1} value={[dip]} onValueChange={(value) => { setDip(value[0]); setMeasurement(null); }} aria-label="경사각 조절" />
              </label>
              <div className="flex flex-wrap justify-center gap-2 md:max-w-[170px]">
                {LAYERS.map((layer) => (
                  <span key={layer.short} className="flex items-center gap-1.5 text-[11px] font-medium text-[#50615e]">
                    <i className="size-2.5 rounded-sm" style={{ backgroundColor: layer.color }} />{layer.short}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="grid min-w-0 gap-4 lg:grid-rows-[minmax(310px,.9fr)_minmax(330px,1.1fr)]">
          <Card className="border-0 bg-[#f8f4e9] shadow-sm ring-[#173335]/8">
            <CardHeader className="border-b border-[#173335]/8">
              <div><p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#bb704d]">Plan view</p><CardTitle className="font-bold">지질도</CardTitle></div>
              <CardAction><Badge variant="outline">X–Y선을 드래그</Badge></CardAction>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 px-3">
              <GeologyMap strike={strike} dip={dip} sectionZ={sectionZ} onSectionChange={setSectionZ} />
            </CardContent>
          </Card>

          <Card className="border-0 bg-[#f8f4e9] shadow-sm ring-[#173335]/8">
            <CardHeader className="border-b border-[#173335]/8">
              <div><p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#bb704d]">Section view</p><CardTitle className="font-bold">X–Y 지질 단면도</CardTitle></div>
              <CardAction><span className="font-mono text-xs text-[#687570]">위치 {sectionZ.toFixed(1)}</span></CardAction>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 px-3">
              <CrossSection strike={strike} dip={dip} sectionZ={sectionZ} showAnswer={showAnswer} onShowAnswerChange={setShowAnswer} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
