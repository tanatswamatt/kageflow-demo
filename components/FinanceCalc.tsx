'use client';

import { useState } from 'react';
import { formatPrice, monthlyInstalment } from '@/lib/money';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><span className="label">{label}</span>{children}</div>;
}

export default function FinanceCalc({ price: initial, compact = false }: { price?: number; compact?: boolean }) {
  const [price, setPrice] = useState(initial ?? 350000);
  const [deposit, setDeposit] = useState(10);
  const [rate, setRate] = useState(12.75);
  const [months, setMonths] = useState(72);
  const [balloon, setBalloon] = useState(0);
  const pm = monthlyInstalment(price, deposit, rate, months, balloon);

  return (
    <div className={compact ? '' : 'card p-6 sm:p-8'}>
      <div className="grid gap-4 sm:grid-cols-2">
        {initial === undefined && (
          <Row label="Car price (R)">
            <input type="number" min={0} step={5000} value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} className="field" />
          </Row>
        )}
        <Row label={`Deposit · ${deposit}%`}>
          <input type="range" min={0} max={50} value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} className="w-full accent-[#E8A33D]" />
        </Row>
        <Row label="Term">
          <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="field">
            {[36, 48, 60, 72, 84].map((m) => <option key={m} value={m}>{m} months</option>)}
          </select>
        </Row>
        <Row label="Interest rate (% a year)">
          <input type="number" min={0} max={30} step={0.25} value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} className="field" />
        </Row>
        <Row label={`Balloon · ${balloon}%`}>
          <input type="range" min={0} max={40} step={5} value={balloon} onChange={(e) => setBalloon(Number(e.target.value))} className="w-full accent-[#E8A33D]" />
        </Row>
      </div>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-3 rounded-[10px] p-5" style={{ background: 'var(--surface-3)' }}>
        <div>
          <p className="label !mb-1">Estimated instalment</p>
          <p className="display text-[34px] leading-none">{formatPrice(pm)}<span className="text-[15px]" style={{ color: 'var(--muted)' }}> p/m</span></p>
        </div>
        <p className="max-w-[16rem] text-[12px]" style={{ color: 'var(--muted)' }}>
          An estimate only, excluding fees and insurance. Your bank sets the final rate.
        </p>
      </div>
    </div>
  );
}
