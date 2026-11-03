import Link from 'next/link';
import Logo from './Logo';
import { SITE, KAGEFLOW } from '@/lib/site';

export default function SiteFooter() {
  return (
    <footer className="on-dark mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed" style={{ color: 'var(--text-2)' }}>
            {SITE.tagline} Every car inspected, every price on the window, every enquiry answered the same day.
          </p>
        </div>
        <div className="text-[14px]" style={{ color: 'var(--text-2)' }}>
          <p className="eyebrow mb-3">Visit</p>
          <p>{SITE.address}</p>
          <p className="mt-2">{SITE.hours}</p>
        </div>
        <div className="text-[14px]" style={{ color: 'var(--text-2)' }}>
          <p className="eyebrow mb-3">Explore</p>
          <ul className="space-y-2">
            <li><Link href="/inventory">Cars for sale</Link></li>
            <li><Link href="/finance">Finance calculator</Link></li>
            <li><Link href="/sell-your-car">Sell or trade in</Link></li>
            <li><Link href="/contact">Contact us</Link></li>
            <li><Link href="/admin">Dealer login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-[12px] sm:px-8" style={{ color: 'var(--muted)' }}>
          <span>© {new Date().getFullYear()} {SITE.name}. Demo dealership — not a real business.</span>
          <a href={KAGEFLOW.site} className="font-semibold" style={{ color: 'var(--text-2)' }}>
            Powered by <span style={{ color: 'var(--amber)' }}>Kageflow</span> · dealer software for Southern Africa
          </a>
        </div>
      </div>
    </footer>
  );
}
