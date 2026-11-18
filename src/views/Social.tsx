import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { KpiDay } from '../lib/types';
import { ago, num } from '../lib/time';
import { ICON } from '../components/Icons';

type Src = { ok: boolean; row?: Record<string, unknown>; error?: string };
type Payload = { fetchedAt: string; sources: Record<string, Src> };

const CONNECT_TH = 'https://onboard.windsor.ai/connect?connector=threads&next=/threads/authorize&user=MjE0ODkyNjM1Mg.xRg-4JBxwl-6y2d5tTuZEt4NuzQ';

function Spark({ vals }: { vals: number[] }) {
  if (vals.length < 2) return <div className="hint">Follower chart fills in day by day.</div>;
  const min = Math.min(...vals), max = Math.max(...vals), w = 240, h = 46, rng = max - min || 1;
  const pts = vals.map((y, i) => `${(i / (vals.length - 1)) * w},${h - 4 - ((y - min) / rng) * (h - 8)}`).join(' ');
  return <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="Trend"><polyline points={pts} fill="none" stroke="#F4B000" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" /></svg>;
}

function State({ s, loading }: { s?: Src; loading: boolean }) {
  if (loading && !s) return <span className="state manual">Loading…</span>;
  if (s?.ok) return <span className="state live">Live</span>;
  return <span className="state off">{s?.error?.startsWith('Not connected') ? 'Not connected' : "Can't reach"}</span>;
}

function Big({ v, label, loading }: { v: unknown; label: string; loading: boolean }) {
  if (loading && v === undefined) return <div className="skeleton" />;
  return <div className="big">{num(v)}<small>{label}</small></div>;
}

