import { useEffect, useMemo, useRef, useState } from 'react';
import type { Agent, Approval, Run } from '../lib/types';
import { ROSTER, agentState, fmtNext, nextRun, type StateKey } from '../lib/roster';
import { DAYN, ago, fmt, istNow } from '../lib/time';

/* ------------------------------------------------------------------ *
 * Floor plan is drawn on a 1200 x 720 grid; every position below is in
 * those units and converted to % so the whole office scales smoothly.
 * ------------------------------------------------------------------ */
const W = 1200, H = 720;
const px = (x: number) => `${(x / W) * 100}%`;
const py = (y: number) => `${(y / H) * 100}%`;

type Spot = { x: number; y: number; face?: 'up' | 'down' | 'left' | 'right' };
const DESKS: Record<string, Spot> = {
  pulse:   { x: 400, y: 190, face: 'up' },
  ops:     { x: 560, y: 190, face: 'up' },
  content: { x: 720, y: 190, face: 'up' },
  replies: { x: 400, y: 345, face: 'up' },
  growth:  { x: 560, y: 345, face: 'up' },
  reviews: { x: 720, y: 345, face: 'up' },
  radar:   { x: 400, y: 500, face: 'up' },
};
const SPARE_DESK = { x: 560, y: 500 };
const BREAK_SPOTS: Spot[] = [
  { x: 990, y: 185, face: 'up' },   // at the chai machine
  { x: 1060, y: 205, face: 'left' },// by the water cooler
  { x: 960, y: 300, face: 'right' },// break table
  { x: 1030, y: 300, face: 'left' },// break table
  { x: 1110, y: 340, face: 'down' },// sofa
];
const RECEPTION_SPOTS: Spot[] = [{ x: 930, y: 610 }, { x: 980, y: 640 }, { x: 1030, y: 610 }, { x: 1080, y: 640 }, { x: 1130, y: 610 }];
const MEETING_SPOT: Spot = { x: 150, y: 560, face: 'right' };

const SHORT: Record<string, string> = { pulse: 'Pulse', ops: 'Ops', content: 'Content', replies: 'Replies', growth: 'Growth', reviews: 'Reviews', radar: 'Radar' };

const CHATTER = [
  'Chai is ready ☕', 'Printer ran out of A4 again 😅', 'Who left samosas in the fridge?',
  'Big week for reviews!', 'Back to my desk soon', 'Weekend plans?', 'Reels are doing well',
];

type Placed = { agent: Agent; state: StateKey; label: string; spot: Spot; where: 'desk' | 'break' | 'reception' | 'meeting' | 'away' };

function place(agents: Agent[]): Placed[] {
  let b = 0, r = 0;
  const monday = istNow().getDay() === 1;
  return agents.map((a) => {
    const st = agentState(a);
    if (st.key === 'working' && a.id === 'growth' && monday) return { agent: a, state: st.key, label: 'In the weekly meeting', spot: MEETING_SPOT, where: 'meeting' as const };
    if (st.key === 'working' || st.key === 'help') return { agent: a, state: st.key, label: st.label, spot: DESKS[a.id] || SPARE_DESK, where: 'desk' as const };
    if (st.key === 'break') return { agent: a, state: st.key, label: st.label, spot: BREAK_SPOTS[b++ % BREAK_SPOTS.length], where: 'break' as const };
    if (st.key === 'arriving') return { agent: a, state: st.key, label: st.label, spot: RECEPTION_SPOTS[r++ % RECEPTION_SPOTS.length], where: 'reception' as const };
    return { agent: a, state: st.key, label: st.label, spot: DESKS[a.id] || SPARE_DESK, where: 'away' as const };
  });
}

/* ---------------------------- pieces ---------------------------- */

