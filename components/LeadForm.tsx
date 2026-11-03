'use client';

import { useActionState } from 'react';
import { submitEnquiry } from '@/lib/enquiryActions';
import type { EnquiryKind } from '@/types/db';
import { ContactFields, Honeypot, Status } from './EnquiryForm';

/* Generic lead form for finance, trade-in and contact pages. `children` adds the page's own fields. */
export default function LeadForm({ kind, cta, children, messageLabel = 'Message', defaultMessage = '' }: {
  kind: EnquiryKind; cta: string; children?: React.ReactNode; messageLabel?: string; defaultMessage?: string;
}) {
  const [state, action, pending] = useActionState(submitEnquiry, null);
  if (state?.ok) return <div className="card p-6"><Status state={state} /></div>;
  return (
    <form action={action} className="card relative space-y-3 p-6 sm:p-8">
      <input type="hidden" name="kind" value={kind} />
      <Honeypot />
      <ContactFields />
      {children}
      <div>
        <label className="label" htmlFor="l-msg">{messageLabel}</label>
        <textarea id="l-msg" name="message" rows={4} className="field" defaultValue={defaultMessage} />
      </div>
      <Status state={state} />
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? 'Sending…' : cta}</button>
    </form>
  );
}
