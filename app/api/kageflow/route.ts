import crypto from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

/**
 * Kageflow → website.
 *
 *  - "listing.updated": a car advertised in Kageflow. The website adds it, keeps it in step
 *    (price, details, photos) and hides it when it's unpublished or sold. Photos stay on
 *    Kageflow's storage; the website shows them by link.
 *  - "unit.updated": a car that came from this website was reserved, sold or put back in stock.
 *
 * Needs KAGEFLOW_WEBHOOK_SECRET and SUPABASE_SERVICE_ROLE_KEY (server only, never NEXT_PUBLIC_).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Kageflow vehicle status → website status. Anything not listed leaves the listing alone.
const SITE_STATUS: Record<string, 'in_stock' | 'reserved' | 'sold' | 'draft'> = {
  in_stock: 'in_stock',
  in_transit: 'in_stock',
  reserved: 'reserved',
  sold: 'sold',
  written_off: 'draft',
};

// listing.updated "status" → website status
const LISTING_STATUS: Record<string, 'in_stock' | 'reserved' | 'sold' | 'draft'> = {
  available: 'in_stock',
  reserved: 'reserved',
  sold: 'sold',
  hidden: 'draft',
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validSignature(raw: string, header: string | null, secret: string) {
  if (!header?.startsWith('sha256=')) return false;
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const got = header.slice(7);
  return got.length === expected.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

type Listing = {
  id: string;
  stock_no: string | null;
  make: string | null;
  model: string | null;
  variant: string | null;
  year: number | null;
  mileage_km: number | null;
  colour: string | null;
  transmission: string | null;
  fuel_type: string | null;
  body_type: string | null;
  price: number | null;
  description: string | null;
  features: string[] | null;
  status: string;
  photos: { id: string; url: string; position: number }[] | null;
};

type Event = { event: string; data?: Record<string, unknown> };

function body(b: string | null) {
  const s = (b ?? '').toLowerCase();
  if (s.includes('bakkie') || s.includes('pickup') || s.includes('pick-up')) return 'bakkie';
  if (s.includes('suv')) return 'suv';
  if (s.includes('hatch')) return 'hatchback';
  if (s.includes('sedan')) return 'sedan';
  if (s.includes('coupe')) return 'coupe';
  if (s.includes('mpv')) return 'mpv';
  return 'other';
}

function fuel(f: string | null) {
  const s = (f ?? '').toLowerCase();
  return s.includes('diesel') ? 'diesel' : s.includes('hybrid') ? 'hybrid' : s.includes('electric') ? 'electric' : 'petrol';
}

const slugOf = (l: Listing) =>
  [l.make, l.model, l.year, l.stock_no ?? l.id.slice(0, 8)].filter(Boolean).join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function done(slug?: string | null) {
  revalidatePath('/', 'layout');
  if (slug) revalidatePath(`/vehicle/${slug}`);
}

export async function POST(req: Request) {
  const secret = process.env.KAGEFLOW_WEBHOOK_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !serviceKey) return new Response('Kageflow webhook not configured', { status: 503 });

  const raw = await req.text();
  if (!validSignature(raw, req.headers.get('x-kageflow-signature'), secret)) {
    return new Response('Bad signature', { status: 401 });
  }

  let evt: Event;
  try {
    evt = JSON.parse(raw);
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  if (evt.event === 'ping') return Response.json({ ok: true });
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { persistSession: false } });

  if (evt.event === 'listing.updated') {
    const l = evt.data as unknown as Listing;
    if (!l || !UUID.test(String(l.id ?? ''))) return new Response('Missing listing id', { status: 400 });
    const status = LISTING_STATUS[l.status] ?? 'draft';
    const { data: existing } = await admin.from('vehicles').select('id, slug, status').eq('id', l.id).maybeSingle();

    // Never shown here and not shown now: nothing to do
    if (!existing && status !== 'in_stock' && status !== 'reserved') return Response.json({ ok: true, ignored: 'not listed' });
    // The website needs a make, model and year to show a car
    if (!l.make || !l.year) {
      if (existing) await admin.from('vehicles').update({ status: 'draft' }).eq('id', l.id);
      return Response.json({ ok: true, ignored: 'needs make and year' });
    }

    const slug = existing?.slug ?? slugOf(l);
    const row = {
      id: l.id,
      slug,
      stock_no: l.stock_no,
      make: l.make,
      model: l.model ?? '',
      variant: l.variant,
      year: l.year,
      body: body(l.body_type),
      fuel: fuel(l.fuel_type),
      transmission: (l.transmission ?? '').toLowerCase().startsWith('auto') ? 'auto' : 'manual',
      mileage_km: l.mileage_km != null && l.mileage_km >= 0 ? Math.round(l.mileage_km) : null,
      colour: l.colour,
      price_zar: l.price != null && l.price >= 0 ? l.price : null,
      status,
      description: l.description,
      features: Array.isArray(l.features) ? l.features : [],
      sold_at: status === 'sold' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    let { error } = await admin.from('vehicles').upsert(row, { onConflict: 'id' });
    // a slug taken by another car: make it unique with the Kageflow id
    if (error && /slug/.test(error.message)) {
      row.slug = `${slugOf(l)}-${l.id.slice(0, 6)}`;
      ({ error } = await admin.from('vehicles').upsert(row, { onConflict: 'id' }));
    }
    if (error) return new Response(error.message, { status: 500 }); // Kageflow shows the failure in its delivery log

    // photos: same set and order as Kageflow
    const photos = (l.photos ?? []).filter((p) => UUID.test(p.id) && /^https:\/\//.test(p.url));
    const keep = photos.map((p) => p.id);
    const del = admin.from('vehicle_images').delete().eq('vehicle_id', l.id);
    const { error: e1 } = keep.length ? await del.not('id', 'in', `(${keep.join(',')})`) : await del;
    if (e1) return new Response(e1.message, { status: 500 });
    if (photos.length) {
      const { error: e2 } = await admin.from('vehicle_images').upsert(
        photos.map((p, i) => ({ id: p.id, vehicle_id: l.id, storage_path: p.url, position: i, is_primary: i === 0 })),
        { onConflict: 'id' },
      );
      if (e2) return new Response(e2.message, { status: 500 });
    }

    done(row.slug);
    if (existing?.slug && existing.slug !== row.slug) revalidatePath(`/vehicle/${existing.slug}`);
    return Response.json({ ok: true, listing: l.id, status, photos: photos.length });
  }

  if (evt.event !== 'unit.updated') return Response.json({ ok: true, ignored: evt.event });

  const id = String(evt.data?.external_id ?? '');
  const next = SITE_STATUS[String(evt.data?.status ?? '')];
  // Cars Kageflow didn't get from this website have no external_id; they come as listing.updated instead.
  if (!UUID.test(id) || !next) return Response.json({ ok: true, ignored: true });

  const { data, error } = await admin.from('vehicles').update({ status: next }).eq('id', id).select('slug').maybeSingle();
  if (error) return new Response(error.message, { status: 500 });

  done(data?.slug);
  return Response.json({ ok: true, updated: Boolean(data), status: next });
}
