import { Suspense } from 'react';
import Logo from '@/components/Logo';
import LoginForm from '@/components/LoginForm';
import { supabaseConfigured } from '@/lib/supabase/server';

export const metadata = { title: 'Dealer login' };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="card p-7">
          <h1 className="display text-[24px]">Dealer login</h1>
          <p className="mb-6 mt-2 text-[14px]" style={{ color: 'var(--muted)' }}>Manage stock and enquiries.</p>
          {supabaseConfigured ? (
            <Suspense><LoginForm /></Suspense>
          ) : (
            <p className="rounded-[8px] p-4 text-[14px]" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>
              Supabase isn&apos;t connected yet. Add the two environment variables to use the admin.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
