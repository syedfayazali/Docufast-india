import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { useControlData } from './lib/useControlData';
import { istNow } from './lib/time';
import Login from './views/Login';
import Office, { AgentDrawer } from './views/Office';
import Approvals from './views/Approvals';
import Social from './views/Social';
import Numbers from './views/Numbers';
import { IcChart, IcCheck, IcOffice, IcSocial } from './components/Icons';

type View = 'office' | 'approvals' | 'social' | 'numbers';
const VIEWS: { id: View; label: string; icon: () => React.ReactElement; title: string; sub: string }[] = [
  { id: 'office', label: 'Office', icon: IcOffice, title: 'Agent office', sub: 'Your agents work on their own. Tap a desk to see its work.' },
  { id: 'approvals', label: 'Approvals', icon: IcCheck, title: 'Approvals', sub: 'Nothing goes out until you approve it.' },
  { id: 'social', label: 'Social', icon: IcSocial, title: 'Social media', sub: 'Live followers and reach across your accounts.' },
  { id: 'numbers', label: 'Numbers', icon: IcChart, title: 'Numbers & activity', sub: 'Daily business pulse, growth and agent shifts.' },
];

function viewFromHash(): View {
  const h = window.location.hash.slice(1) as View;
  return VIEWS.some((v) => v.id === h) ? h : 'office';
}

function Dashboard({ session }: { session: Session }) {
  const d = useControlData();
  const [view, setView] = useState<View>(viewFromHash());
  const [agentId, setAgentId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [clock, setClock] = useState(istNow());

  useEffect(() => { const i = setInterval(() => setClock(istNow()), 30000); return () => clearInterval(i); }, []);
  useEffect(() => { const f = () => setView(viewFromHash()); window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f); }, []);

  const go = (v: View) => { window.location.hash = v; setView(v); setAgentId(null); window.scrollTo({ top: 0 }); };
  const toast = useCallback((m: string) => { setToastMsg(m); window.setTimeout(() => setToastMsg(null), 3200); }, []);

  const pending = d.approvals.filter((a) => a.status === 'pending').length;
  const working = d.agents.filter((a) => a.status === 'running').length;
  const runs24 = d.runs.filter((r) => Date.now() - new Date(r.at).getTime() < 86400000).length;
  const meta = VIEWS.find((v) => v.id === view)!;
  const agent = d.agents.find((a) => a.id === agentId) || null;
  useEffect(() => { document.title = pending ? `(${pending}) DocuFast Control Room` : 'DocuFast Control Room'; }, [pending]);

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand"><div className="mark">DF</div><div><b>Control Room</b><small>DocuFast India</small></div></div>
        {VIEWS.map((v) => (
          <button key={v.id} className={`nav ${view === v.id ? 'on' : ''}`} onClick={() => go(v.id)} aria-current={view === v.id}>
            <v.icon /> {v.label} {v.id === 'approvals' && pending > 0 && <span className="count">{pending}</span>}
          </button>
        ))}
        <div className="side-foot">
          <span>Signed in as<br /><b style={{ color: '#fff' }}>{session.user.email}</b></span>
          <button onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div><h2>{meta.title}</h2><div className="sub">{meta.sub}</div></div>
          <div className="pills">
            <span className="pill">IST {clock.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</span>
            <span className={`pill ${d.conn === 'live' ? 'on' : ''}`}><span className="dot" />{d.conn === 'live' ? 'Live' : d.conn === 'connecting' ? 'Connecting…' : 'Reconnecting…'}</span>
          </div>
        </div>
        {d.error && <div className="banner err">Couldn't load your data ({d.error}). <button className="btn" onClick={d.reload}>Try again</button></div>}
        {view === 'office' && (
          <div className="stats">
            <div className="stat"><b>{pending}</b><span>Waiting for you</span></div>
            <div className="stat"><b>{working}</b><span>Agents working now</span></div>
            <div className="stat"><b>{runs24}</b><span>Shifts in last 24 h</span></div>
            <div className="stat"><b>{d.agents.filter((a) => a.enabled).length}/{d.agents.length}</b><span>Agents on duty</span></div>
          </div>
        )}
        {view === 'office' && <Office agents={d.agents} approvals={d.approvals} runs={d.runs} onOpenAgent={setAgentId} onGoApprovals={() => go('approvals')} />}
        {view === 'approvals' && <Approvals approvals={d.approvals} update={d.updateApproval} toast={toast} />}
        {view === 'social' && <Social history={d.history} />}
        {view === 'numbers' && <Numbers kpis={d.kpis} runs={d.runs} agents={d.agents} history={d.history} />}
      </main>

      <nav className="mobile-nav" aria-label="Sections">
        {VIEWS.map((v) => (
          <button key={v.id} className={view === v.id ? 'on' : ''} onClick={() => go(v.id)}>
            <v.icon />{v.label}{v.id === 'approvals' && pending > 0 && <span className="count">{pending}</span>}
          </button>
        ))}
      </nav>

      {agent && (
        <AgentDrawer agent={agent} runs={d.runs} approvals={d.approvals} onClose={() => setAgentId(null)}
          onToggle={(on) => d.setAgentEnabled(agent.id, on).then(() => toast(on ? `${agent.name} is back on duty` : `${agent.name} switched off`)).catch(() => toast('Could not save.'))}
          onGoApprovals={() => go('approvals')} />
      )}
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </div>
  );
}

const DEMO = import.meta.env.DEV && new URLSearchParams(window.location.search).has('demo');

export default function App() {
  if (DEMO) return <Dashboard session={{ user: { email: 'demo@docufast' } } as unknown as Session} />;
  return <AuthedApp />;
}

function AuthedApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setAllowed(null); return; }
    supabase.from('cr_owners').select('email').limit(1).then(({ data }) => {
      const ok = !!data && data.length > 0;
      setAllowed(ok);
      if (!ok) supabase.auth.signOut();
    });
  }, [session]);

  if (session === undefined || (session && allowed === null)) return <div className="center">Loading…</div>;
  if (!session || allowed === false) return <Login denied={allowed === false ? 'That account is not allowed into this dashboard. Sign in with the DocuFast owner account.' : null} />;
  return <Dashboard session={session} />;
}
