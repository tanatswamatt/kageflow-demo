import Link from 'next/link';
import Logo from './Logo';
import DemoBanner from './DemoBanner';
import { SITE } from '@/lib/site';

const LINKS = [
  { href: '/inventory', label: 'Cars for sale' },
  { href: '/finance', label: 'Finance' },
  { href: '/sell-your-car', label: 'Sell your car' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-40">
      <DemoBanner />
      <div className="border-b backdrop-blur" style={{ background: 'rgba(250,248,244,0.92)', borderColor: 'var(--border)' }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-[13.5px] font-semibold hover:opacity-70" style={{ color: 'var(--text-2)' }}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={`https://wa.me/${SITE.whatsapp}`} className="btn btn-ghost btn-sm hidden sm:inline-flex" target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <Link href="/inventory" className="btn btn-primary btn-sm">View stock</Link>
          </div>
        </div>
        <nav className="flex gap-5 overflow-x-auto border-t px-5 py-2.5 md:hidden" style={{ borderColor: 'var(--border)' }} aria-label="Main mobile">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap text-[13px] font-semibold" style={{ color: 'var(--text-2)' }}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
