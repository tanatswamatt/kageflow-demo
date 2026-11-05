import 'server-only';
import type { EnquiryKind } from '@/types/db';

/**
 * Kageflow connection, server side only.
 *
 *   KAGEFLOW_URL             e.g. https://app.kageflow.co.za
 *   KAGEFLOW_API_KEY         kf_live_… from Kageflow → Settings → Integrations → API keys
 *   KAGEFLOW_WEBHOOK_SECRET  whsec_… from the webhook you add in Kageflow
 *
 * Leave them blank and the site works on its own; enquiries still land in the site's admin.
 */
export const kageflowLeadsOn = Boolean(process.env.KAGEFLOW_URL && process.env.KAGEFLOW_API_KEY);

const INTEREST: Record<EnquiryKind, string> = {
  enquiry: 'Enquiry',
  test_drive: 'Test drive request',
  reserve: 'Reservation request',
  finance: 'Finance application',
  trade_in: 'Trade-in / sell my car',
  contact: 'General contact',
};

export type LeadInput = {
  id: string;
  kind: EnquiryKind;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  preferredDate: string | null;
  vehicle: { title: string; stockNo: string | null; price: number | null; slug: string } | null;
};

/** Sends one website enquiry to Kageflow as a CRM lead. Never throws: a Kageflow outage must not break the form. */
export async function sendLeadToKageflow(lead: LeadInput) {
  if (!kageflowLeadsOn) return;
  const [first, ...rest] = lead.name.trim().split(/\s+/);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const interest = [INTEREST[lead.kind], lead.vehicle ? `${lead.vehicle.title}${lead.vehicle.stockNo ? ` (${lead.vehicle.stockNo})` : ''}` : null]
    .filter(Boolean)
    .join(': ');
  const message = [lead.message, lead.preferredDate ? `Preferred day: ${lead.preferredDate}` : null].filter(Boolean).join('\n');

  try {
    const res = await fetch(`${process.env.KAGEFLOW_URL!.replace(/\/+$/, '')}/api/v1/leads`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.KAGEFLOW_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        external_ref: `demo-site-${lead.id}`, // resending never creates a duplicate
        first_name: first,
        last_name: rest.join(' ') || undefined,
        email: lead.email ?? undefined,
        phone: lead.phone ?? undefined,
        interest,
        estimated_value: lead.vehicle?.price ?? undefined,
        currency: 'ZAR',
        source: 'web_form',
        source_detail: lead.vehicle ? `${site}/vehicle/${lead.vehicle.slug}` : `${site} · ${INTEREST[lead.kind]}`,
        message: message || undefined,
      }),
      signal: AbortSignal.timeout(6000),
      cache: 'no-store',
    });
    if (!res.ok) console.error('Kageflow lead rejected', res.status, (await res.text()).slice(0, 300));
  } catch (e) {
    console.error('Kageflow lead failed', e instanceof Error ? e.message : e);
  }
}
