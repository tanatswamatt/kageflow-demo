import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { setVehicleStatus } from '@/lib/adminActions';
import AutoSubmitSelect from '@/components/admin/AutoSubmitSelect';
import { formatKm, formatPrice } from '@/lib/money';
import { imageUrl, sortedImages } from '@/lib/images';
import { STATUS_LABEL, type Vehicle, type VehicleStatus } from '@/types/db';

const STATUS_OPTS = (Object.keys(STATUS_LABEL) as VehicleStatus[]).map((v) => ({ v, l: STATUS_LABEL[v] }));
const TABS: { v?: VehicleStatus; l: string }[] = [{ l: 'All' }, { v: 'in_stock', l: 'In stock' }, { v: 'reserved', l: 'Reserved' }, { v: 'sold', l: 'Sold' }, { v: 'draft', l: 'Drafts' }];

export default async function StockPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  let query = supabase.from('vehicles').select('*, vehicle_images(id, vehicle_id, storage_path, position, is_primary)').order('created_at', { ascending: false });
  if (sp.status && sp.status in STATUS_LABEL) query = query.eq('status', sp.status);
  const { data } = await query;
  const q = sp.q?.trim().toLowerCase();
  const cars = ((data ?? []) as Vehicle[]).filter((v) => !q || `${v.make} ${v.model} ${v.variant ?? ''} ${v.stock_no ?? ''}`.toLowerCase().includes(q));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Stock</p>
          <h1 className="display text-[32px]">{cars.length} cars</h1>
        </div>
        <Link href="/admin/vehicles/new" className="btn btn-primary">+ Add a car</Link>
      </div>
      {sp.deleted && <p className="mt-4 rounded-[8px] px-4 py-3 text-[14px]" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>Car deleted and removed from the website.</p>}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => {
            const on = (sp.status ?? '') === (t.v ?? '');
            return (
              <Link key={t.l} href={t.v ? `/admin/vehicles?status=${t.v}` : '/admin/vehicles'} className="rounded-[7px] px-3 py-1.5 text-[13px] font-semibold"
                style={{ background: on ? 'var(--text)' : 'var(--surface-2)', color: on ? 'var(--surface)' : 'var(--text-2)', border: '1px solid var(--border)' }}>
                {t.l}
              </Link>
            );
          })}
        </div>
        <form className="flex gap-2">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <input name="q" defaultValue={sp.q ?? ''} placeholder="Search make, model, stock no." className="field !py-2" aria-label="Search stock" />
          <button className="btn btn-dark btn-sm">Search</button>
        </form>
      </div>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[14px]">
          <thead>
            <tr className="border-b text-[11px] uppercase tracking-[0.1em]" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
              <th className="p-3 pl-4 font-bold">Car</th>
              <th className="p-3 font-bold">Stock no.</th>
              <th className="p-3 font-bold">Mileage</th>
              <th className="p-3 font-bold">Price</th>
              <th className="p-3 font-bold">Status</th>
              <th className="p-3 pr-4" />
            </tr>
          </thead>
          <tbody>
            {cars.map((v) => {
              const img = sortedImages(v)[0];
              return (
                <tr key={v.id} className="table-row border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-3 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-[6px]" style={{ background: 'var(--surface-3)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {img && <img src={imageUrl(img.storage_path)} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/vehicles/${v.id}`} className="font-semibold hover:underline">{v.year} {v.make} {v.model}</Link>
                        <p className="truncate text-[12.5px]" style={{ color: 'var(--muted)' }}>{v.variant ?? '—'}{(v.vehicle_images?.length ?? 0) === 0 ? ' · no photos' : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3" style={{ color: 'var(--text-2)' }}>{v.stock_no ?? '—'}</td>
                  <td className="p-3" style={{ color: 'var(--text-2)' }}>{formatKm(v.mileage_km)}</td>
                  <td className="p-3 font-semibold">{formatPrice(v.price_zar)}</td>
                  <td className="p-3">
                    <form action={setVehicleStatus}>
                      <input type="hidden" name="id" value={v.id} />
                      <AutoSubmitSelect name="status" value={v.status} options={STATUS_OPTS} label={`Status of ${v.make} ${v.model}`} />
                    </form>
                  </td>
                  <td className="p-3 pr-4 text-right">
                    <Link href={`/admin/vehicles/${v.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                  </td>
                </tr>
              );
            })}
            {cars.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center" style={{ color: 'var(--muted)' }}>No cars here yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
