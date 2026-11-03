'use client';

import { useActionState, useState } from 'react';
import { submitEnquiry, type FormState } from '@/lib/enquiryActions';
import type { EnquiryKind } from '@/types/db';

const TABS: { kind: EnquiryKind; label: string; cta: string; note?: string }[] = [
  { kind: 'enquiry', label: 'Enquire', cta: 'Send enquiry' },
  { kind: 'test_drive', label: 'Test drive', cta: 'Book test drive' },
  { kind: 'reserve', label: 'Reserve', cta: 'Request reservation', note: 'We hold the car once we’ve taken a refundable deposit. A salesperson will call to arrange it.' },
];

export function Status({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <p role="status" className="rounded-[8px] px-4 py-3 text-[14px] font-medium"
      style={{ background: state.ok ? 'var(--green-bg)' : 'var(--red-bg)', color: state.ok ? 'var(--green)' : 'var(--red)' }}>
      {state.message}
    </p>
  );
}

export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>Company <input name="company" tabIndex={-1} autoComplete="off" /></label>
    </div>
  );
}

export function ContactFields() {
  return (
    <>
      <div>
        <label className="label" htmlFor="f-name">Name</label>
        <input id="f-name" name="name" required className="field" autoComplete="name" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="f-phone">Phone</label>
          <input id="f-phone" name="phone" type="tel" className="field" autoComplete="tel" />
        </div>
        <div>
          <label className="label" htmlFor="f-email">Email</label>
          <input id="f-email" name="email" type="email" className="field" autoComplete="email" />
        </div>
      </div>
    </>
  );
}

export default function EnquiryForm({ vehicleId, vehicleName, reservable }: { vehicleId: string; vehicleName: string; reservable: boolean }) {
  const tabs = reservable ? TABS : TABS.filter((t) => t.kind !== 'reserve');
  const [tab, setTab] = useState<EnquiryKind>('enquiry');
  const [state, action, pending] = useActionState(submitEnquiry, null);
  const current = tabs.find((t) => t.kind === tab) ?? tabs[0];

  return (
    <div className="card p-5 sm:p-6" id="enquire">
      <div role="tablist" className="mb-5 grid gap-1 rounded-[8px] p-1" style={{ background: 'var(--surface-3)', gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map((t) => (
          <button key={t.kind} role="tab" type="button" aria-selected={tab === t.kind} onClick={() => setTab(t.kind)}
            className="rounded-[6px] py-2 text-[12.5px] font-bold"
            style={{ background: tab === t.kind ? 'var(--surface-2)' : 'transparent', color: tab === t.kind ? 'var(--text)' : 'var(--muted)', boxShadow: tab === t.kind ? 'var(--shadow)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {state?.ok ? (
        <Status state={state} />
      ) : (
        <form action={action} className="relative space-y-3">
          <input type="hidden" name="kind" value={current.kind} />
          <input type="hidden" name="vehicle_id" value={vehicleId} />
          <Honeypot />
          <ContactFields />
          {current.kind === 'test_drive' && (
            <div>
              <label className="label" htmlFor="f-date">Preferred day</label>
              <input id="f-date" name="preferred_date" type="date" className="field" min={new Date().toISOString().slice(0, 10)} />
            </div>
          )}
          <div>
            <label className="label" htmlFor="f-msg">Message</label>
            <textarea id="f-msg" name="message" rows={3} className="field"
              defaultValue={current.kind === 'enquiry' ? `Hi, I’m interested in the ${vehicleName}. Is it still available?` : ''} key={current.kind} />
          </div>
          {current.note && <p className="text-[12.5px]" style={{ color: 'var(--muted)' }}>{current.note}</p>}
          <Status state={state} />
          <button className="btn btn-primary w-full" disabled={pending}>{pending ? 'Sending…' : current.cta}</button>
        </form>
      )}
    </div>
  );
}
