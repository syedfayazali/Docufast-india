import { json } from '../server/auth.js';

const URL_ = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const ANON = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Drafts inbox for agents that read public text (Reply Desk).
 * It forwards to one locked database function that can only add reply drafts and log the run.
 */
async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  let body: { kind?: string; data?: unknown } = {};
  try { body = await req.json(); } catch { return json({ error: 'Send JSON: {"kind": "...", "data": {...}}' }, 400); }
  if (!token || !body.kind) return json({ error: 'Missing token or kind' }, 400);
  const r = await fetch(`${URL_}/rest/v1/rpc/cr_agent_submit`, {
    method: 'POST',
    headers: { apikey: ANON, authorization: `Bearer ${ANON}`, 'content-type': 'application/json' },
    body: JSON.stringify({ p_token: token, p_kind: body.kind, p_data: body.data ?? {} }),
  });
  const text = await r.text();
  if (!r.ok) {
    let msg = text.slice(0, 200);
    try { msg = JSON.parse(text).message || msg; } catch { /* keep */ }
    return json({ error: msg }, r.status === 401 || /not authorised/.test(msg) ? 401 : 400);
  }
  return new Response(text, { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}

export const POST = handler;
export const GET = handler;
