import Link from 'next/link';
import Logo from '@/components/Logo';
import { requireStaff } from '@/lib/staff';
import { signOut } from '@/lib/adminActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dealer admin' };

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/vehicles', label: 'Stock' },
  { href: '/admin/vehicles/new', label: '+ Add a car' },
  { href: '/admin/enquiries', label: 'Enquiries' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="on-dark flex flex-col gap-6 p-5 lg:sticky lg:top-0 lg:h-screen">
        <div className="flex items-center justify-between lg:block">
          <Logo href="/admin" />
          <p className="mt-0 text-[11px] font-bold uppercase tracking-[0.16em] lg:mt-3" style={{ color: 'var(--muted)' }}>
            Dealer admin · <span style={{ color: 'var(--amber)' }}>Kageflow</span>
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Admin">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-[7px] px-3 py-2 text-[14px] font-semibold hover:bg-[var(--surface-3)]" style={{ color: 'var(--text-2)' }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden space-y-3 text-[13px] lg:block" style={{ color: 'var(--muted)' }}>
          <Link href="/" target="_blank" className="block font-semibold" style={{ color: 'var(--text-2)' }}>View website ↗</Link>
          <p className="truncate">{staff.email} · {staff.role}</p>
          <form action={signOut}><button className="btn btn-ghost btn-sm w-full">Sign out</button></form>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}
