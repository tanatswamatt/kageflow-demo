'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireStaff } from '@/lib/staff';
import type { EnquiryStatus, VehicleStatus } from '@/types/db';

export type SaveState = { ok: boolean; message: string } | null;

const BODIES = ['hatchback', 'sedan', 'suv', 'bakkie', 'coupe', 'mpv', 'other'];
const FUELS = ['petrol', 'diesel', 'hybrid', 'electric'];
const TRANS = ['manual', 'auto'];
const DRIVES = ['2wd', '4x4', 'awd'];
const STATUSES: VehicleStatus[] = ['draft', 'in_stock', 'reserved', 'sold'];
const ENQ: EnquiryStatus[] = ['new', 'contacted', 'won', 'lost'];

const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? '').trim().slice(0, max);
const oneOf = <T extends string>(v: string, list: readonly T[], fallback: T): T => ((list as readonly string[]).includes(v) ? (v as T) : fallback);

function refreshSite(slug?: string) {
  revalidatePath('/', 'layout');
  if (slug) revalidatePath(`/vehicle/${slug}`);
}

function readVehicle(fd: FormData) {
  const make = str(fd, 'make', 60);
  const model = str(fd, 'model', 80);
  const year = Number(str(fd, 'year', 4));
  const priceRaw = str(fd, 'price_zar', 20).replace(/[\s,R]/g, '');
  const kmRaw = str(fd, 'mileage_km', 10).replace(/[\s,]/g, '');
  const features = str(fd, 'features', 2000).split(/[\n,]/).map((f) => f.trim()).filter(Boolean).slice(0, 40);

  if (!make || !model) return { error: 'Make and model are required.' } as const;
  if (!Number.isInteger(year) || year < 1950 || year > new Date().getFullYear() + 1) return { error: 'Enter a valid year.' } as const;
  if (priceRaw && !/^\d+(\.\d{1,2})?$/.test(priceRaw)) return { error: 'Price must be a number, e.g. 349900.' } as const;
  if (kmRaw && !/^\d+$/.test(kmRaw)) return { error: 'Mileage must be a whole number of kilometres.' } as const;

  return {
    row: {
      make, model, year,
      variant: str(fd, 'variant', 120) || null,
      stock_no: str(fd, 'stock_no', 30) || null,
      body: oneOf(str(fd, 'body'), BODIES, 'sedan'),
      fuel: oneOf(str(fd, 'fuel'), FUELS, 'petrol'),
      transmission: oneOf(str(fd, 'transmission'), TRANS, 'manual'),
      drivetrain: DRIVES.includes(str(fd, 'drivetrain')) ? str(fd, 'drivetrain') : null,
      mileage_km: kmRaw ? Number(kmRaw) : null,
      colour: str(fd, 'colour', 40) || null,
      price_zar: priceRaw ? Number(priceRaw) : null,
      status: oneOf(str(fd, 'status'), STATUSES, 'in_stock'),
      featured: fd.get('featured') === 'on',
      description: str(fd, 'description', 4000) || null,
      features,
    },
  } as const;
}

export async function createVehicle(_prev: SaveState, fd: FormData): Promise<SaveState> {
  await requireStaff();
  const parsed = readVehicle(fd);
  if ('error' in parsed) return { ok: false, message: parsed.error ?? 'Check the form.' };
  const r = parsed.row;
  const slug = `${r.make}-${r.model}-${r.year}-${crypto.randomUUID().slice(0, 6)}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const supabase = await createClient();
  const { data, error } = await supabase.from('vehicles').insert({ ...r, slug }).select('id').single();
  if (error || !data) return { ok: false, message: error?.message ?? 'Could not save the car.' };
  refreshSite();
  redirect(`/admin/vehicles/${data.id}?created=1`);
}

export async function updateVehicle(_prev: SaveState, fd: FormData): Promise<SaveState> {
  await requireStaff();
  const id = str(fd, 'id', 40);
  const parsed = readVehicle(fd);
  if ('error' in parsed) return { ok: false, message: parsed.error ?? 'Check the form.' };
  const supabase = await createClient();
  const { data, error } = await supabase.from('vehicles').update(parsed.row).eq('id', id).select('slug').single();
  if (error || !data) return { ok: false, message: error?.message ?? 'Could not save the car.' };
  refreshSite(data.slug);
  return { ok: true, message: 'Saved. The website is updated.' };
}

export async function setVehicleStatus(fd: FormData) {
  await requireStaff();
  const id = str(fd, 'id', 40);
  const status = oneOf(str(fd, 'status'), STATUSES, 'in_stock');
  const supabase = await createClient();
  const { data } = await supabase.from('vehicles').update({ status }).eq('id', id).select('slug').single();
  refreshSite(data?.slug);
  revalidatePath('/admin', 'layout');
}

export async function deleteVehicle(fd: FormData) {
  await requireStaff();
  const id = str(fd, 'id', 40);
  const supabase = await createClient();
  const { data: imgs } = await supabase.from('vehicle_images').select('storage_path').eq('vehicle_id', id);
  const paths = (imgs ?? []).map((i) => i.storage_path).filter((p) => !/^https?:/.test(p));
  if (paths.length) await supabase.storage.from('vehicle-images').remove(paths);
  await supabase.from('vehicles').delete().eq('id', id);
  refreshSite();
  redirect('/admin/vehicles?deleted=1');
}

export async function setEnquiryStatus(fd: FormData) {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from('enquiries').update({ status: oneOf(str(fd, 'status'), ENQ, 'new') }).eq('id', str(fd, 'id', 40));
  revalidatePath('/admin', 'layout');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
