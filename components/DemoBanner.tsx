import { KAGEFLOW } from '@/lib/site';

export default function DemoBanner() {
  return (
    <div className="on-dark border-b text-[12px]" style={{ borderColor: 'var(--border)', background: '#0B0F17' }}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 py-2 text-center sm:px-8">
        <span style={{ color: 'var(--text-2)' }}>
          This is a <strong style={{ color: 'var(--amber)' }}>Kageflow</strong> demo dealership. Stock, enquiries and reservations are managed in Kageflow.
        </span>
        <a href={`mailto:${KAGEFLOW.demoEmail}?subject=Kageflow%20for%20my%20dealership`} className="font-semibold underline underline-offset-2" style={{ color: 'var(--text)' }}>
          Get this for your dealership →
        </a>
      </div>
    </div>
  );
}
