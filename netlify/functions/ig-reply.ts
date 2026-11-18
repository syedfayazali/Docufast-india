import type { Config } from '@netlify/functions';
import { json, requireOwner, WINDSOR, windsorKey } from './_auth';

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  const auth = await requireOwner(req);
  if ('error' in auth) return auth.error;
  const key = windsorKey();
  if (!key) return json({ error: 'WINDSOR_API_KEY is not set on the server' }, 500);

  let id = '';
  try { id = String(((await req.json()) as { id?: string }).id || ''); } catch { /* ignore */ }
  if (!id) return json({ error: 'Missing approval id' }, 400);

  // Read the approval as the signed-in owner (RLS applies)
  const { data: a, error } = await auth.sb.from('cr_approvals').select('*').eq('id', id).maybeSingle();
  if (error || !a) return json({ error: 'Approval not found' }, 404);
  const meta = (a.meta || {}) as { commentId?: string; accountId?: string };
  if (a.type !== 'instagram_reply' || !meta.commentId) return json({ error: 'This item is not an Instagram reply' }, 400);
  if (a.status !== 'approved') return json({ error: 'Approve the reply first' }, 409);
  const message = String(a.body || '').trim();
  if (!message || message.length > 2200) return json({ error: 'Reply text is empty or too long' }, 400);

  const r = await fetch(`${WINDSOR}/instagram/actions?api_key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ account: meta.accountId || '17841424387462405', action: 'reply_to_comment', params: { comment_id: meta.commentId, message } }),
  });
  const text = await r.text();
  if (!r.ok) {
    await auth.sb.from('cr_approvals').update({ result: `Posting failed (${r.status}). Copy the text and reply in Instagram.` }).eq('id', id);
    return json({ error: `Instagram said no (${r.status})`, detail: text.slice(0, 300) }, 502);
  }
  const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  await auth.sb.from('cr_approvals').update({ status: 'done', result: `Posted on Instagram ${when}`, decided_at: new Date().toISOString() }).eq('id', id);
  return json({ ok: true });
};

export const config: Config = { path: '/api/ig-reply' };
