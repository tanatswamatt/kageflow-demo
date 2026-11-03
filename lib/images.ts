import type { Vehicle, VehicleImage } from '@/types/db';

const BUCKET = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public/vehicle-images/`;

export function imageUrl(path: string) {
  return /^https?:\/\//.test(path) ? path : BUCKET + path;
}

export function sortedImages(v: Pick<Vehicle, 'vehicle_images'>): VehicleImage[] {
  return [...(v.vehicle_images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
  );
}
