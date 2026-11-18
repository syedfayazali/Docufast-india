import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const ANON = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const OWNERS = (process.env.OWNER_EMAILS || 'docufast.india@gmail.com').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

export function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...extra } });
}

/** Verifies the caller's Supabase session and that they are an owner. Returns a client acting as that user. */
export async function requireOwner(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return { error: json({ error: 'Not signed in' }, 401) } as const;
  const sb = createClient(URL, ANON, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
  const { data, error } = await sb.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (error || !email) return { error: json({ error: 'Session expired' }, 401) } as const;
  if (!OWNERS.includes(email)) return { error: json({ error: 'Not allowed' }, 403) } as const;
  return { sb, email } as const;
}

export const WINDSOR = 'https://connectors.windsor.ai';
export function windsorKey() { return process.env.WINDSOR_API_KEY || ''; }
