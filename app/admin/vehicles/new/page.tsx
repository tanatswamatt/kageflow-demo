import Link from 'next/link';
import VehicleForm from '@/components/admin/VehicleForm';

export default function NewVehicle() {
  return (
    <>
      <Link href="/admin/vehicles" className="text-[13px] font-semibold" style={{ color: 'var(--muted)' }}>← Stock</Link>
      <h1 className="display mb-6 mt-2 text-[32px]">Add a car</h1>
      <VehicleForm />
    </>
  );
}
