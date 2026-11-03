import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import LeadForm from '@/components/LeadForm';

export const metadata = { title: 'Sell or trade in your car' };

export default function SellPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-7xl px-5 pt-10 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_460px]">
          <div>
            <p className="eyebrow mb-3">Sell or trade in</p>
            <h1 className="display t-section max-w-2xl">Get a fair offer on your car, usually the same day.</h1>
            <ol className="mt-10 space-y-6">
              {[
                ['Tell us about it', 'Make, model, year, mileage and condition. Photos help.'],
                ['Get an offer', 'We send a cash offer or a trade-in value against a car on our floor.'],
                ['Bring it in', 'A quick inspection, the paperwork, and payment or settlement of your finance.'],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="display grid h-10 w-10 shrink-0 place-items-center rounded-full text-[15px]" style={{ background: 'var(--amber)', color: '#10151F' }}>{i + 1}</span>
                  <div>
                    <h2 className="display text-[18px]">{t}</h2>
                    <p className="mt-1 text-[15px]" style={{ color: 'var(--text-2)' }}>{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <LeadForm kind="trade_in" cta="Get my offer" messageLabel="Anything else? (service history, finance owed, damage)">
            <div>
              <label className="label" htmlFor="their_car">Your car (year, make, model)</label>
              <input id="their_car" name="their_car" required className="field" placeholder="2018 Toyota Fortuner 2.8 GD-6" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="their_mileage">Mileage</label>
                <input id="their_mileage" name="their_mileage" className="field" placeholder="km" inputMode="numeric" />
              </div>
              <div>
                <label className="label" htmlFor="their_condition">Condition</label>
                <select id="their_condition" name="their_condition" className="field" defaultValue="Good">
                  <option>Excellent</option><option>Good</option><option>Fair</option><option>Needs work</option>
                </select>
              </div>
            </div>
          </LeadForm>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
