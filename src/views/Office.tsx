import { useEffect, useState } from 'react';
import type { Agent, Approval, Run } from '../lib/types';
import { ROSTER, agentState, fmtNext, nextRun } from '../lib/roster';
import { DAYN, ago, fmt, istNow } from '../lib/time';

function Sky() {
  const [t, setT] = useState(istNow());
  useEffect(() => { const i = setInterval(() => setT(istNow()), 30000); return () => clearInterval(i); }, []);
  const h = t.getHours(), m = t.getMinutes();
  const day = h >= 6 && h < 18, dusk = (h >= 17 && h < 19) || (h >= 5 && h < 7);
  const frac = day ? (h - 6 + m / 60) / 12 : (((h + 6) % 24) + m / 60) / 12;
  return (
    <div className="wall">
      <div className="window" aria-hidden="true">
        <div className="sky" style={{ background: day ? (dusk ? 'linear-gradient(180deg,#FDBA74,#FDE68A)' : 'linear-gradient(180deg,#60A5FA,#BFDBFE)') : 'linear-gradient(180deg,#0B1736,#1E3A8A)' }} />
        <div className="sun" style={{ left: 10 + frac * 160, top: 60 - Math.sin(frac * Math.PI) * 46, background: day ? '#FDE047' : '#E2E8F0', boxShadow: day ? '0 0 18px #FDE047' : '0 0 10px #E2E8F0' }} />
        <div className="cloud" style={{ top: 16 }} /><div className="cloud" style={{ top: 52, animationDelay: '-13s' }} />
      </div>
      <div className="wall-sign">Docu<span>Fast</span> India<small>Agent office · Mahabubnagar</small></div>
      <div>
        <div className="clock" aria-label={`India time ${t.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`}>
          <div className="h" style={{ transform: `rotate(${(h % 12) * 30 + m * 0.5}deg)` }} />
          <div className="m" style={{ transform: `rotate(${m * 6}deg)` }} />
        </div>
        <div className="clock-label">{DAYN[t.getDay()]} · IST</div>
      </div>
    </div>
  );
}

function Desk({ agent, onOpen }: { agent: Agent; onOpen: () => void }) {
  const r = ROSTER[agent.id] || ROSTER.pulse;
  const st = agentState(agent);
  const bubble = st.key === 'working' ? `${agent.current_task || r.task}…` : st.key === 'help' ? agent.last_summary || 'Something went wrong' : '';
  return (
    <button className={`desk st-${st.key}`} onClick={onOpen} aria-label={`${agent.name}: ${st.label}`}>
      <div className="lamp" /><div className="rug" />
      <div className="badge-name">{agent.name}</div>
      <div className="chair" />
      <div className="person" style={{ ['--shirt' as string]: r.shirt, ['--skin' as string]: r.skin, ['--hair' as string]: r.hair }}>
        <div className="head" /><div className="hair" /><div className="torso" /><div className="arm l" /><div className="arm r" />
      </div>
      <div className="table" />
      <div className="monitor"><div className="screen"><div className="code">{Array.from({ length: 14 }, (_, i) => <i key={i} />)}</div><div className="saver">DF</div></div></div>
      <div className="prop coffee"><div className="steam" /></div>
      <div className="prop zzz">z z</div>
      <div className="bubble">{bubble}</div>
      <div className="chip">{st.label}</div>
    </button>
  );
}

function BossDesk({ pending, onOpen }: { pending: number; onOpen: () => void }) {
  return (
    <button className="desk boss" onClick={onOpen} aria-label={`Your desk: ${pending} approvals waiting`}>
      <div className="lamp" /><div className="rug" />
      <div className="badge-name">Your desk</div>
      <div className="chair" />
      <div className="table" />
      <div className="monitor"><div className="screen"><div className="saver">{pending}</div></div></div>
      <div className="tray">{Array.from({ length: Math.min(pending, 6) }, (_, i) => <div key={i} className="paper" style={{ bottom: 8 + i * 5 }} />)}</div>
      {pending > 0 && <div className="inbox-count">{pending} to approve</div>}
      <div className="chip" style={{ color: 'var(--navy)' }}>{pending ? 'Tap to review' : 'All clear'}</div>
    </button>
  );
}

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
            {agent.enabled ? 'On duty' : 'Switched off (skips its shifts)'}
          </div>
          <dl className="kv">
            <dt>Status</dt><dd><b>{st.label}</b></dd>
            <dt>Schedule</dt><dd>{agent.schedule}</dd>
            <dt>Next shift</dt><dd>{fmtNext(nextRun(agent.id)) || '–'}</dd>
            <dt>Last run</dt><dd>{agent.last_run ? `${fmt(agent.last_run)} (${ago(agent.last_run)})` : 'not yet'}</dd>
            <dt>Its items</dt><dd>{items.filter((x) => x.status === 'pending').length} pending · {items.length} total</dd>
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

export default function Office({ agents, approvals, onOpenAgent, onGoApprovals }: {
  agents: Agent[]; approvals: Approval[]; onOpenAgent: (id: string) => void; onGoApprovals: () => void;
}) {
  const [, tick] = useState(0);
  useEffect(() => { const i = setInterval(() => tick((n) => n + 1), 60000); return () => clearInterval(i); }, []);
  const pending = approvals.filter((a) => a.status === 'pending').length;
  return (
    <section>
      <div className="office">
        <Sky />
        <div className="floor">
          <div className="desks">
            <BossDesk pending={pending} onOpen={onGoApprovals} />
            {agents.map((a) => <Desk key={a.id} agent={a} onOpen={() => onOpenAgent(a.id)} />)}
          </div>
        </div>
      </div>
      <div className="legend">
        <span style={{ ['--c' as string]: 'var(--ok)' }}>Working now</span>
        <span style={{ ['--c' as string]: 'var(--gold)' }}>On break (next shift within 3 h)</span>
        <span style={{ ['--c' as string]: '#64748B' }}>Offline (next shift later)</span>
        <span style={{ ['--c' as string]: 'var(--err)' }}>Needs help</span>
      </div>
    </section>
  );
}
