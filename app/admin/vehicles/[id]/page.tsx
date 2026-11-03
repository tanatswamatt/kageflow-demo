import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { deleteVehicle } from '@/lib/adminActions';
import VehicleForm from '@/components/admin/VehicleForm';
import ImageUploader from '@/components/admin/ImageUploader';
import { STATUS_LABEL, type Vehicle } from '@/types/db';

export default async function EditVehicle({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from('vehicles').select('*, vehicle_images(id, vehicle_id, storage_path, position, is_primary)').eq('id', id).maybeSingle();
  if (!data) notFound();
  const v = data as Vehicle;
  const live = v.status === 'in_stock' || v.status === 'reserved';

  return (
    <>
      <Link href="/admin/vehicles" className="text-[13px] font-semibold" style={{ color: 'var(--muted)' }}>← Stock</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[32px]">{v.year} {v.make} {v.model}</h1>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--muted)' }}>{STATUS_LABEL[v.status]}{v.stock_no ? ` · ${v.stock_no}` : ''}</p>
        </div>
        {live && <Link href={`/vehicle/${v.slug}`} target="_blank" className="btn btn-ghost btn-sm">View on website ↗</Link>}
      </div>
      {created && (
        <p className="mb-5 rounded-[8px] px-4 py-3 text-[14px] font-medium" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
          Car added{live ? ' and live on the website' : ''}. Now add some photos.
        </p>
      )}
      <div className="space-y-6">
        <ImageUploader vehicleId={v.id} images={v.vehicle_images ?? []} />
        <VehicleForm v={v} />
        <form action={deleteVehicle} className="card flex flex-wrap items-center justify-between gap-3 p-5" style={{ borderColor: 'var(--red-bg)' }}>
          <input type="hidden" name="id" value={v.id} />
          <p className="text-[14px]" style={{ color: 'var(--text-2)' }}>Delete this car and its photos. Mark it <strong>Sold</strong> instead if you want to keep the record.</p>
          <button className="btn btn-danger btn-sm">Delete car</button>
        </form>
      </div>
    </>
  );
}
