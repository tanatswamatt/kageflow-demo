import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import Gallery from '@/components/Gallery';
import EnquiryForm from '@/components/EnquiryForm';
import FinanceCalc from '@/components/FinanceCalc';
import VehicleCard from '@/components/VehicleCard';
import { getPublicStock, getVehicleBySlug } from '@/lib/data';
import { imageUrl, sortedImages } from '@/lib/images';
import { formatKm, formatPrice } from '@/lib/money';
import { BODY_LABEL, DRIVE_LABEL, FUEL_LABEL, TRANS_LABEL } from '@/types/db';
import { SITE } from '@/lib/site';

export const revalidate = 30;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const v = await getVehicleBySlug((await params).slug);
  if (!v) return { title: 'Car not found' };
  return { title: `${v.year} ${v.make} ${v.model} ${v.variant ?? ''}`.trim(), description: v.description ?? undefined };
}

export default async function VehiclePage({ params }: Props) {
  const v = await getVehicleBySlug((await params).slug);
  if (!v) notFound();

  const urls = sortedImages(v).map((i) => imageUrl(i.storage_path));
  const name = `${v.year} ${v.make} ${v.model}`;
  const similar = (await getPublicStock()).filter((x) => x.id !== v.id && (x.body === v.body || x.make === v.make)).slice(0, 4);

  const specs: [string, string][] = [
    ['Year', String(v.year)],
    ['Mileage', formatKm(v.mileage_km)],
    ['Fuel', FUEL_LABEL[v.fuel]],
    ['Gearbox', TRANS_LABEL[v.transmission]],
    ['Body', BODY_LABEL[v.body]],
    ['Drive', v.drivetrain ? DRIVE_LABEL[v.drivetrain] : '—'],
    ['Colour', v.colour ?? '—'],
    ['Stock no.', v.stock_no ?? '—'],
  ];

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <nav className="mb-6 text-[13px]" style={{ color: 'var(--muted)' }} aria-label="Breadcrumb">
          <Link href="/inventory" className="hover:underline">Cars for sale</Link> <span aria-hidden>/</span> {v.make} <span aria-hidden>/</span> {v.model}
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0">
            <Gallery urls={urls} alt={name} body={v.body} />

            <div className="mt-8">
              <h2 className="display text-[22px]">Specifications</h2>
              <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] sm:grid-cols-4" style={{ background: 'var(--border)', border: '1px solid var(--border)' }}>
                {specs.map(([k, val]) => (
                  <div key={k} className="p-4" style={{ background: 'var(--surface-2)' }}>
                    <dt className="label !mb-1">{k}</dt>
                    <dd className="text-[15px] font-semibold">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {v.description && (
              <div className="mt-8">
                <h2 className="display text-[22px]">About this car</h2>
                <p className="mt-3 max-w-3xl whitespace-pre-line text-[15.5px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{v.description}</p>
              </div>
            )}

            {v.features.length > 0 && (
              <div className="mt-8">
                <h2 className="display text-[22px]">Features</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {v.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[14.5px]">
                      <span className="grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {v.price_zar && (
              <div className="mt-10">
                <h2 className="display text-[22px]">Finance estimate</h2>
                <p className="mb-4 mt-2 text-[14px]" style={{ color: 'var(--muted)' }}>Based on {formatPrice(v.price_zar)}.</p>
                <FinanceCalc price={Number(v.price_zar)} />
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="card mb-4 p-5 sm:p-6">
              <span className="chip mb-3" style={{ background: v.status === 'reserved' ? 'var(--amber)' : 'var(--green)', color: v.status === 'reserved' ? '#10151F' : '#fff' }}>
                {v.status === 'reserved' ? 'Reserved' : 'In stock'}
              </span>
              <h1 className="display text-[28px] leading-tight">{name}</h1>
              {v.variant && <p className="mt-1.5 text-[15px]" style={{ color: 'var(--text-2)' }}>{v.variant}</p>}
              <p className="display mt-5 text-[36px] leading-none">{formatPrice(v.price_zar)}</p>
              <p className="mt-2 text-[12.5px]" style={{ color: 'var(--muted)' }}>Price includes VAT. Licence and registration extra.</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="btn btn-ghost btn-sm">Call us</a>
                <a href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in the ${name} (${v.stock_no ?? v.slug}).`)}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ background: '#1F8A5A', color: '#fff' }}>WhatsApp</a>
              </div>
            </div>
            <EnquiryForm vehicleId={v.id} vehicleName={name} reservable={v.status === 'in_stock'} />
            {v.status === 'reserved' && (
              <p className="mt-3 text-[13px]" style={{ color: 'var(--muted)' }}>This car is reserved. Enquire and we&apos;ll let you know if it becomes available.</p>
            )}
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-20">
            <h2 className="display t-section mb-8">You might also like</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((s) => <VehicleCard key={s.id} v={s} />)}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
