'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { imageUrl } from '@/lib/images';
import type { VehicleImage } from '@/types/db';

const MAX_MB = 6;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Uploads straight to the vehicle-images bucket from the browser. Storage and
 * table policies only let staff write, so this needs no server route.
 */
export default function ImageUploader({ vehicleId, images }: { vehicleId: string; images: VehicleImage[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sorted = [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const supabase = createClient();
    const list = Array.from(files);
    let position = images.reduce((m, i) => Math.max(m, i.position), -1) + 1;
    let needsPrimary = !images.some((i) => i.is_primary);

    for (const [n, file] of list.entries()) {
      if (!TYPES.includes(file.type)) { setError(`${file.name}: only JPG, PNG or WebP.`); continue; }
      if (file.size > MAX_MB * 1024 * 1024) { setError(`${file.name} is over ${MAX_MB} MB.`); continue; }
      setBusy(`Uploading ${n + 1} of ${list.length}…`);
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `${vehicleId}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from('vehicle-images').upload(path, file, { contentType: file.type, upsert: false });
      if (up.error) { setError(up.error.message); continue; }
      const ins = await supabase.from('vehicle_images').insert({ vehicle_id: vehicleId, storage_path: path, position: position++, is_primary: needsPrimary });
      if (ins.error) { setError(ins.error.message); await supabase.storage.from('vehicle-images').remove([path]); continue; }
      needsPrimary = false;
    }
    setBusy(null);
    router.refresh();
  }

  async function makePrimary(img: VehicleImage) {
    setBusy('Updating…');
    const supabase = createClient();
    await supabase.from('vehicle_images').update({ is_primary: false }).eq('vehicle_id', vehicleId);
    await supabase.from('vehicle_images').update({ is_primary: true }).eq('id', img.id);
    setBusy(null);
    router.refresh();
  }

  async function remove(img: VehicleImage) {
    setBusy('Removing…');
    const supabase = createClient();
    await supabase.from('vehicle_images').delete().eq('id', img.id);
    if (!/^https?:/.test(img.storage_path)) await supabase.storage.from('vehicle-images').remove([img.storage_path]);
    if (img.is_primary) {
      const next = sorted.find((i) => i.id !== img.id);
      if (next) await supabase.from('vehicle_images').update({ is_primary: true }).eq('id', next.id);
    }
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="display text-[20px]">Photos</h2>
          <p className="mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>JPG, PNG or WebP up to {MAX_MB} MB. The cover photo shows first on the website.</p>
        </div>
        <label className="btn btn-dark cursor-pointer">
          {busy ?? '+ Upload photos'}
          <input type="file" multiple accept={TYPES.join(',')} className="sr-only" disabled={!!busy} onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
        </label>
      </div>
      {error && <p role="alert" className="mt-4 rounded-[8px] px-4 py-3 text-[14px]" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>{error}</p>}
      {sorted.length ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {sorted.map((img) => (
            <figure key={img.id} className="overflow-hidden rounded-[10px]" style={{ border: '1px solid var(--border)' }}>
              <div className="relative aspect-[4/3]" style={{ background: 'var(--surface-3)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl(img.storage_path)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                {img.is_primary && <span className="chip absolute left-2 top-2" style={{ background: 'var(--amber)', color: '#10151F' }}>Cover</span>}
              </div>
              <figcaption className="flex justify-between gap-2 p-2">
                <button type="button" disabled={img.is_primary || !!busy} onClick={() => makePrimary(img)} className="text-[12px] font-semibold disabled:opacity-40">Make cover</button>
                <button type="button" disabled={!!busy} onClick={() => remove(img)} className="text-[12px] font-semibold" style={{ color: 'var(--red)' }}>Delete</button>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-[10px] border border-dashed p-8 text-center text-[14px]" style={{ borderColor: 'var(--border-strong)', color: 'var(--muted)' }}>
          No photos yet. Until you add some, the website shows a placeholder.
        </p>
      )}
    </div>
  );
}
