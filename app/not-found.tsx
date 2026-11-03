import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <p className="eyebrow mb-3">Not found</p>
        <h1 className="display t-section">That car may have just been sold.</h1>
        <p className="mt-4 text-[16px]" style={{ color: 'var(--text-2)' }}>The page you&apos;re after isn&apos;t here. Have a look at what&apos;s in stock.</p>
        <Link href="/inventory" className="btn btn-primary mt-8">See cars for sale</Link>
      </main>
      <SiteFooter />
    </>
  );
}
