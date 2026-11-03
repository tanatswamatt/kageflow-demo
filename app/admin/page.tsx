import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/money';
import { KIND_LABEL, type Enquiry, type Vehicle } from '@/types/db';

/** Start of the 30-day window, outside render so the component stays pure. */
const thirtyDaysAgo = () => new Date(new Date().getTime() - 30 * 864e5).toISOString();

export default async function Dashboard() {
  const supabase = await createClient();
  const since = thirtyDaysAgo();
  const [{ data: cars }, { data: enq }] = await Promise.all([
    supabase.from('vehicles').select('id, status, price_zar, sold_at'),
    supabase.from('enquiries').select('*, vehicles(make, model, year, slug, stock_no)').order('created_at', { ascending: false }).limit(8),
  ]);
  const v = (cars ?? []) as Pick<Vehicle, 'id' | 'status' | 'price_zar' | 'sold_at'>[];
  const inStock = v.filter((x) => x.status === 'in_stock');
  const { count: newCount } = await supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new');

  const kpis = [
    { l: 'Cars in stock', n: String(inStock.length), href: '/admin/vehicles?status=in_stock' },
    { l: 'Stock value', n: formatPrice(inStock.reduce((s, x) => s + Number(x.price_zar ?? 0), 0)), href: '/admin/vehicles' },
    { l: 'Reserved', n: String(v.filter((x) => x.status === 'reserved').length), href: '/admin/vehicles?status=reserved' },
    { l: 'Sold · last 30 days', n: String(v.filter((x) => x.status === 'sold' && x.sold_at && x.sold_at >= since).length), href: '/admin/vehicles?status=sold' },
    { l: 'New enquiries', n: String(newCount ?? 0), href: '/admin/enquiries?status=new' },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Dashboard</p>
          <h1 className="display text-[32px]">Today on the floor</h1>
        </div>
        <Link href="/admin/vehicles/new" className="btn btn-primary">+ Add a car</Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k) => (
          <Link key={k.l} href={k.href} className="card p-5 hover:border-[var(--text)]">
            <p className="label !mb-2">{k.l}</p>
            <p className="display text-[26px] leading-none">{k.n}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="display text-[20px]">Latest enquiries</h2>
        <Link href="/admin/enquiries" className="text-[13px] font-semibold underline underline-offset-2">All enquiries</Link>
      </div>
      <div className="card mt-4 divide-y overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        {((enq ?? []) as Enquiry[]).length === 0 && <p className="p-6 text-[14px]" style={{ color: 'var(--muted)' }}>No enquiries yet. Submit one from the website to see it arrive here.</p>}
        {((enq ?? []) as Enquiry[]).map((e) => (
          <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-4" style={{ borderColor: 'var(--border)' }}>
            <div className="min-w-0">
              <p className="text-[14.5px] font-semibold">{e.name} <span className="font-normal" style={{ color: 'var(--muted)' }}>· {KIND_LABEL[e.kind]}</span></p>
              <p className="truncate text-[13px]" style={{ color: 'var(--muted)' }}>
                {e.vehicles ? `${e.vehicles.year} ${e.vehicles.make} ${e.vehicles.model}` : 'General'} · {new Date(e.created_at).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            {e.status === 'new' && <span className="chip" style={{ background: 'var(--amber)', color: '#10151F' }}>New</span>}
          </div>
        ))}
      </div>
    </>
  );
}
