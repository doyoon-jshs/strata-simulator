'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronRight, Compass, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { formatDipDirection, formatStrike } from '@/lib/geology';

export type ClinometerResult = {
  strike: number;
  dip: number;
  direction: string;
};

type Props = {
  strike: number;
  dip: number;
  onComplete: (result: ClinometerResult) => void;
};

const DIRECTIONS = ['NE', 'SE', 'SW', 'NW'];

function strikeDelta(value: number, target: number) {
  return ((((value - target + 90) % 180) + 180) % 180) - 90;
}

function BubbleLevel({ error }: { error: number }) {
  const position = Math.max(-86, Math.min(86, error * 4.4));
  const aligned = Math.abs(error) <= 2;
  return (
    <div className="space-y-2">
      <div className="relative mx-auto h-9 w-[220px] overflow-hidden rounded-full border-2 border-[#30565a] bg-[#d9c765]/80 shadow-inner">
        <span className="absolute inset-y-0 left-1/2 w-px bg-[#213d40]/45" />
        <span className="absolute inset-y-1 left-[calc(50%-18px)] w-px bg-[#213d40]/45" />
        <span className="absolute inset-y-1 left-[calc(50%+18px)] w-px bg-[#213d40]/45" />
        <span
          className={`absolute left-1/2 top-1/2 h-6 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-200 ${aligned ? 'border-[#174b37] bg-[#77cf88]/75 shadow-[0_0_16px_rgba(97,195,119,.7)]' : 'border-white/75 bg-white/30'}`}
          style={{ marginLeft: position }}
        />
      </div>
      <p className={`text-center text-xs font-semibold ${aligned ? 'text-[#2b6a43]' : 'text-[#72766c]'}`}>
        {aligned ? '기포가 중앙에 맞았습니다' : '기기를 움직여 기포를 중앙에 맞추세요'}
      </p>
    </div>
  );
}

