import { createClient } from '@supabase/supabase-js';

const SB_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const ANON = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const OWNERS = (process.env.OWNER_EMAILS || 'docufast.india@gmail.com').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...extra } });
}

/** Verifies the caller's Supabase session and that they are an owner. Returns a client acting as that user. */
async function requireOwner(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return { error: json({ error: 'Not signed in' }, 401) } as const;
  const sb = createClient(SB_URL, ANON, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
  const { data, error } = await sb.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (error || !email) return { error: json({ error: 'Session expired' }, 401) } as const;
  if (!OWNERS.includes(email)) return { error: json({ error: 'Not allowed' }, 403) } as const;
  return { sb, email } as const;
}

const WINDSOR = 'https://connectors.windsor.ai';
function windsorKey() { return process.env.WINDSOR_API_KEY || ''; }


type Q = { connector: string; fields: string[]; date_preset?: string; account?: string };
const QUERIES: Record<string, Q> = {
  ig: { connector: 'instagram', fields: ['username', 'followers_count', 'follows_count', 'media_count'] },
  igReach: { connector: 'instagram', fields: ['reach', 'profile_links_taps'], date_preset: 'last_7d' },
  fb: { connector: 'facebook_organic', fields: ['page_name', 'page_follows', 'page_fans'], date_preset: 'last_3d' },
  yt: { connector: 'youtube', fields: ['channel_title', 'subscriber_count', 'video_count', 'view_count'] },
  gr: { connector: 'google_my_business', fields: ['review_total_count', 'review_average_rating_total'], date_preset: 'last_7d' },
  gs: { connector: 'google_my_business', fields: ['impressions', 'call_clicks', 'website_clicks', 'direction_requests'], date_preset: 'last_30d' },
  th: { connector: 'threads', fields: ['username', 'followers_count'] },
};

let cache: { at: number; body: unknown } | null = null;
const TTL = 10 * 60 * 1000;

async function pull(q: Q, key: string) {
  const u = new URL(`${WINDSOR}/${q.connector}`);
  u.searchParams.set('api_key', key);
  u.searchParams.set('fields', q.fields.join(','));
  if (q.date_preset) u.searchParams.set('date_preset', q.date_preset);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(u, { signal: ctrl.signal });
    if (!r.ok) return { ok: false, error: `HTTP ${r.status}` };
    const j = (await r.json()) as { data?: Record<string, unknown>[] };
    const rows = j.data || [];
    if (!rows.length) return { ok: false, error: 'Not connected or no data' };
    // sum numeric fields across rows for ranged metrics, keep first row's text
    const row: Record<string, unknown> = { ...rows[0] };
    if (q.date_preset && rows.length > 1) {
      for (const f of q.fields) {
        if (rows.every((x) => typeof x[f] === 'number')) row[f] = rows.reduce((s, x) => s + (x[f] as number), 0);
      }
    }
    return { ok: true, row };
  } catch (e) {
    return { ok: false, error: (e as Error).name === 'AbortError' ? 'Timed out' : 'Network error' };
  } finally { clearTimeout(t); }
}

async function handler(req: Request): Promise<Response> {
  const auth = await requireOwner(req);
  if ('error' in auth && auth.error) return auth.error;
  if (!('sb' in auth) || !auth.sb) return json({ error: 'Not signed in' }, 401);
  const key = windsorKey();
  if (!key) return json({ error: 'WINDSOR_API_KEY is not set on the server' }, 500);
  const force = new URL(req.url).searchParams.get('refresh') === '1';
  if (!force && cache && Date.now() - cache.at < TTL) return json(cache.body);
  const entries = await Promise.all(Object.entries(QUERIES).map(async ([k, q]) => [k, await pull(q, key)] as const));
  const body = { fetchedAt: new Date().toISOString(), sources: Object.fromEntries(entries) };
  cache = { at: Date.now(), body };
  return json(body);
}

export const GET = handler;
