import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import FinanceCalc from '@/components/FinanceCalc';
import LeadForm from '@/components/LeadForm';

export const metadata = { title: 'Finance' };

export default function FinancePage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-7xl px-5 pt-10 sm:px-8">
        <p className="eyebrow mb-3">Vehicle finance</p>
        <h1 className="display t-section max-w-3xl">One application. Several banks. The best approval.</h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed" style={{ color: 'var(--text-2)' }}>
          Work out a monthly instalment, then send us your details. We submit to the major South African banks for you and come back with the offers.
        </p>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_420px]">
          <FinanceCalc />
          <div>
            <h2 className="display mb-4 text-[22px]">Apply for finance</h2>
            <LeadForm kind="finance" cta="Send application" messageLabel="Which car are you interested in?">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="income">Gross monthly income</label>
                  <input id="income" name="income" className="field" placeholder="R" inputMode="numeric" />
                </div>
                <div>
                  <label className="label" htmlFor="deposit">Deposit available</label>
                  <input id="deposit" name="deposit" className="field" placeholder="R" inputMode="numeric" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="employment">Employment</label>
                <select id="employment" name="employment" className="field" defaultValue="">
                  <option value="">Choose…</option>
                  <option>Permanently employed</option>
                  <option>Contract</option>
                  <option>Self-employed</option>
                  <option>Pensioner</option>
                </select>
              </div>
            </LeadForm>
            <p className="mt-3 text-[12px]" style={{ color: 'var(--muted)' }}>
              We only use these details to prepare your application. The banks will ask for your consent before a credit check.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