function Person({ p, onOpen, chatter }: { p: Placed; onOpen: () => void; chatter?: string }) {
  const r = ROSTER[p.agent.id] || ROSTER.pulse;
  const [walking, setWalking] = useState(false);
  const last = useRef(`${p.spot.x},${p.spot.y}`);
  useEffect(() => {
    const k = `${p.spot.x},${p.spot.y}`;
    if (k !== last.current) { last.current = k; setWalking(true); const t = setTimeout(() => setWalking(false), 1600); return () => clearTimeout(t); }
  }, [p.spot.x, p.spot.y]);
  if (p.where === 'away') return null;
  const bubble = p.state === 'working' ? `${p.agent.current_task || r.task}…`
    : p.state === 'help' ? (p.agent.last_summary || 'I need a hand here')
    : p.where === 'reception' ? 'First day! 👋'
    : chatter;
  return (
    <button
      className={`dude s-${p.state} f-${p.spot.face || 'down'} ${walking ? 'walking' : ''}`}
      style={{ left: px(p.spot.x), top: py(p.spot.y), ['--shirt' as string]: r.shirt, ['--skin' as string]: r.skin, ['--hair' as string]: r.hair }}
      onClick={onOpen}
      aria-label={`${p.agent.name}: ${p.label}`}
    >
      <span className="dude-body"><span className="dude-arm l" /><span className="dude-arm r" /><span className="dude-head"><span className="dude-hair" /></span></span>
      {p.where === 'break' && p.spot === BREAK_SPOTS[0] && <span className="dude-cup" />}
      {p.where === 'reception' && <span className="dude-box" />}
      <span className="dude-name">{SHORT[p.agent.id] || p.agent.name.split(' ')[0]}</span>
      {bubble && <span className={`dude-bubble ${p.state === 'help' ? 'alert' : ''}`}>{bubble}</span>}
    </button>
  );
}

function Desk({ x, y, agent, state, onOpen }: { x: number; y: number; agent?: Agent; state?: StateKey; onOpen?: () => void }) {
  const lit = state === 'working' || state === 'help';
  const away = !agent ? 'Hiring: next agent' : !agent.enabled ? 'On leave' : null;
  return (
    <div className={`desk2 ${lit ? 'lit' : ''} ${state === 'help' ? 'alarm' : ''}`} style={{ left: px(x - 60), top: py(y - 74), width: px(120), height: py(56) }} onClick={onOpen} role={onOpen ? 'button' : undefined}>
      <div className="desk2-top">
        <span className="mon"><span className="mon-screen" /></span>
        <span className="kbd" />
        <span className="mug" />
        <span className="papers" />
      </div>
      {!(state === 'working' || state === 'help') && <span className="chair2" />}
      <span className="nameplate">{agent ? agent.name : 'Empty desk'}</span>
      {away && <span className="desk-sign">{away}</span>}
      {agent && state && agent.enabled && (state === 'offline' || state === 'break' || state === 'arriving') && (
        <span className="desk-sign soft">{state === 'arriving' ? `Starts ${fmtNext(nextRun(agent.id))}` : `Back ${fmtNext(nextRun(agent.id))}`}</span>
      )}
    </div>
  );
}

function Clock() {
  const [t, setT] = useState(istNow());
  useEffect(() => { const i = setInterval(() => setT(istNow()), 30000); return () => clearInterval(i); }, []);
  const h = t.getHours(), m = t.getMinutes();
  return (
    <div className="wallclock" style={{ left: px(820), top: py(6) }} aria-label="India time">
      <span className="h" style={{ transform: `rotate(${(h % 12) * 30 + m * 0.5}deg)` }} />
      <span className="m" style={{ transform: `rotate(${m * 6}deg)` }} />
    </div>
  );
}

function useDaylight() {
  const [t, setT] = useState(istNow());
  useEffect(() => { const i = setInterval(() => setT(istNow()), 60000); return () => clearInterval(i); }, []);
  const h = t.getHours();
  return { night: h < 6 || h >= 19, dusk: (h >= 17 && h < 19) || (h >= 5 && h < 7), day: DAYN[t.getDay()], time: t.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) };
}

/* ---------------------------- drawer ---------------------------- */

const COLOR: Record<string, string> = { ok: 'var(--ok)', warn: 'var(--warn)', error: 'var(--err)' };

