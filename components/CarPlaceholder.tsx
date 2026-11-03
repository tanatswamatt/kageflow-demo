import type { BodyType } from '@/types/db';

/* Side-profile silhouettes shown until a car has photos. Stylised on purpose:
   they read as "photo coming", never as a picture of the actual car. */
const SHAPES: Record<'hatch' | 'sedan' | 'suv' | 'bakkie', { body: string; glass: string }> = {
  sedan: {
    body: 'M30 140 L40 118 Q60 108 100 104 L140 78 Q160 68 200 68 L250 70 Q275 72 300 98 L345 104 Q368 108 372 124 L372 140 Z',
    glass: 'M108 102 L144 80 Q160 72 198 72 L246 74 Q266 76 286 100 Z',
  },
  hatch: {
    body: 'M34 140 L40 116 Q56 106 96 102 L136 72 Q150 64 190 64 L262 66 Q284 68 296 92 L328 108 Q350 112 352 128 L352 140 Z',
    glass: 'M104 100 L140 74 Q152 68 188 68 L258 70 Q276 72 286 98 Z',
  },
  suv: {
    body: 'M30 142 L34 112 Q40 100 80 98 L120 64 Q132 56 170 56 L300 58 Q318 58 330 80 L356 100 Q372 104 372 120 L372 142 Z',
    glass: 'M90 96 L124 66 Q134 60 168 60 L296 62 Q310 62 320 82 L330 96 Z',
  },
  bakkie: {
    body: 'M28 142 L32 112 Q38 100 78 98 L114 64 Q124 58 156 58 L218 58 Q228 58 230 70 L232 98 L372 98 L374 142 Z',
    glass: 'M88 96 L118 66 Q126 62 154 62 L214 62 Q222 62 222 72 L222 96 Z',
  },
};

const pick = (b: BodyType) => (b === 'bakkie' ? 'bakkie' : b === 'suv' || b === 'mpv' ? 'suv' : b === 'hatchback' ? 'hatch' : 'sedan');

export default function CarPlaceholder({ body, label = 'Photos coming soon' }: { body: BodyType; label?: string }) {
  const s = SHAPES[pick(body)];
  const rearWheel = pick(body) === 'hatch' ? 288 : 300;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(160deg, #EFEBE3 0%, #E3DED3 100%)' }}>
      <svg viewBox="0 0 400 180" className="w-[72%]" aria-hidden>
        <ellipse cx="200" cy="168" rx="170" ry="7" fill="rgba(16,21,31,0.10)" />
        <path d={s.body} fill="#C9C2B4" />
        <path d={s.glass} fill="#E9E5DD" />
        {[100, rearWheel].map((x) => (
          <g key={x}>
            <circle cx={x} cy="142" r="25" fill="#10151F" />
            <circle cx={x} cy="142" r="11" fill="#8B94A6" />
          </g>
        ))}
      </svg>
      <span className="mt-1 text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: '#7A7466' }}>{label}</span>
    </div>
  );
}
