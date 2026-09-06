import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: '지질 구조 시뮬레이터 | STRATA 3D',
  description: '다층 3D 지질 구조와 주향·경사, 지질 단면을 실시간으로 시뮬레이션합니다.',
  openGraph: {
    title: '지질 구조 시뮬레이터',
    description: 'STRATA 3D',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: '지질 구조 시뮬레이터 STRATA 3D' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '지질 구조 시뮬레이터',
    description: 'STRATA 3D',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