export function AgentDrawer({ agent, runs, approvals, onClose, onToggle, onGoApprovals }: {
  agent: Agent; runs: Run[]; approvals: Approval[]; onClose: () => void; onToggle: (on: boolean) => void; onGoApprovals: () => void;
}) {
  const st = agentState(agent);
  const mine = runs.filter((x) => x.agent === agent.name).slice(0, 8);
  const items = approvals.filter((x) => x.agent === agent.name);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={`${agent.name} details`}>
        <div className="drawer-h">
          <div><h2 style={{ fontSize: 18, color: 'var(--navy)' }}>{agent.name}</h2><div className="sub">{agent.role}</div></div>
          <button className="x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="drawer-b">
          <div className="toggle">
            <button className={`switch ${agent.enabled ? 'on' : ''}`} onClick={() => onToggle(!agent.enabled)} aria-pressed={agent.enabled} aria-label="Agent on or off" />
            {agent.enabled ? 'On duty' : 'On leave (skips its shifts)'}
          </div>
          <dl className="kv">
            <dt>Status</dt><dd><b>{st.label}</b></dd>
            <dt>Schedule</dt><dd>{agent.schedule}</dd>
            <dt>Next shift</dt><dd>{fmtNext(nextRun(agent.id)) || '–'}</dd>
            <dt>Last shift</dt><dd>{agent.last_run ? `${fmt(agent.last_run)} (${ago(agent.last_run)})` : 'not yet'}</dd>
            <dt>Its drafts</dt><dd>{items.filter((x) => x.status === 'pending').length} waiting · {items.length} total</dd>
          </dl>
          <h3 style={{ fontSize: 14, marginBottom: 8 }}>Latest report</h3>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, marginBottom: 18 }}>{agent.last_summary || 'No report yet. It reports here after its first shift.'}</p>
          <h3 style={{ fontSize: 14, marginBottom: 8 }}>Recent shifts</h3>
          {mine.length ? mine.map((x) => (
            <div key={x.id} className="runline" style={{ borderColor: COLOR[x.status] || 'var(--ok)' }}><time>{fmt(x.at)}</time>{x.summary}</div>
          )) : <div className="empty">No shifts yet.</div>}
          <div className="actions" style={{ marginTop: 16 }}><button className="btn go" onClick={onGoApprovals}>See approvals</button></div>
        </div>
      </aside>
    </>
  );
}

/* ---------------------------- office ---------------------------- */

