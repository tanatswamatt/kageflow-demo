import Link from 'next/link';
import { Suspense } from 'react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import VehicleCard from '@/components/VehicleCard';
import SortSelect from '@/components/SortSelect';
import { getPublicStock, matches, sortStock, type Filters } from '@/lib/data';
import { BODY_LABEL, FUEL_LABEL, TRANS_LABEL } from '@/types/db';
import { PRICE_BANDS } from '@/lib/money';

export const revalidate = 30;
export const metadata = { title: 'Cars for sale' };

const YEAR_FLOORS = [2023, 2021, 2019, 2015];
const KEYS: (keyof Filters)[] = ['q', 'make', 'body', 'fuel', 'trans', 'year', 'max', 'sort'];

type Facet = { value: string; label: string; count: number };

function hrefWith(sp: Filters, key: keyof Filters, value: string | undefined) {
  const p = new URLSearchParams();
  for (const k of KEYS) {
    const v = k === key ? value : sp[k];
    if (v) p.set(k, v);
  }
  const s = p.toString();
  return s ? `/inventory?${s}` : '/inventory';
}

function Group({ title, name, facets, sp }: { title: string; name: keyof Filters; facets: Facet[]; sp: Filters }) {
  if (!facets.length) return null;
  const active = sp[name];
  return (
    <div className="border-t py-5" style={{ borderColor: 'var(--border)' }}>
      <p className="label">{title}</p>
      <ul className="space-y-0.5">
        {facets.map((f) => {
          const on = active === f.value;
          return (
            <li key={f.value}>
              <Link
                href={hrefWith(sp, name, on ? undefined : f.value)}
                scroll={false}
                aria-current={on ? 'true' : undefined}
                className="flex items-center justify-between rounded-[6px] px-2.5 py-1.5 text-[14px]"
                style={{
                  background: on ? 'var(--text)' : 'transparent',
                  color: on ? 'var(--surface)' : f.count ? 'var(--text-2)' : 'var(--border-strong)',
                  fontWeight: on ? 700 : 500,
                }}
              >
                <span>{f.label}</span>
                <span className="text-[12px]" style={{ opacity: 0.7 }}>{on ? '✕' : f.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default async function InventoryPage({ searchParams }: { searchParams: Promise<Filters> }) {
  const sp = await searchParams;
  const stock = await getPublicStock();
  const results = sortStock(stock.filter((v) => matches(v, sp)), sp.sort);
  const count = (skip: keyof Filters, test: (v: (typeof stock)[number]) => boolean) =>
    stock.filter((v) => matches(v, sp, skip) && test(v)).length;

  const makes: Facet[] = [...new Set(stock.map((v) => v.make))].sort().map((m) => ({ value: m, label: m, count: count('make', (v) => v.make === m) }));
  const bodies: Facet[] = Object.entries(BODY_LABEL).map(([value, label]) => ({ value, label, count: count('body', (v) => v.body === value) })).filter((f) => f.count || sp.body === f.value);
  const prices: Facet[] = PRICE_BANDS.map((b) => ({ ...b, count: count('max', (v) => v.price_zar !== null && Number(v.price_zar) <= Number(b.value)) }));
  const years: Facet[] = YEAR_FLOORS.map((y) => ({ value: String(y), label: `${y} & newer`, count: count('year', (v) => v.year >= y) }));
  const fuels: Facet[] = Object.entries(FUEL_LABEL).map(([value, label]) => ({ value, label, count: count('fuel', (v) => v.fuel === value) })).filter((f) => f.count || sp.fuel === f.value);
  const trans: Facet[] = Object.entries(TRANS_LABEL).map(([value, label]) => ({ value, label, count: count('trans', (v) => v.transmission === value) }));

  const activeCount = (['q', 'make', 'body', 'fuel', 'trans', 'year', 'max'] as const).filter((k) => sp[k]).length;

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-7xl px-5 pt-10 sm:px-8">
        <p className="eyebrow mb-3">Live stock</p>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h1 className="display t-section">Cars for sale</h1>
          <p className="text-[14px]" style={{ color: 'var(--muted)' }}>
            {results.length} of {stock.length} cars{activeCount ? ' match your filters' : ''}
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside aria-label="Filters">
            <form action="/inventory" className="pb-5">
              {KEYS.filter((k) => k !== 'q' && sp[k]).map((k) => <input key={k} type="hidden" name={k} value={sp[k]} />)}
              <label className="label" htmlFor="q">Search</label>
              <div className="flex gap-2">
                <input id="q" name="q" defaultValue={sp.q ?? ''} placeholder="e.g. Hilux, GTI" className="field" />
                <button className="btn btn-dark btn-sm" type="submit">Go</button>
              </div>
            </form>
            {/* Phones: filters folded away so the cars come first. Desktop: always open. */}
            <details className="card px-4 lg:hidden">
              <summary className="cursor-pointer py-3 text-[14px] font-semibold">Filters{activeCount ? ` (${activeCount} on)` : ''}</summary>
              <Group title="Make" name="make" facets={makes} sp={sp} />
              <Group title="Body type" name="body" facets={bodies} sp={sp} />
              <Group title="Budget" name="max" facets={prices} sp={sp} />
              <Group title="Year" name="year" facets={years} sp={sp} />
              <Group title="Fuel" name="fuel" facets={fuels} sp={sp} />
              <Group title="Gearbox" name="trans" facets={trans} sp={sp} />
              {activeCount > 0 && (
                <Link href={sp.sort ? `/inventory?sort=${sp.sort}` : '/inventory'} className="btn btn-ghost btn-sm mt-2 w-full">Clear all filters</Link>
              )}
              <div className="pb-4" />
            </details>
            <div className="hidden lg:block">
              <Group title="Make" name="make" facets={makes} sp={sp} />
              <Group title="Body type" name="body" facets={bodies} sp={sp} />
              <Group title="Budget" name="max" facets={prices} sp={sp} />
              <Group title="Year" name="year" facets={years} sp={sp} />
              <Group title="Fuel" name="fuel" facets={fuels} sp={sp} />
              <Group title="Gearbox" name="trans" facets={trans} sp={sp} />
              {activeCount > 0 && (
                <Link href={sp.sort ? `/inventory?sort=${sp.sort}` : '/inventory'} className="btn btn-ghost btn-sm mt-2 w-full">Clear all filters</Link>
              )}
            </div>
          </aside>

          <section aria-label="Results">
            <div className="mb-5 flex items-center justify-end">
              <Suspense><SortSelect /></Suspense>
            </div>
            {results.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((v) => <VehicleCard key={v.id} v={v} />)}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <h2 className="display text-[22px]">Nothing matches those filters</h2>
                <p className="mx-auto mt-3 max-w-md text-[14px]" style={{ color: 'var(--muted)' }}>
                  Try removing a filter, or tell us what you&apos;re looking for and we&apos;ll find it.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Link href="/inventory" className="btn btn-ghost">Clear filters</Link>
                  <Link href="/contact?topic=find" className="btn btn-dark">Find me a car</Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
