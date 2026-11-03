import Link from 'next/link';
import type { Vehicle } from '@/types/db';
import { FUEL_LABEL, TRANS_LABEL } from '@/types/db';
import { formatKm, formatPrice, monthlyInstalment } from '@/lib/money';
import { imageUrl, sortedImages } from '@/lib/images';
import CarPlaceholder from './CarPlaceholder';

const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  in_stock: { label: 'In stock', bg: 'var(--green)', fg: '#fff' },
  reserved: { label: 'Reserved', bg: 'var(--amber)', fg: '#10151F' },
};

/* Photo on top, text on white below, so every row lines up. The title link
   stretches over the whole card; the button sits above it as its own target. */
export default function VehicleCard({ v }: { v: Vehicle }) {
  const images = sortedImages(v);
  const img = images[0];
  const status = STATUS[v.status] ?? STATUS.in_stock;
  const href = `/vehicle/${v.slug}`;
  const pm = v.price_zar ? monthlyInstalment(Number(v.price_zar), 10, 12.75, 72) : null;
  const spec = [v.year, formatKm(v.mileage_km), FUEL_LABEL[v.fuel], TRANS_LABEL[v.transmission]].join('  ·  ');

  return (
    <article className="v-card card group relative flex h-full flex-col overflow-hidden hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: 'var(--surface-3)' }}>
        {img ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={imageUrl(img.storage_path)} alt={`${v.year} ${v.make} ${v.model}`} loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        ) : (
          <CarPlaceholder body={v.body} />
        )}
        <span className="chip absolute left-3 top-3" style={{ background: status.bg, color: status.fg }}>{status.label}</span>
        {images.length > 1 && (
          <span className="chip absolute right-3 top-3 normal-case tracking-normal" style={{ background: 'rgba(16,21,31,0.72)', color: '#fff' }}>
            {images.length} photos
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="display text-[17px] leading-tight">
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {v.year} {v.make} {v.model}
          </Link>
        </h3>
        {v.variant && <p className="mt-1 text-[13px]" style={{ color: 'var(--text-2)' }}>{v.variant}</p>}
        <p className="mt-2.5 text-[12.5px]" style={{ color: 'var(--muted)' }}>{spec}</p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-3.5 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <div className="min-w-0">
            <p className="display whitespace-nowrap text-[21px] leading-none">{formatPrice(v.price_zar)}</p>
            <p className="mt-1.5 whitespace-nowrap text-[11px] font-semibold" style={{ color: 'var(--muted)' }}>
              {pm ? `est. ${formatPrice(pm)} p/m` : 'Price on application'}
            </p>
          </div>
          <Link href={`${href}#enquire`} className="btn btn-dark btn-sm relative z-[1] min-w-[118px] flex-1">
            Enquire
          </Link>
        </div>
      </div>
    </article>
  );
}