export default function Office({ agents, approvals, runs, onOpenAgent, onGoApprovals }: {
  agents: Agent[]; approvals: Approval[]; runs: Run[]; onOpenAgent: (id: string) => void; onGoApprovals: () => void;
}) {
  const [, tick] = useState(0);
  useEffect(() => { const i = setInterval(() => tick((n) => n + 1), 30000); return () => clearInterval(i); }, []);
  const [chat, setChat] = useState(0);
  useEffect(() => { const i = setInterval(() => setChat((n) => n + 1), 6000); return () => clearInterval(i); }, []);
  const light = useDaylight();

  const placed = place(agents);
  const byId = Object.fromEntries(placed.map((p) => [p.agent.id, p]));
  const pending = approvals.filter((a) => a.status === 'pending').length;
  const anyWorking = placed.some((p) => p.state === 'working');
  const breakers = placed.filter((p) => p.where === 'break');
  const today = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
  const shiftsToday = runs.filter((r) => new Date(new Date(r.at).getTime() + 330 * 60000).toISOString().slice(0, 10) === today).length;

  const star = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7);
    const score: Record<string, number> = {};
    approvals.filter((a) => (a.status === 'done' || a.status === 'approved') && (a.decided_at || a.created_at).slice(0, 7) === month)
      .forEach((a) => { if (a.agent) score[a.agent] = (score[a.agent] || 0) + 1; });
    const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
    return best ? { name: best[0], n: best[1] } : null;
  }, [approvals]);
  const starAgent = agents.find((a) => a.name === star?.name);

  return (
    <section>
      <div className="floor-wrap">
        <div className={`floor2 ${light.night ? 'night' : ''} ${light.dusk ? 'dusk' : ''}`} style={{ aspectRatio: `${W} / ${H}` }}>
          {/* windows along the top wall */}
          <div className="wall-top">{Array.from({ length: 9 }, (_, i) => <span key={i} className="win" />)}</div>
          <Clock />
          <div className="whiteboard" style={{ left: px(420), top: py(18), width: px(300), height: py(58) }}>
            <b>TODAY · {light.day}</b>
            <span>{pending} drafts waiting for owner</span>
            <span>{shiftsToday} shifts done · {placed.filter((p) => p.state === 'working').length} working now</span>
          </div>

          {/* owner's glass office */}
          <div className="room glass" style={{ left: px(20), top: py(60), width: px(250), height: py(250) }} onClick={onGoApprovals} role="button" aria-label={`Your office: ${pending} drafts waiting`}>
            <span className="room-tag">Owner's office</span>
            <div className="boss-desk"><span className="mon big"><span className="mon-screen" /></span><span className="inbox">{Array.from({ length: Math.min(pending, 7) }, (_, i) => <i key={i} style={{ bottom: `${i * 9}%` }} />)}</span></div>
            <span className="boss-chair" />
            <span className="plant p1" />
            <span className="frame-cert">DocuFast India<br /><small>Est. Mahabubnagar</small></span>
            {pending > 0 ? <span className="badge-pending">{pending} to approve · tap</span> : <span className="badge-clear">All clear ✓</span>}
          </div>

          {/* conference room */}
          <div className="room wood" style={{ left: px(20), top: py(335), width: px(250), height: py(365) }}>
            <span className="room-tag">Conference room</span>
            <div className="conf-table" />
            {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className={`conf-chair c${i}`} />)}
            <div className="screen-tv">{byId.growth?.where === 'meeting' ? 'Weekly growth review' : 'Mondays 9:23 am · Weekly review'}</div>
          </div>

          {/* bullpen */}
          <div className="room carpet" style={{ left: px(300), top: py(60), width: px(560), height: py(640) }}>
            <span className="room-tag">The floor</span>
          </div>
          {Object.entries(DESKS).map(([id, s]) => {
            const p = byId[id];
            return <Desk key={id} x={s.x} y={s.y} agent={p?.agent} state={p?.state} onOpen={p ? () => onOpenAgent(id) : undefined} />;
          })}
          <Desk x={SPARE_DESK.x} y={SPARE_DESK.y} />
          <div className={`copier ${anyWorking ? 'busy' : ''}`} style={{ left: px(370), top: py(585), width: px(150), height: py(80) }}>
            <span className="copier-brand">Docu<b>Fast</b> 9000</span>
            <span className="copier-paper" />
            <span className="copier-label">{anyWorking ? 'Printing…' : 'Ready'}</span>
          </div>
          <div className="cabinets" style={{ left: px(560), top: py(600), width: px(180), height: py(60) }}><i /><i /><i /></div>
          <span className="plant p2" style={{ left: px(800), top: py(620) }} />

          {/* break room */}
          <div className="room tile" style={{ left: px(890), top: py(60), width: px(290), height: py(330) }}>
            <span className="room-tag">Break room</span>
          </div>
          <div className="chai" style={{ left: px(960), top: py(80) }}><span className="steam2" /><b>CHAI</b></div>
          <div className="cooler" style={{ left: px(1090), top: py(150) }} />
          <div className="vending" style={{ left: px(1120), top: py(70) }} />
          <div className="break-table" style={{ left: px(960), top: py(265), width: px(100), height: py(70) }} />
          <div className="sofa" style={{ left: px(1080), top: py(320), width: px(90), height: py(55) }} />
          <div className="eotm" style={{ left: px(905), top: py(560) }}>
            <b>Agent of the month</b>
            <span className="eotm-face" style={{ ['--shirt' as string]: starAgent ? ROSTER[starAgent.id]?.shirt : '#94A3B8' }} />
            <span>{star ? `${star.name} · ${star.n} approved` : 'Up for grabs'}</span>
          </div>

          {/* reception */}
          <div className="room tile2" style={{ left: px(890), top: py(410), width: px(290), height: py(290) }}>
            <span className="room-tag">Reception</span>
          </div>
          <div className="front-desk" style={{ left: px(930), top: py(470), width: px(200), height: py(60) }}><b>Docu<span>Fast</span> India</b><small>Mahabubnagar</small></div>
          <div className="door" style={{ left: px(1010), top: py(690), width: px(90) }} />
          <span className="plant p3" style={{ left: px(1140), top: py(440) }} />

          {/* people */}
          {placed.map((p) => {
            const i = breakers.indexOf(p);
            const line = i >= 0 && (chat + i) % 3 === 0 ? (p.agent.last_summary && (chat + i) % 2 === 0 ? `“${p.agent.last_summary.slice(0, 60)}${p.agent.last_summary.length > 60 ? '…' : ''}”` : CHATTER[(chat + i) % CHATTER.length]) : undefined;
            return <Person key={p.agent.id} p={p} chatter={line} onOpen={() => onOpenAgent(p.agent.id)} />;
          })}

          {light.night && <div className="lights-note">Night shift · {light.time} IST</div>}
        </div>
      </div>
      <div className="swipe-hint">← Swipe to see the whole office →</div>
      <div className="legend">
        <span style={{ ['--c' as string]: 'var(--ok)' }}>At desk = working</span>
        <span style={{ ['--c' as string]: 'var(--gold)' }}>Break room = next shift within 3 h</span>
        <span style={{ ['--c' as string]: '#64748B' }}>Empty desk = off until next shift</span>
        <span style={{ ['--c' as string]: 'var(--navy)' }}>Reception = first day</span>
        <span style={{ ['--c' as string]: 'var(--err)' }}>Red bubble = needs help</span>
      </div>
    </section>
  );
}