export default function Social({ history }: { history: KpiDay[] }) {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    setLoading(true); setErr(null);
    try {
      const { data: s } = await supabase.auth.getSession();
      const r = await fetch(`/api/social${force ? '?refresh=1' : ''}`, { headers: { authorization: `Bearer ${s.session?.access_token}` } });
      const j = await r.json().catch(() => ({ error: 'The server is not responding' }));
      if (!r.ok || j.error) throw new Error(j.error || `HTTP ${r.status}`);
      setData(j);
    } catch (e) { setErr((e as Error).message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); const i = setInterval(() => load(), 15 * 60000); return () => clearInterval(i); }, [load]);

  const S = data?.sources || {};
  const r = (k: string) => (S[k]?.ok ? S[k].row! : {}) as Record<string, any>; // eslint-disable-line
  const ig = r('ig'), igr = r('igReach'), fb = r('fb'), yt = r('yt'), gr = r('gr'), gs = r('gs'), th = r('th');
  const series = (key: string, live?: unknown) => {
    const v = history.map((h) => h.data?.[key]).filter((x): x is number => typeof x === 'number');
    if (typeof live === 'number' && v[v.length - 1] !== live) v.push(live);
    return v;
  };

  return (
    <>
      <div className="card-h" style={{ marginBottom: 14 }}>
        <span className="sub">{data ? `Updated ${ago(data.fetchedAt)} · refreshes every 15 minutes` : 'Loading live numbers…'}</span>
        <button className="btn" onClick={() => load(true)} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh now'}</button>
      </div>
      {err && <div className="banner err">Couldn't load live numbers: {err}</div>}
      <div className="social-grid">
        <div className="soc">
          <div className="soc-h"><div className="logo" style={{ background: 'linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)' }}>{ICON.ig}</div><div><h3>Instagram</h3><div className="handle">@docufast.india</div></div><State s={S.ig} loading={loading} /></div>
          <Big v={ig.followers_count} label="followers" loading={loading} />
          <Spark vals={series('igFollowers', ig.followers_count)} />
          <div className="stats3"><div><b>{num(ig.media_count)}</b><span>Posts</span></div><div><b>{num(igr.reach)}</b><span>Reach (7d)</span></div><div><b>{num(igr.profile_links_taps)}</b><span>Link taps (7d)</span></div></div>
          <div className="foot"><a className="btn" href="https://www.instagram.com/docufast.india" target="_blank" rel="noopener">Open profile</a></div>
        </div>

        <div className="soc">
          <div className="soc-h"><div className="logo" style={{ background: '#1A73E8' }}>{ICON.g}</div><div><h3>Google Business Profile</h3><div className="handle">Docufast India · Mahabubnagar</div></div><State s={S.gr} loading={loading} /></div>
          {loading && !S.gr ? <div className="skeleton" /> : <div className="big">{typeof gr.review_average_rating_total === 'number' ? `${gr.review_average_rating_total.toFixed(1)}★` : '–'}<small>{num(gr.review_total_count)} reviews</small></div>}
          <Spark vals={series('googleReviews', gr.review_total_count)} />
          <div className="stats3"><div><b>{num(gs.impressions)}</b><span>Profile views (30d)</span></div><div><b>{num(gs.direction_requests)}</b><span>Directions (30d)</span></div><div><b>{num(gs.call_clicks)}</b><span>Calls (30d)</span></div></div>
          <div className="foot"><a className="btn" href="https://www.google.com/maps?cid=18178173605229815860" target="_blank" rel="noopener">Open on Maps</a><a className="btn" href="https://business.google.com/" target="_blank" rel="noopener">Manage profile</a></div>
        </div>

        <div className="soc">
          <div className="soc-h"><div className="logo" style={{ background: '#FF0000' }}>{ICON.yt}</div><div><h3>YouTube</h3><div className="handle">{yt.channel_title || 'Docufast india'}</div></div><State s={S.yt} loading={loading} /></div>
          <Big v={yt.subscriber_count} label="subscribers" loading={loading} />
          <Spark vals={series('ytSubscribers', yt.subscriber_count)} />
          <div className="stats3" style={{ gridTemplateColumns: '1fr 1fr' }}><div><b>{num(yt.video_count)}</b><span>Videos</span></div><div><b>{num(yt.view_count)}</b><span>Total views</span></div></div>
          <div className="foot"><a className="btn" href="https://studio.youtube.com/" target="_blank" rel="noopener">Open Studio</a></div>
        </div>

        <div className="soc">
          <div className="soc-h"><div className="logo" style={{ background: '#1877F2' }}>{ICON.fb}</div><div><h3>Facebook</h3><div className="handle">{fb.page_name || 'Docufast India'} Page</div></div><State s={S.fb} loading={loading} /></div>
          <Big v={fb.page_follows} label="followers" loading={loading} />
          <Spark vals={series('fbFollowers', fb.page_follows)} />
          <div className="hint">Tip: share every Instagram reel to this Page automatically (Instagram → Settings → Sharing to other apps).</div>
          <div className="foot"><a className="btn" href="https://www.facebook.com/profile.php?id=1192790560582176" target="_blank" rel="noopener">Open Page</a></div>
        </div>

        <div className="soc">
          <div className="soc-h"><div className="logo" style={{ background: '#111' }}>{ICON.th}</div><div><h3>Threads</h3><div className="handle">@docufast.india</div></div><State s={S.th} loading={loading} /></div>
          {S.th?.ok ? <Big v={th.followers_count} label="followers" loading={loading} /> : <>
            <div className="big" style={{ color: '#94A3B8' }}>–<small>followers</small></div>
            <div className="hint">Open the Threads app once with your Instagram login, then connect it here.</div>
          </>}
          <div className="foot">{!S.th?.ok && <a className="btn go" href={CONNECT_TH} target="_blank" rel="noopener">Connect</a>}</div>
        </div>

        <div className="soc">
          <div className="soc-h"><div className="logo" style={{ background: '#25D366' }}>{ICON.wa}</div><div><h3>WhatsApp Business</h3><div className="handle">+91 83749 68022</div></div><span className="state manual">Manual</span></div>
          <div className="hint">WhatsApp has no tracking connection. Use labels in WhatsApp Business (New, Docs received, Done) to keep count.</div>
          <div className="foot"><a className="btn" href="https://wa.me/918374968022" target="_blank" rel="noopener">Open chat link</a></div>
        </div>

        <div className="soc">
          <div className="soc-h"><div className="logo" style={{ background: '#0A2E6E' }}>{ICON.web}</div><div><h3>Website</h3><div className="handle">docufastindia.com</div></div><span className="state live">Online</span></div>
          <div className="hint">Live with your address, opening hours, WhatsApp buttons and real Google reviews.</div>
          <div className="foot"><a className="btn" href="https://www.docufastindia.com" target="_blank" rel="noopener">Open site</a></div>
        </div>
      </div>
    </>
  );
}
