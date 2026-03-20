'use client';

import dynamic from 'next/dynamic';

const WorldMap = dynamic(() => import('./WorldMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#4FC3F7',
      color: '#4E342E',
      fontFamily: 'sans-serif',
      fontSize: '1.1rem',
      fontWeight: 600,
    }}>
      Loading map…
    </div>
  ),
});

export default function WorldMapClient({ lang }: { lang: string }) {
  return <WorldMap lang={lang} />;
}
