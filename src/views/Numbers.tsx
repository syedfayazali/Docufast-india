import type { Agent, KpiDay, Kpis, Run } from '../lib/types';
import { ago } from '../lib/time';
import { ROSTER, fmtNext, nextRun } from '../lib/roster';

const COLOR: Record<string, string> = { ok: 'var(--ok)', warn: 'var(--warn)', error: 'var(--err)', running: 'var(--gold)' };

function Trend({ history }: { history: KpiDay[] }) {
  const lines = [
    { key: 'igFollowers', label: 'Instagram followers', color: '#DD2A7B' },
    { key: 'googleReviews', label: 'Google reviews', color: '#1A73E8' },
    { key: 'ytSubscribers', label: 'YouTube subscribers', color: '#FF0000' },
  ];
  const days = history.map((h) => h.day);
  if (days.length < 2) return <div className="empty">The growth chart fills in as Morning Pulse records each day. Check back in a few days.</div>;
  const w = 600, h = 180, pad = 24;
  return (
    <>
      <svg className="chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="Growth over time">
        {lines.map((l) => {
          const v = history.map((d) => d.data?.[l.key]).map((x) => (typeof x === 'number' ? x : null));
          const nums = v.filter((x): x is number => x !== null);
          if (nums.length < 2) return null;
          const min = Math.min(...nums), max = Math.max(...nums), rng = max - min || 1;
          const pts = v.map((y, i) => (y === null ? null : `${pad + (i / (v.length - 1)) * (w - pad * 2)},${h - pad - ((y - min) / rng) * (h - pad * 2)}`)).filter(Boolean).join(' ');
          return <polyline key={l.key} points={pts} fill="none" stroke={l.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />;
        })}
      </svg>
      <div className="legend">{lines.map((l) => <span key={l.key} style={{ ['--c' as string]: l.color }}>{l.label} (each line scaled to its own range)</span>)}</div>
    </>
  );
}

export default function Numbers({ kpis, runs, agents, history }: { kpis: Kpis | null; runs: Run[]; agents: Agent[]; history: KpiDay[] }) {
  return (
    <>
      <div className="card">
        <div className="card-h"><h2>Business pulse</h2><span className="sub">{kpis?.updated_at ? `Updated ${ago(kpis.updated_at)}` : ''}</span></div>
        {kpis?.metrics?.length ? (
          <div className="kpis">{kpis.metrics.map((m) => (
            <div className="kpi" key={m.label}><div className="v">{m.value}</div><div className="l">{m.label}</div>{m.delta && <div className={`d ${m.trend || 'flat'}`}>{m.delta}</div>}</div>
          ))}</div>
        ) : <div className="empty">Waiting for the first Morning Pulse run…</div>}
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h"><h2>Growth</h2><span className="sub">Day by day</span></div>
        <Trend history={history} />
      </div>
      <div className="two">
        <div className="card">
          <div className="card-h"><h2>Activity</h2><span className="sub">Latest agent shifts</span></div>
          {runs.length ? runs.slice(0, 20).map((r) => (
            <div className="feed-item" key={r.id}><span className="feed-dot" style={{ background: COLOR[r.status] || COLOR.ok }} /><div><b>{r.agent}</b> <time>· {ago(r.at)}</time><p>{r.summary}</p></div></div>
          )) : <div className="empty">No shifts yet.</div>}
        </div>
        <div className="card">
          <div className="card-h"><h2>Schedule</h2><span className="sub">India time</span></div>
          {agents.map((a) => (
            <div className="feed-item" key={a.id}><span className="feed-dot" style={{ background: ROSTER[a.id]?.shirt || 'var(--navy)' }} /><div><b>{a.name}</b><p>{a.schedule} · {a.enabled ? `next ${fmtNext(nextRun(a.id))}` : 'switched off'}</p></div></div>
          ))}
        </div>
      </div>
    </>
  );
}
