import 'server-only';
import { redirect } from 'next/navigation';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import type { Role } from '@/types/db';

export type Staff = { id: string; email: string | null; full_name: string | null; role: Exclude<Role, 'none'> };

/** Signed-in staff member, or null. Any failure means "not staff". */
export async function getStaff(): Promise<Staff | null> {
  if (!supabaseConfigured) return null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('id, email, full_name, role').eq('id', user.id).single();
    if (!data || (data.role !== 'sales' && data.role !== 'admin')) return null;
    return data as Staff;
  } catch {
    return null;
  }
}

/** For admin pages and actions. The database checks again through RLS. */
export async function requireStaff(): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect('/login?denied=1');
  return staff;
}

/** Only allow same-site relative paths after login (no open redirects). */
export function safeNext(next: string | null | undefined, fallback = '/admin') {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}
