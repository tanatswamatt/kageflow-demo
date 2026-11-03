'use client';

import { useState } from 'react';
import type { BodyType } from '@/types/db';
import CarPlaceholder from './CarPlaceholder';

export default function Gallery({ urls, alt, body }: { urls: string[]; alt: string; body: BodyType }) {
  const [i, setI] = useState(0);
  if (!urls.length) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-[14px]">
        <CarPlaceholder body={body} label="Photos coming soon — ask us for more" />
      </div>
    );
  }
  const go = (d: number) => setI((n) => (n + d + urls.length) % urls.length);
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[14px]" style={{ background: 'var(--surface-3)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urls[i]} alt={`${alt} — photo ${i + 1} of ${urls.length}`} className="absolute inset-0 h-full w-full object-cover" />
        {urls.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-[18px]" style={{ background: 'rgba(16,21,31,0.7)', color: '#fff' }}>‹</button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-[18px]" style={{ background: 'rgba(16,21,31,0.7)', color: '#fff' }}>›</button>
            <span className="chip absolute bottom-3 right-3 normal-case tracking-normal" style={{ background: 'rgba(16,21,31,0.72)', color: '#fff' }}>{i + 1} / {urls.length}</span>
          </>
        )}
      </div>
      {urls.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {urls.map((u, n) => (
            <button key={u} type="button" onClick={() => setI(n)} aria-label={`Show photo ${n + 1}`}
              className="relative aspect-[4/3] overflow-hidden rounded-[8px]" style={{ outline: n === i ? '2px solid var(--amber)' : 'none', outlineOffset: 2 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
