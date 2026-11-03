import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label={`${SITE.name} home`}>
      <span className="grid h-8 w-8 place-items-center rounded-[7px]" style={{ background: 'var(--amber)' }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#10151F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 15l2-5a2 2 0 0 1 1.9-1.4h10.2A2 2 0 0 1 19 10l2 5v3a1 1 0 0 1-1 1h-1.5M3 15v3a1 1 0 0 0 1 1h1.5M3 15h18M8.5 19h7" />
          <circle cx="7" cy="19" r="1.6" /><circle cx="17" cy="19" r="1.6" />
        </svg>
      </span>
      <span className="display text-[19px] leading-none" style={{ color: 'var(--text)' }}>
        {SITE.name.split(' ')[0]}<span style={{ color: 'var(--accent)' }}> {SITE.name.split(' ').slice(1).join(' ')}</span>
      </span>
    </Link>
  );
}
