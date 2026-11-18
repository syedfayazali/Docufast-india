import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import type { Agent, Approval, Run, Kpis, KpiDay } from './types';

type Conn = 'connecting' | 'live' | 'reconnecting';

export function useControlData() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [history, setHistory] = useState<KpiDay[]>([]);
  const [conn, setConn] = useState<Conn>('connecting');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('demo')) {
      const m = await import('./demo');
      setAgents(m.agents); setApprovals(m.approvals); setRuns(m.runs); setKpis(m.kpis); setHistory(m.history); setConn('live'); return;
    }
    const [a, ap, r, k, h] = await Promise.all([
      supabase.from('cr_agents').select('*').order('sort'),
      supabase.from('cr_approvals').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('cr_runs').select('*').order('at', { ascending: false }).limit(60),
      supabase.from('cr_kpis').select('*').eq('id', 'latest').maybeSingle(),
      supabase.from('cr_kpi_history').select('day,data').order('day').limit(120),
    ]);
    const firstErr = a.error || ap.error || r.error || k.error || h.error;
    if (firstErr) setError(firstErr.message); else setError(null);
    if (a.data) setAgents(a.data as Agent[]);
    if (ap.data) setApprovals(ap.data as Approval[]);
    if (r.data) setRuns(r.data as Run[]);
    setKpis((k.data as Kpis) ?? null);
    if (h.data) setHistory(h.data as KpiDay[]);
  }, []);

  useEffect(() => {
    load();
    let t: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => { clearTimeout(t); t = setTimeout(load, 250); };
    const ch = supabase
      .channel('control-room')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cr_agents' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cr_approvals' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cr_runs' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cr_kpis' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cr_kpi_history' }, refresh)
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') { setConn('live'); load(); }
        else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT' || s === 'CLOSED') setConn('reconnecting');
      });
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    const poll = setInterval(load, 5 * 60000);
    return () => { supabase.removeChannel(ch); window.removeEventListener('focus', onFocus); clearInterval(poll); clearTimeout(t); };
  }, [load]);

  const updateApproval = useCallback(async (id: string, patch: Partial<Approval>) => {
    setApprovals((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    const { error } = await supabase.from('cr_approvals').update({ ...patch, decided_at: new Date().toISOString() }).eq('id', id);
    if (error) { await load(); throw error; }
  }, [load]);

  const setAgentEnabled = useCallback(async (id: string, enabled: boolean) => {
    setAgents((list) => list.map((x) => (x.id === id ? { ...x, enabled } : x)));
    const { error } = await supabase.from('cr_agents').update({ enabled }).eq('id', id);
    if (error) { await load(); throw error; }
  }, [load]);

  return { agents, approvals, runs, kpis, history, conn, error, reload: load, updateApproval, setAgentEnabled };
}
