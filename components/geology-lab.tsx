'use client';

import { useState } from 'react';
import { Layers3, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CrossSection } from '@/components/cross-section';
import { GeologyMap } from '@/components/geology-map';
import { GeologyScene } from '@/components/geology-scene';

export function GeologyLab() {
  const strike = 35;
  const dip = 32;
  const [sectionZ, setSectionZ] = useState(0.35);

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-7">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-blue-600 shadow-sm"><Layers3 className="size-5" /></div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold tracking-[-0.03em]">지질 구조 시뮬레이터</p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Strata 3D · Model 01</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Badge variant="outline" className="border-slate-200 bg-white text-slate-500">LOCAL MODEL</Badge>
            <Badge className="bg-blue-50 text-blue-700">LIVE</Badge>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(380px,.8fr)] lg:p-6">
        <section className="flex min-w-0 flex-col gap-4">
          <Card className="border border-slate-200 bg-white py-3 shadow-sm ring-0">
            <CardHeader className="px-4 md:px-5">
              <div>
                <div className="mb-1 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600"><Sparkles className="size-3.5" /> 3D viewport</div>
                <CardTitle className="text-xl font-bold tracking-[-0.025em]">3D 지형</CardTitle>
              </div>
              <CardAction><Badge variant="outline" className="border-slate-200 bg-slate-50 font-mono text-[10px] text-slate-500">ORBIT · ZOOM</Badge></CardAction>
            </CardHeader>
            <CardContent className="px-3 md:px-4">
              <GeologyScene strike={strike} dip={dip} sectionZ={sectionZ} />
            </CardContent>
          </Card>
        </section>

        <aside className="grid min-w-0 gap-4 lg:grid-rows-[minmax(310px,.9fr)_minmax(330px,1.1fr)]">
          <Card className="border border-slate-200 bg-white shadow-sm ring-0">
            <CardHeader className="border-b border-slate-100">
              <div><p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">Map view</p><CardTitle className="font-bold">지질 평면도</CardTitle></div>
              <CardAction><Badge variant="outline" className="border-slate-200 bg-slate-50 font-mono text-[10px] text-slate-500">DRAG X–Y</Badge></CardAction>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 px-3">
              <GeologyMap strike={strike} dip={dip} sectionZ={sectionZ} onSectionChange={setSectionZ} />
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm ring-0">
            <CardHeader className="border-b border-slate-100">
              <div><p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">Section view</p><CardTitle className="font-bold">X–Y 단면</CardTitle></div>
              <CardAction><span className="font-mono text-xs text-slate-500">Z {sectionZ.toFixed(1)}</span></CardAction>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 px-3">
              <CrossSection strike={strike} dip={dip} sectionZ={sectionZ} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
