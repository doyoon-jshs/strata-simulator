import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: '지층 탐사실 | 3D 지질 가상실험',
  description: '다층 3D 지질 모형을 관찰하고 주향·경사와 지질 단면도를 연결하는 가상실험입니다.',
  openGraph: {
    title: '지층 탐사실',
    description: '3D 지질 가상실험',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: '지층 탐사실 3D 지질 가상실험' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '지층 탐사실',
    description: '3D 지질 가상실험',
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