function CompassDial({ heading }: { heading: number }) {
  return (
    <div className="relative mx-auto aspect-square w-[min(250px,64vw)] rounded-full border-[10px] border-[#c8b38a] bg-[#f5ecd9] shadow-[0_18px_35px_rgba(24,49,51,.18),inset_0_0_0_2px_#37575a]">
      <div className="absolute inset-3 rounded-full opacity-45 [background:repeating-conic-gradient(from_-1deg,#244649_0deg_1deg,transparent_1deg_10deg)]" />
      <div className="absolute inset-7 rounded-full bg-[#f7f0df] shadow-[inset_0_0_24px_rgba(58,79,75,.12)]" />
      <span className="absolute left-1/2 top-2 -translate-x-1/2 text-sm font-black text-[#ba6044]">N</span>
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-black">S</span>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-black">E</span>
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-black">W</span>
      <div className="absolute left-1/2 top-1/2 h-[78%] w-5 -translate-x-1/2 -translate-y-1/2 transition-transform duration-150" style={{ transform: `translate(-50%, -50%) rotate(${heading}deg)` }}>
        <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-[#c45f43]" />
        <span className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-full bg-[#244649]" />
      </div>
      <span className="absolute left-1/2 top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#f7f0df] bg-[#244649] shadow" />
    </div>
  );
}

function DipDial({ angle }: { angle: number }) {
  return (
    <div className="relative mx-auto h-[210px] w-[min(330px,78vw)] overflow-hidden rounded-2xl border border-[#31575a]/20 bg-[#efe5cf] shadow-inner">
      <div className="absolute bottom-7 left-1/2 size-[250px] -translate-x-1/2 rounded-full border-2 border-[#31575a]/30 [background:repeating-conic-gradient(from_270deg,#31575a_0deg_1deg,transparent_1deg_10deg)] opacity-65" />
      <div className="absolute bottom-7 left-1/2 size-[190px] -translate-x-1/2 rounded-full bg-[#efe5cf]" />
      <div className="absolute bottom-7 left-1/2 h-1.5 w-[78%] -translate-x-1/2 rounded-full bg-[#294d50]" />
      <div className="absolute bottom-7 left-1/2 h-[118px] w-3 origin-bottom -translate-x-1/2 rounded-full transition-transform duration-150" style={{ transform: `translateX(-50%) rotate(${angle - 90}deg)` }}>
        <span className="absolute inset-0 rounded-full bg-[#c45f43]" />
        <span className="absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[8px] border-b-[14px] border-x-transparent border-b-[#c45f43]" />
      </div>
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#294d50] px-3 py-1 font-mono text-xs font-bold text-[#fff6dc]">{angle}°</span>
      <span className="absolute bottom-10 left-3 text-[11px] font-bold text-[#6c746e]">0°</span>
      <span className="absolute right-3 top-4 text-[11px] font-bold text-[#6c746e]">90°</span>
    </div>
  );
}

export function Clinometer({ strike, dip, onComplete }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [heading, setHeading] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [direction, setDirection] = useState('');
  const headingError = strikeDelta(heading, strike);
  const dipError = tilt - dip;
  const expectedDirection = formatDipDirection(strike);
  const strikeAligned = Math.abs(headingError) <= 2;
  const dipAligned = Math.abs(dipError) <= 2 && direction === expectedDirection;

  const progressLabel = useMemo(() => {
    if (step === 1) return '1 · 주향 측정';
    if (step === 2) return '2 · 경사 측정';
    return '3 · 측정 완료';
  }, [step]);

  const reset = () => {
    setStep(1);
    setHeading(0);
    setTilt(0);
    setDirection('');
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (next) reset(); }}>
      <DialogTrigger render={<Button size="sm" className="bg-[#c56b49] text-white hover:bg-[#aa583b]" />}>
        <Compass /> 클리노미터 측정
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-0 bg-[#f8f4e9] p-0 sm:max-w-[680px]">
        <DialogHeader className="border-b border-[#173335]/10 px-5 pb-4 pt-5">
          <div className="mb-1 flex items-center gap-2 text-xs font-bold text-[#ba6b45]"><Compass className="size-4" /> {progressLabel}</div>
          <DialogTitle className="text-xl font-bold tracking-[-0.03em]">
            {step === 1 && '지층의 주향을 측정하세요'}
            {step === 2 && '지층의 경사를 측정하세요'}
            {step === 3 && '측정값을 확인하세요'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && '클리노미터를 지층면에 수평으로 놓고 긴 변이 주향선과 나란해지도록 회전합니다.'}
            {step === 2 && '긴 변을 주향선에 직각으로 세운 뒤 경사추의 기포를 맞추고 경사 방향을 선택합니다.'}
            {step === 3 && '측정한 값을 야외 조사 기록 형식으로 저장합니다.'}
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4">
          {step === 1 && (
            <div className="grid items-center gap-5 md:grid-cols-[1fr_250px]">
              <CompassDial heading={heading} />
              <div className="space-y-5">
                <BubbleLevel error={headingError} />
                <label className="block space-y-3">
                  <span className="flex items-center justify-between text-sm font-semibold"><span>기기 회전</span><strong className="rounded-md bg-[#e7dfce] px-2 py-1 font-mono text-xs">{formatStrike(heading)}</strong></span>
                  <Slider min={0} max={179} step={1} value={[heading]} onValueChange={(value) => setHeading(value[0])} aria-label="클리노미터 주향 회전" />
                </label>
                <p className="rounded-xl bg-[#eae4d6] p-3 text-xs leading-relaxed text-[#5b6965]">힌트: 기포가 두 기준선 사이에 들어오면 수평입니다.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid items-center gap-5 md:grid-cols-[1fr_250px]">
              <DipDial angle={tilt} />
              <div className="space-y-5">
                <BubbleLevel error={dipError} />
                <label className="block space-y-3">
                  <span className="flex items-center justify-between text-sm font-semibold"><span>기기 기울기</span><strong className="rounded-md bg-[#e7dfce] px-2 py-1 font-mono text-xs">{tilt}°</strong></span>
                  <Slider min={0} max={90} step={1} value={[tilt]} onValueChange={(value) => setTilt(value[0])} aria-label="클리노미터 경사각 조절" />
                </label>
                <fieldset className="space-y-2">
                  <legend className="text-xs font-semibold text-[#596965]">낮아지는 경사 방향</legend>
                  <div className="grid grid-cols-4 gap-1.5">
                    {DIRECTIONS.map((value) => (
                      <Button key={value} type="button" size="sm" variant={direction === value ? 'default' : 'outline'} onClick={() => setDirection(value)}>{value}</Button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-4 text-center">
              <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-[#dcecd8] text-[#2c6840]"><Check className="size-8" /></div>
              <p className="text-sm text-[#697570]">노두 A 측정 결과</p>
              <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#173b3c]">{formatStrike(heading)}, {tilt}°{direction}</p>
              <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 text-left">
                <div className="rounded-xl bg-[#ece5d6] p-4"><p className="text-xs text-[#6b756f]">주향</p><p className="mt-1 font-mono font-bold">{formatStrike(heading)}</p></div>
                <div className="rounded-xl bg-[#ece5d6] p-4"><p className="text-xs text-[#6b756f]">경사</p><p className="mt-1 font-mono font-bold">{tilt}°{direction}</p></div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <Button variant="ghost" onClick={reset}><RotateCcw /> 처음부터</Button>
          {step === 1 && <Button disabled={!strikeAligned} onClick={() => setStep(2)}>주향 기록 <ChevronRight /></Button>}
          {step === 2 && <Button disabled={!dipAligned} onClick={() => setStep(3)}>경사 기록 <ChevronRight /></Button>}
          {step === 3 && <Button onClick={() => { onComplete({ strike: heading, dip: tilt, direction }); setOpen(false); }}>측정 결과 저장 <Check /></Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
