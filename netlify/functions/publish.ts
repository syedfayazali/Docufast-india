import type { Config } from '@netlify/functions';
import { json, requireOwner, WINDSOR, windsorKey } from './_auth';

const ACCOUNTS = {
  instagram: '17841424387462405',
  facebook_organic: '1192790560582176',
  google_my_business: 'locations/17168050999709925344',
  youtube: '102587',
};

/** Google profile edits an agent may propose. Address, service area and open/closed are deliberately excluded. */
const GBP_SAFE = new Set(['update_categories', 'update_location', 'set_regular_hours', 'set_special_hours', 'update_attributes', 'update_service_items', 'upload_media']);

type Meta = Record<string, unknown>;
type Plan = { connector: keyof typeof ACCOUNTS; action: string; params: Record<string, unknown>; label: string };

function plan(type: string, body: string, m: Meta): Plan | string {
  const s = (k: string) => (typeof m[k] === 'string' && m[k] ? (m[k] as string) : undefined);
  switch (type) {
    case 'instagram_reply':
      if (!s('commentId')) return 'Missing Instagram comment id';
      return { connector: 'instagram', action: 'reply_to_comment', params: { comment_id: s('commentId'), message: body }, label: 'Reply posted on Instagram' };
    case 'instagram_post':
      if (s('videoUrl')) return { connector: 'instagram', action: 'create_video_post', params: { video_url: s('videoUrl'), caption: body }, label: 'Reel published on Instagram' };
      if (s('imageUrl')) return { connector: 'instagram', action: 'create_image_post', params: { image_url: s('imageUrl'), caption: body }, label: 'Post published on Instagram' };
      return 'This Instagram item has no photo or video attached, so it has to be done in the app';
    case 'instagram_hide':
      if (!s('commentId')) return 'Missing Instagram comment id';
      return { connector: 'instagram', action: 'hide_comment', params: { comment_id: s('commentId') }, label: 'Comment hidden on Instagram' };
    case 'gbp_post': {
      const params: Record<string, unknown> = { summary: body.slice(0, 1500), cta_type: 'CALL' };
      if (s('imageUrl')) params.photo_url = s('imageUrl');
      return { connector: 'google_my_business', action: 'create_local_post', params, label: 'Post published on Google' };
    }
    case 'review_reply':
      if (!s('reviewId')) return 'Missing Google review id';
      return { connector: 'google_my_business', action: 'reply_to_review', params: { review_id: s('reviewId'), comment: body }, label: 'Reply published on Google' };
    case 'gbp_update': {
      const action = s('action');
      if (!action || !GBP_SAFE.has(action)) return 'This Google profile change is not allowed from the dashboard';
      const params = (m.params && typeof m.params === 'object') ? (m.params as Record<string, unknown>) : null;
      if (!params) return 'Missing details for the Google profile change';
      return { connector: 'google_my_business', action, params, label: 'Google profile updated (Google may review it first)' };
    }
    case 'facebook_post':
      if (s('imageUrl')) return { connector: 'facebook_organic', action: 'create_photo_post', params: { image_url: s('imageUrl'), caption: body }, label: 'Post published on Facebook' };
      return { connector: 'facebook_organic', action: 'create_post', params: { message: body, ...(s('link') ? { link: s('link') } : {}) }, label: 'Post published on Facebook' };
    case 'youtube_reply':
      if (!s('commentId')) return 'Missing YouTube comment id';
      return { connector: 'youtube', action: 'reply_to_comment', params: { comment_id: s('commentId'), text: body }, label: 'Reply posted on YouTube' };
    default:
      return 'This item has no publish button';
  }
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  const auth = await requireOwner(req);
  if ('error' in auth) return auth.error;
  const key = windsorKey();
  if (!key) return json({ error: 'The Windsor.ai key is not set on the server yet' }, 500);

  let id = '';
  try { id = String(((await req.json()) as { id?: string }).id || ''); } catch { /* ignore */ }
  if (!id) return json({ error: 'Missing item id' }, 400);

  const { data: a, error } = await auth.sb.from('cr_approvals').select('*').eq('id', id).maybeSingle();
  if (error || !a) return json({ error: 'Item not found' }, 404);
  if (a.status !== 'approved') return json({ error: 'Approve it first' }, 409);
  const meta = (a.meta || {}) as Meta;
  if (meta.publishedAt) return json({ error: 'Already published' }, 409);
  const body = String(a.body || '').trim();
  const p = plan(String(a.type || ''), body, meta);
  if (typeof p === 'string') return json({ error: p }, 400);
  if (!body && p.action !== 'hide_comment' && a.type !== 'gbp_update') return json({ error: 'The text is empty' }, 400);

  const r = await fetch(`${WINDSOR}/${p.connector}/actions?api_key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ account: ACCOUNTS[p.connector], action: p.action, params: p.params }),
  });
  const text = await r.text();
  if (!r.ok) {
    let reason = text.slice(0, 200);
    try { const j = JSON.parse(text); reason = j.error || j.detail || j.message || reason; } catch { /* keep text */ }
    await auth.sb.from('cr_approvals').update({ result: `Publishing failed: ${String(reason).slice(0, 180)}` }).eq('id', id);
    return json({ error: `The platform refused it: ${String(reason).slice(0, 160)}` }, 502);
  }
  const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  await auth.sb.from('cr_approvals').update({ status: 'done', result: `${p.label} · ${when}`, meta: { ...meta, publishedAt: new Date().toISOString() }, decided_at: new Date().toISOString() }).eq('id', id);
  return json({ ok: true, message: p.label });
};

export const config: Config = { path: '/api/publish' };
