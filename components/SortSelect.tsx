'use client';
import { useRouter, useSearchParams } from 'next/navigation';

const OPTIONS = [
  { v: '', l: 'Newest listings' },
  { v: 'lo', l: 'Price: low to high' },
  { v: 'hi', l: 'Price: high to low' },
  { v: 'km', l: 'Lowest mileage' },
  { v: 'year', l: 'Newest year' },
];

export default function SortSelect() {
  const router = useRouter();
  const sp = useSearchParams();
  return (
    <label className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--muted)' }}>
      Sort
      <select
        className="field !w-auto !py-2"
        value={sp.get('sort') ?? ''}
        onChange={(e) => {
          const next = new URLSearchParams(sp.toString());
          if (e.target.value) next.set('sort', e.target.value);
          else next.delete('sort');
          router.push(`/inventory?${next.toString()}`, { scroll: false });
        }}
      >
        {OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}
