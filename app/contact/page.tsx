import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import LeadForm from '@/components/LeadForm';
import { SITE } from '@/lib/site';

export const metadata = { title: 'Contact' };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-7xl px-5 pt-10 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_460px]">
          <div>
            <p className="eyebrow mb-3">Contact</p>
            <h1 className="display t-section">Come and see us.</h1>
            <dl className="mt-10 grid gap-6 sm:grid-cols-2">
              {[
                ['Showroom', SITE.address],
                ['Hours', SITE.hours],
                ['Phone', SITE.phone],
                ['Email', SITE.email],
              ].map(([k, v]) => (
                <div key={k} className="card p-5">
                  <dt className="label">{k}</dt>
                  <dd className="text-[15px] font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <LeadForm kind="contact" cta="Send message"
            defaultMessage={topic === 'find' ? 'I’m looking for: (make, model, budget)' : ''} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
