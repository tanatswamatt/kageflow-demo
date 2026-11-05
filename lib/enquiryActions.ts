'use server';

import { after } from 'next/server';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import { sendLeadToKageflow } from '@/lib/kageflow';
import type { EnquiryKind } from '@/types/db';

export type FormState = { ok: boolean; message: string } | null;

const KINDS: EnquiryKind[] = ['enquiry', 'test_drive', 'reserve', 'finance', 'trade_in', 'contact'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const text = (fd: FormData, k: string, max: number) => String(fd.get(k) ?? '').trim().slice(0, max);

/**
 * Every public form posts here. The row lands in `enquiries` (only staff can read it),
 * then a copy goes to Kageflow as a lead if the Kageflow keys are set.
 */
export async function submitEnquiry(_prev: FormState, fd: FormData): Promise<FormState> {
  // Honeypot: real people never fill the hidden "company" field.
  if (text(fd, 'company', 200)) return { ok: true, message: 'Thanks, we’ll be in touch shortly.' };

  const kind = text(fd, 'kind', 20) as EnquiryKind;
  const name = text(fd, 'name', 120);
  const email = text(fd, 'email', 200);
  const phone = text(fd, 'phone', 40);
  const date = text(fd, 'preferred_date', 10);
  const vehicleId = text(fd, 'vehicle_id', 40);

  // Extra fields (finance, trade-in) are folded into the message so the dealer sees them in one place.
  const extras = ['income', 'deposit', 'employment', 'their_car', 'their_mileage', 'their_condition']
    .map((k) => [k, text(fd, k, 200)] as const)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k.replace(/_/g, ' ').replace(/^their /, 'Their car ')}: ${v}`);
  const message = [text(fd, 'message', 3000), ...extras].filter(Boolean).join('\n');

  if (!KINDS.includes(kind)) return { ok: false, message: 'Something went wrong. Please refresh and try again.' };
  if (!name) return { ok: false, message: 'Please add your name.' };
  if (!email && !phone) return { ok: false, message: 'Please add an email address or phone number so we can reply.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: 'That email address doesn’t look right.' };
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, message: 'Please pick a valid date.' };

  if (!supabaseConfigured) {
    return { ok: true, message: 'Preview mode: the form works, but nothing is saved until Supabase is connected.' };
  }

  const supabase = await createClient();

  // Visitors can't read cars that aren't on sale, so this also stops enquiries on hidden cars.
  let vehicle: { id: string; make: string; model: string; year: number; stock_no: string | null; price_zar: number | null; slug: string } | null = null;
  if (UUID.test(vehicleId)) {
    const { data } = await supabase.from('vehicles').select('id, make, model, year, stock_no, price_zar, slug').eq('id', vehicleId).maybeSingle();
    vehicle = data;
  }

  // The id is made here because visitors may insert enquiries but not read them back.
  const id = crypto.randomUUID();
  const { error } = await supabase.from('enquiries').insert({
    id,
    kind,
    name,
    email: email || null,
    phone: phone || null,
    message: message || null,
    preferred_date: date || null,
    vehicle_id: vehicle?.id ?? null,
  });

  if (error) {
    console.error('submitEnquiry', error.message);
    return { ok: false, message: 'We couldn’t send that just now. Please try again or WhatsApp us.' };
  }

  // Sent after the reply, so the visitor never waits on Kageflow.
  after(() =>
    sendLeadToKageflow({
      id,
      kind,
      name,
      email: email || null,
      phone: phone || null,
      message: message || null,
      preferredDate: date || null,
      vehicle: vehicle
        ? { title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`, stockNo: vehicle.stock_no, price: vehicle.price_zar ? Number(vehicle.price_zar) : null, slug: vehicle.slug }
        : null,
    }),
  );

  const done: Record<EnquiryKind, string> = {
    enquiry: 'Thanks! A salesperson will contact you shortly.',
    test_drive: 'Test drive requested. We’ll call to confirm the time.',
    reserve: 'Reservation request received. We’ll call you to confirm and take the deposit.',
    finance: 'Application received. We’ll be in touch once the banks respond.',
    trade_in: 'Thanks! We’ll come back with an offer, usually the same day.',
    contact: 'Thanks for your message. We’ll reply shortly.',
  };
  return { ok: true, message: done[kind] };
}
