import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { setEnquiryStatus, setVehicleStatus } from '@/lib/adminActions';
import AutoSubmitSelect from '@/components/admin/AutoSubmitSelect';
import { ENQ_STATUS_LABEL, KIND_LABEL, type Enquiry, type EnquiryStatus } from '@/types/db';

const OPTS = (Object.keys(ENQ_STATUS_LABEL) as EnquiryStatus[]).map((v) => ({ v, l: ENQ_STATUS_LABEL[v] }));
const TABS: { v?: EnquiryStatus; l: string }[] = [{ l: 'All' }, { v: 'new', l: 'New' }, { v: 'contacted', l: 'Contacted' }, { v: 'won', l: 'Won' }, { v: 'lost', l: 'Lost' }];

type Row = Enquiry & { vehicles: { id: string; make: string; model: string; year: number; slug: string; stock_no: string | null; status: string } | null };

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  let q = supabase.from('enquiries').select('*, vehicles(id, make, model, year, slug, stock_no, status)').order('created_at', { ascending: false }).limit(200);
  if (sp.status && sp.status in ENQ_STATUS_LABEL) q = q.eq('status', sp.status);
  const { data } = await q;
  const rows = (data ?? []) as Row[];

  return (
    <>
      <p className="eyebrow mb-2">Enquiries</p>
      <h1 className="display text-[32px]">Leads from the website</h1>
      <div className="mt-6 flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const on = (sp.status ?? '') === (t.v ?? '');
          return (
            <Link key={t.l} href={t.v ? `/admin/enquiries?status=${t.v}` : '/admin/enquiries'} className="rounded-[7px] px-3 py-1.5 text-[13px] font-semibold"
              style={{ background: on ? 'var(--text)' : 'var(--surface-2)', color: on ? 'var(--surface)' : 'var(--text-2)', border: '1px solid var(--border)' }}>{t.l}</Link>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {rows.length === 0 && <p className="card p-8 text-center text-[14px]" style={{ color: 'var(--muted)' }}>Nothing here yet.</p>}
        {rows.map((e) => (
          <article key={e.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip" style={{ background: e.kind === 'reserve' ? 'var(--amber)' : 'var(--surface-3)', color: '#10151F' }}>{KIND_LABEL[e.kind]}</span>
                  <h2 className="text-[16px] font-bold">{e.name}</h2>
                </div>
                <p className="mt-1.5 text-[13.5px]" style={{ color: 'var(--text-2)' }}>
                  {e.phone && <a href={`tel:${e.phone}`} className="mr-3 underline underline-offset-2">{e.phone}</a>}
                  {e.email && <a href={`mailto:${e.email}`} className="underline underline-offset-2">{e.email}</a>}
                </p>
                <p className="mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
                  {new Date(e.created_at).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}
                  {e.preferred_date && ` · wants ${new Date(e.preferred_date).toLocaleDateString('en-ZA', { dateStyle: 'medium' })}`}
                </p>
              </div>
              <form action={setEnquiryStatus}>
                <input type="hidden" name="id" value={e.id} />
                <AutoSubmitSelect name="status" value={e.status} options={OPTS} label={`Status of enquiry from ${e.name}`} />
              </form>
            </div>
            {e.message && <p className="mt-3 whitespace-pre-line rounded-[8px] p-3 text-[14px]" style={{ background: 'var(--surface-3)' }}>{e.message}</p>}
            {e.vehicles && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-[13.5px]" style={{ borderColor: 'var(--border)' }}>
                <Link href={`/admin/vehicles/${e.vehicles.id}`} className="font-semibold hover:underline">
                  {e.vehicles.year} {e.vehicles.make} {e.vehicles.model}{e.vehicles.stock_no ? ` · ${e.vehicles.stock_no}` : ''}
                  <span className="font-normal" style={{ color: 'var(--muted)' }}> · {e.vehicles.status.replace('_', ' ')}</span>
                </Link>
                <div className="flex gap-2">
                  {e.vehicles.status === 'in_stock' && (
                    <form action={setVehicleStatus}>
                      <input type="hidden" name="id" value={e.vehicles.id} />
                      <input type="hidden" name="status" value="reserved" />
                      <button className="btn btn-ghost btn-sm">Mark reserved</button>
                    </form>
                  )}
                  {e.vehicles.status !== 'sold' && (
                    <form action={setVehicleStatus}>
                      <input type="hidden" name="id" value={e.vehicles.id} />
                      <input type="hidden" name="status" value="sold" />
                      <button className="btn btn-dark btn-sm">Mark sold</button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
