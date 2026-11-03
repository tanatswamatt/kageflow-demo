import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import VehicleCard from '@/components/VehicleCard';
import { getPublicStock } from '@/lib/data';
import { BODY_LABEL, type BodyType } from '@/types/db';
import { PRICE_BANDS } from '@/lib/money';
import { SITE } from '@/lib/site';

export const revalidate = 30;

const PROMISES = [
  { t: 'Inspected before it’s listed', d: 'Every car goes through a multi-point check and a road test. Anything we find is fixed or written on the listing.' },
  { t: 'The price on the screen', d: 'No hidden admin fees sprung on you at signing. You’ll see the full cost before you commit.' },
  { t: 'Finance with the major banks', d: 'We submit one application to several banks and bring you the best approval.' },
  { t: 'Trade-ins welcome', d: 'Bring your current car. We’ll value it on the spot and take it off what you owe.' },
];

export default async function Home() {
  const stock = await getPublicStock();
  const featured = [...stock.filter((v) => v.featured), ...stock.filter((v) => !v.featured)].slice(0, 8);
  const makes = [...new Set(stock.map((v) => v.make))].sort();
  const bodies = (Object.keys(BODY_LABEL) as BodyType[])
    .map((b) => ({ b, n: stock.filter((v) => v.body === b).length }))
    .filter((x) => x.n > 0);
  const from = stock.reduce<number | null>((m, v) => (v.price_zar && (m === null || Number(v.price_zar) < m) ? Number(v.price_zar) : m), null);

  return (
    <>
      <SiteNav />
      <main>
        {/* ── Hero ── */}
        <section className="on-dark relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(70% 90% at 85% 10%, rgba(232,163,61,0.20), transparent 60%), radial-gradient(50% 70% at 0% 100%, rgba(31,138,132,0.18), transparent 60%)' }}
          />
          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24">
            <p className="eyebrow mb-5">{SITE.city} · Pre-owned cars</p>
            <h1 className="display t-hero max-w-4xl">Your next car is already on our floor.</h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed" style={{ color: 'var(--text-2)' }}>
              {stock.length} inspected cars in stock right now. Every listing shows the real price, the real mileage and what&apos;s been done to it.
            </p>

            <form action="/inventory" className="mt-10 grid max-w-4xl gap-3 rounded-[14px] p-3 sm:grid-cols-[1fr_1fr_1fr_auto]" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <label className="sr-only" htmlFor="h-make">Make</label>
              <select id="h-make" name="make" className="field" defaultValue="">
                <option value="">Any make</option>
                {makes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <label className="sr-only" htmlFor="h-body">Body type</label>
              <select id="h-body" name="body" className="field" defaultValue="">
                <option value="">Any body type</option>
                {bodies.map(({ b }) => <option key={b} value={b}>{BODY_LABEL[b]}</option>)}
              </select>
              <label className="sr-only" htmlFor="h-max">Budget</label>
              <select id="h-max" name="max" className="field" defaultValue="">
                <option value="">Any budget</option>
                {PRICE_BANDS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <button className="btn btn-primary" type="submit">Search cars</button>
            </form>

            <dl className="mt-12 grid max-w-3xl grid-cols-3 gap-6">
              {[
                [String(stock.length), 'cars in stock'],
                [from ? `R ${Math.round(from / 1000)}k` : '—', 'starting price'],
                [String(makes.length), 'brands'],
              ].map(([n, l]) => (
                <div key={l} className="border-l pl-4" style={{ borderColor: 'var(--border-strong)' }}>
                  <dt className="display text-[30px]">{n}</dt>
                  <dd className="mt-1 text-[12px] uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Body types ── */}
        <section className="mx-auto max-w-7xl px-5 pt-14 sm:px-8">
          <div className="flex flex-wrap gap-2.5">
            {bodies.map(({ b, n }) => (
              <Link key={b} href={`/inventory?body=${b}`} className="card px-4 py-2.5 text-[13.5px] font-semibold hover:border-[var(--text)]">
                {BODY_LABEL[b]}s <span style={{ color: 'var(--muted)' }}>· {n}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured stock ── */}
        <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Fresh on the floor</p>
              <h2 className="display t-section">Featured cars</h2>
            </div>
            <Link href="/inventory" className="btn btn-ghost">See all {stock.length} cars</Link>
          </div>
          {featured.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((v) => <VehicleCard key={v.id} v={v} />)}
            </div>
          ) : (
            <p className="card p-10 text-center" style={{ color: 'var(--muted)' }}>New stock is on its way. Check back soon.</p>
          )}
        </section>

        {/* ── Promises ── */}
        <section className="on-dark mt-24">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <p className="eyebrow mb-3">Why buy here</p>
            <h2 className="display t-section max-w-2xl">Buying a used car shouldn&apos;t feel like a gamble.</h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PROMISES.map((p, i) => (
                <div key={p.t} className="card p-6">
                  <span className="display text-[13px]" style={{ color: 'var(--accent)' }}>0{i + 1}</span>
                  <h3 className="display mt-3 text-[18px]">{p.t}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Two CTAs ── */}
        <section className="mx-auto grid max-w-7xl gap-5 px-5 pt-20 sm:px-8 md:grid-cols-2">
          <div className="card p-8 sm:p-10">
            <p className="eyebrow mb-3">Finance</p>
            <h2 className="display text-[28px]">What would it cost per month?</h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--text-2)' }}>Work out an instalment in seconds, then apply in one form. We send it to the banks for you.</p>
            <Link href="/finance" className="btn btn-dark mt-7">Finance calculator</Link>
          </div>
          <div className="card p-8 sm:p-10" style={{ background: 'var(--amber)', borderColor: 'var(--amber)', color: '#10151F' }}>
            <p className="eyebrow mb-3" style={{ color: '#10151F' }}>Sell or trade in</p>
            <h2 className="display text-[28px]">Get an offer on your car.</h2>
            <p className="mt-3 text-[15px] leading-relaxed">Tell us about it and we&apos;ll come back with a cash offer or a trade-in value, usually the same day.</p>
            <Link href="/sell-your-car" className="btn mt-7" style={{ background: '#10151F', color: '#fff' }}>Value my car</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
