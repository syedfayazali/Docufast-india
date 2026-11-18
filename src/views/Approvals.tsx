import { useMemo, useState } from 'react';
import type { Approval } from '../lib/types';
import { fmt } from '../lib/time';
import { supabase } from '../lib/supabase';

const TYPE_LABEL: Record<string, string> = {
  instagram_post: 'Instagram', reel_script: 'Reel script', instagram_reply: 'Instagram reply', gbp_post: 'Google post',
  review_reply: 'Review reply', whatsapp: 'WhatsApp', pricing: 'Pricing', website: 'Website', app: 'App change',
  partner: 'Partner pitch', task: 'Task for you', alert: 'Alert',
};

type Filter = 'pending' | 'approved' | 'closed';

export default function Approvals({ approvals, update, toast }: {
  approvals: Approval[]; update: (id: string, p: Partial<Approval>) => Promise<void>; toast: (m: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>('pending');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<Set<string>>(new Set());

  const counts = useMemo(() => ({
    pending: approvals.filter((a) => a.status === 'pending').length,
    approved: approvals.filter((a) => a.status === 'approved').length,
    closed: approvals.filter((a) => a.status === 'done' || a.status === 'rejected').length,
  }), [approvals]);

  const list = approvals
    .filter((a) => (filter === 'pending' ? a.status === 'pending' : filter === 'approved' ? a.status === 'approved' : a.status === 'done' || a.status === 'rejected'))
    .filter((a) => !q || `${a.title} ${a.body} ${a.agent}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.priority === 'high' ? -1 : 0) - (b.priority === 'high' ? -1 : 0) || b.created_at.localeCompare(a.created_at));

  const run = async (a: Approval, fn: () => Promise<void>, ok: string) => {
    setBusy((s) => new Set(s).add(a.id));
    try { await fn(); toast(ok); } catch { toast('Could not save. Please try again.'); }
    setBusy((s) => { const n = new Set(s); n.delete(a.id); return n; });
  };

  const postReply = (a: Approval) => run(a, async () => {
    const { data } = await supabase.auth.getSession();
    const r = await fetch('/api/ig-reply', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${data.session?.access_token}` }, body: JSON.stringify({ id: a.id }) });
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'failed'); }
  }, 'Reply posted on Instagram');

  const copy = async (a: Approval) => {
    try { await navigator.clipboard.writeText(a.body || ''); toast('Copied'); }
    catch { toast('Select the text and copy it.'); setOpen((s) => new Set(s).add(a.id)); }
  };

  return (
    <div className="card">
      <div className="card-h">
        <div className="seg" role="tablist">
          {(['pending', 'approved', 'closed'] as Filter[]).map((f) => (
            <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
              {f === 'closed' ? 'Done' : f[0].toUpperCase() + f.slice(1)} <span className="sub">({counts[f]})</span>
            </button>
          ))}
        </div>
        <input className="search" placeholder="Search drafts…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search approvals" />
      </div>
      {!list.length && <div className="empty">{filter === 'pending' ? 'Nothing waiting. Your agents add drafts here as they work.' : 'Nothing here yet.'}</div>}
      {list.map((a) => {
        const isEdit = editing === a.id, isOpen = open.has(a.id), b = busy.has(a.id);
        const canPost = a.type === 'instagram_reply' && !!(a.meta as { commentId?: string })?.commentId && a.status === 'approved';
        return (
          <article className="appr" key={a.id}>
            <div className="appr-top">
              <span className={`badge ${a.priority === 'high' ? 'gold' : ''}`}>{TYPE_LABEL[a.type || ''] || a.type || 'Item'}</span>
              <span className={`status-pill s-${a.status}`}>{a.status}</span>
              <span className="meta">{a.agent || 'Agent'} · {fmt(a.created_at)}{a.edited ? ' · edited by you' : ''}</span>
            </div>
            <h3>{a.title}</h3>
            {a.why && <div className="meta">{a.why}</div>}
            {isEdit
              ? <textarea className="edit" value={draft} onChange={(e) => setDraft(e.target.value)} />
              : a.body && <div className={`body ${isOpen ? 'open' : ''}`}>{a.body}</div>}
            <div className="actions">
              {a.status === 'pending' && (isEdit ? (
                <>
                  <button className="btn primary" disabled={b} onClick={() => { setEditing(null); run(a, () => update(a.id, { status: 'approved', body: draft, edited: true }), 'Saved and approved'); }}>Save &amp; approve</button>
                  <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="btn primary" disabled={b} onClick={() => run(a, () => update(a.id, { status: 'approved' }), 'Approved')}>Approve</button>
                  <button className="btn" onClick={() => { setDraft(a.body || ''); setEditing(a.id); }}>Edit</button>
                  <button className="btn ghost" disabled={b} onClick={() => run(a, () => update(a.id, { status: 'rejected' }), 'Rejected')}>Reject</button>
                </>
              ))}
              {a.body && !isEdit && <>
                <button className="btn" onClick={() => copy(a)}>Copy text</button>
                <button className="btn ghost" onClick={() => setOpen((s) => { const n = new Set(s); if (n.has(a.id)) n.delete(a.id); else n.add(a.id); return n; })}>{isOpen ? 'Show less' : 'Show all'}</button>
              </>}
              {canPost && <button className="btn go" disabled={b} onClick={() => postReply(a)}>Post reply on Instagram</button>}
              {a.status === 'approved' && <button className="btn" disabled={b} onClick={() => run(a, () => update(a.id, { status: 'done' }), 'Marked done')}>Mark done</button>}
              {(a.status === 'rejected' || a.status === 'done') && <button className="btn ghost" disabled={b} onClick={() => run(a, () => update(a.id, { status: 'pending' }), 'Moved back to pending')}>Undo</button>}
            </div>
            {a.result && <div className="note">{a.result}</div>}
            {a.status === 'approved' && !canPost && a.how_to && <div className="note">Next step: {a.how_to}</div>}
          </article>
        );
      })}
    </div>
  );
}
