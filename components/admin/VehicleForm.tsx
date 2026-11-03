'use client';

import { useActionState } from 'react';
import { createVehicle, updateVehicle, type SaveState } from '@/lib/adminActions';
import { BODY_LABEL, DRIVE_LABEL, FUEL_LABEL, STATUS_LABEL, TRANS_LABEL, type Vehicle } from '@/types/db';

const opts = (o: Record<string, string>) => Object.entries(o).map(([v, l]) => <option key={v} value={v}>{l}</option>);

function F({ label, id, children, span = 1 }: { label: string; id: string; children: React.ReactNode; span?: 1 | 2 | 3 }) {
  return (
    <div className={span === 3 ? 'sm:col-span-3' : span === 2 ? 'sm:col-span-2' : ''}>
      <label className="label" htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

export default function VehicleForm({ v }: { v?: Vehicle }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(v ? updateVehicle : createVehicle, null);

  return (
    <form action={action} className="card space-y-6 p-6">
      {v && <input type="hidden" name="id" value={v.id} />}
      <div className="grid gap-4 sm:grid-cols-3">
        <F label="Make *" id="make"><input id="make" name="make" required defaultValue={v?.make} className="field" placeholder="Toyota" list="makes" /></F>
        <F label="Model *" id="model"><input id="model" name="model" required defaultValue={v?.model} className="field" placeholder="Hilux" /></F>
        <F label="Year *" id="year"><input id="year" name="year" required type="number" min={1950} max={2100} defaultValue={v?.year ?? new Date().getFullYear()} className="field" /></F>
        <F label="Variant" id="variant" span={2}><input id="variant" name="variant" defaultValue={v?.variant ?? ''} className="field" placeholder="2.8 GD-6 Raider 4x4 double cab" /></F>
        <F label="Stock no." id="stock_no"><input id="stock_no" name="stock_no" defaultValue={v?.stock_no ?? ''} className="field" placeholder="DM-1013" /></F>
        <F label="Price (R)" id="price_zar"><input id="price_zar" name="price_zar" inputMode="decimal" defaultValue={v?.price_zar ?? ''} className="field" placeholder="349900 — blank shows POA" /></F>
        <F label="Mileage (km)" id="mileage_km"><input id="mileage_km" name="mileage_km" inputMode="numeric" defaultValue={v?.mileage_km ?? ''} className="field" /></F>
        <F label="Colour" id="colour"><input id="colour" name="colour" defaultValue={v?.colour ?? ''} className="field" /></F>
        <F label="Body" id="body"><select id="body" name="body" defaultValue={v?.body ?? 'hatchback'} className="field">{opts(BODY_LABEL)}</select></F>
        <F label="Fuel" id="fuel"><select id="fuel" name="fuel" defaultValue={v?.fuel ?? 'petrol'} className="field">{opts(FUEL_LABEL)}</select></F>
        <F label="Gearbox" id="transmission"><select id="transmission" name="transmission" defaultValue={v?.transmission ?? 'manual'} className="field">{opts(TRANS_LABEL)}</select></F>
        <F label="Drive" id="drivetrain">
          <select id="drivetrain" name="drivetrain" defaultValue={v?.drivetrain ?? '2wd'} className="field">{opts(DRIVE_LABEL)}</select>
        </F>
        <F label="Status" id="status"><select id="status" name="status" defaultValue={v?.status ?? 'in_stock'} className="field">{opts(STATUS_LABEL)}</select></F>
        <div className="flex items-end">
          <label className="flex items-center gap-2.5 pb-3 text-[14px] font-semibold">
            <input type="checkbox" name="featured" defaultChecked={v?.featured} className="h-4 w-4 accent-[#E8A33D]" /> Feature on homepage
          </label>
        </div>
        <F label="Description" id="description" span={3}>
          <textarea id="description" name="description" rows={4} defaultValue={v?.description ?? ''} className="field" placeholder="Service history, owners, condition, extras…" />
        </F>
        <F label="Features (one per line or comma-separated)" id="features" span={3}>
          <textarea id="features" name="features" rows={3} defaultValue={v?.features.join('\n') ?? ''} className="field" placeholder={'Service plan\nTow bar\nReverse camera'} />
        </F>
      </div>
      <datalist id="makes">
        {['Toyota', 'Volkswagen', 'Ford', 'Suzuki', 'Hyundai', 'Kia', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Renault', 'Mazda', 'Haval', 'Chery', 'Isuzu', 'Mahindra'].map((m) => <option key={m} value={m} />)}
      </datalist>
      {state && (
        <p role="status" className="rounded-[8px] px-4 py-3 text-[14px] font-medium"
          style={{ background: state.ok ? 'var(--green-bg)' : 'var(--red-bg)', color: state.ok ? 'var(--green)' : 'var(--red)' }}>{state.message}</p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" disabled={pending}>{pending ? 'Saving…' : v ? 'Save changes' : 'Save and add photos →'}</button>
        <p className="text-[12.5px]" style={{ color: 'var(--muted)' }}>&ldquo;In stock&rdquo; and &ldquo;Reserved&rdquo; cars show on the website. Drafts and sold cars don&apos;t.</p>
      </div>
    </form>
  );
}
