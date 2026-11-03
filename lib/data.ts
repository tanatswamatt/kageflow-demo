import 'server-only';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import type { Vehicle } from '@/types/db';
import seed from '@/lib/seed-data.json';

/** Statuses the public may see. Drafts and sold cars never reach a public page. */
export const PUBLIC_STATUSES = ['in_stock', 'reserved'] as const;

export type Filters = {
  q?: string;
  make?: string;
  body?: string;
  fuel?: string;
  trans?: string;
  year?: string;
  max?: string;
  sort?: string;
};

const slugOf = (r: { make: string; model: string; year: number; stock_no: string }) =>
  `${r.make}-${r.model}-${r.year}-${r.stock_no}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Preview stock, used only when Supabase isn't configured (local design work).
 * Once the env vars are set, every page reads the real database.
 */
const PREVIEW: Vehicle[] = (seed as unknown as Vehicle[]).map((r, i) => ({
  ...r,
  id: `preview-${i}`,
  slug: slugOf(r as unknown as { make: string; model: string; year: number; stock_no: string }),
  sold_at: null,
  created_at: new Date(Date.UTC(2026, 9, 28 - i)).toISOString(),
  updated_at: new Date(Date.UTC(2026, 9, 28 - i)).toISOString(),
  vehicle_images: [],
}));

const SELECT = '*, vehicle_images(id, vehicle_id, storage_path, position, is_primary)';

/** Every public car, unfiltered. Used for facet counts and the homepage. */
export async function getPublicStock(): Promise<Vehicle[]> {
  if (!supabaseConfigured) return PREVIEW.filter((v) => (PUBLIC_STATUSES as readonly string[]).includes(v.status));
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vehicles')
    .select(SELECT)
    .in('status', PUBLIC_STATUSES)
    .order('created_at', { ascending: false });
  if (error) console.error('getPublicStock', error.message);
  return (data ?? []) as Vehicle[];
}

export function matches(v: Vehicle, f: Filters, skip?: keyof Filters) {
  const q = f.q?.trim().toLowerCase();
  if (q && skip !== 'q' && !`${v.make} ${v.model} ${v.variant ?? ''} ${v.stock_no ?? ''}`.toLowerCase().includes(q)) return false;
  if (f.make && skip !== 'make' && v.make !== f.make) return false;
  if (f.body && skip !== 'body' && v.body !== f.body) return false;
  if (f.fuel && skip !== 'fuel' && v.fuel !== f.fuel) return false;
  if (f.trans && skip !== 'trans' && v.transmission !== f.trans) return false;
  if (f.year && skip !== 'year' && v.year < Number(f.year)) return false;
  if (f.max && skip !== 'max' && (v.price_zar === null || Number(v.price_zar) > Number(f.max))) return false;
  return true;
}

export function sortStock(list: Vehicle[], sort?: string) {
  const byPrice = (dir: 1 | -1) => (a: Vehicle, b: Vehicle) => {
    if (a.price_zar === null) return 1;
    if (b.price_zar === null) return -1;
    return dir * (Number(a.price_zar) - Number(b.price_zar));
  };
  const out = [...list];
  if (sort === 'lo') out.sort(byPrice(1));
  else if (sort === 'hi') out.sort(byPrice(-1));
  else if (sort === 'km') out.sort((a, b) => (a.mileage_km ?? Infinity) - (b.mileage_km ?? Infinity));
  else if (sort === 'year') out.sort((a, b) => b.year - a.year);
  else out.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return out;
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  if (!supabaseConfigured) return PREVIEW.find((v) => v.slug === slug) ?? null;
  const supabase = await createClient();
  const { data } = await supabase
    .from('vehicles')
    .select(SELECT)
    .eq('slug', slug)
    .in('status', PUBLIC_STATUSES)
    .maybeSingle();
  return (data as Vehicle | null) ?? null;
}
