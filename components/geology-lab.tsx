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
          <div className="hidden items-center gap-2 sm:flex">
            <Badge variant="outline" className="border-slate-200 bg-white text-slate-500">LOCAL MODEL</Badge>
            <Badge className="bg-blue-50 text-blue-700">LIVE</Badge>
          </div>
        </div>
      </header>

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
              <GeologyScene strike={strike} dip={dip} sectionZ={sectionZ} />
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
              <GeologyMap strike={strike} dip={dip} sectionZ={sectionZ} onSectionChange={setSectionZ} />
            </CardContent>
          </Card>

          <Card className="flex min-h-0 flex-col border border-slate-200 bg-white shadow-sm ring-0">
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
