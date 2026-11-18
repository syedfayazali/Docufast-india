import { DAYN, istNow } from './time';
import type { Agent } from './types';

export interface RosterEntry { shirt: string; skin: string; hair: string; days: number[]; h: number; m: number; task: string; }

export const ROSTER: Record<string, RosterEntry> = {
  pulse:   { shirt: '#2563EB', skin: '#C68A5E', hair: '#1F2937', days: [0, 1, 2, 3, 4, 5, 6], h: 8,  m: 12, task: "Collecting today's numbers" },
  ops:     { shirt: '#0891B2', skin: '#8D5A3B', hair: '#111827', days: [0, 1, 2, 3, 4, 5, 6], h: 13, m: 7,  task: 'Checking the print app' },
  content: { shirt: '#DB2777', skin: '#D8A07A', hair: '#3F2A1E', days: [1, 2, 3, 4, 5, 6],    h: 18, m: 37, task: "Writing tomorrow's reel" },
  replies: { shirt: '#7C3AED', skin: '#B07450', hair: '#0F172A', days: [0, 1, 2, 3, 4, 5, 6], h: 20, m: 41, task: 'Drafting Instagram replies' },
  growth:  { shirt: '#16A34A', skin: '#C9915F', hair: '#4B3621', days: [1],                   h: 9,  m: 23, task: 'Preparing the weekly report' },
  reviews: { shirt: '#F59E0B', skin: '#A86B47', hair: '#1C1917', days: [1, 2, 3, 4, 5, 6],    h: 10, m: 47, task: 'Chasing new Google reviews' },
  radar:   { shirt: '#DC2626', skin: '#CF9A6E', hair: '#292524', days: [1, 4],                h: 11, m: 17, task: 'Scanning upcoming deadlines' },
};

export function nextRun(id: string): Date | null {
  const r = ROSTER[id];
  if (!r) return null;
  const now = istNow();
  for (let i = 0; i < 8; i++) {
    const t = new Date(now);
    t.setDate(now.getDate() + i);
    t.setHours(r.h, r.m, 0, 0);
    if (r.days.includes(t.getDay()) && t > now) return t;
  }
  return null;
}

export function fmtNext(t: Date | null): string {
  if (!t) return '';
  const now = istNow();
  const tm = t.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  if (t.toDateString() === now.toDateString()) return tm;
  const tom = new Date(now); tom.setDate(now.getDate() + 1);
  return t.toDateString() === tom.toDateString() ? `tomorrow ${tm}` : `${DAYN[t.getDay()]} ${tm}`;
}

export type StateKey = 'working' | 'break' | 'offline' | 'help' | 'arriving';

export function agentState(a: Agent): { key: StateKey; label: string } {
  if (!a.enabled) return { key: 'offline', label: 'Switched off' };
  const started = a.started_at ? new Date(a.started_at).getTime() : 0;
  if (a.status === 'running' && Date.now() - started < 45 * 60000) return { key: 'working', label: 'Working now' };
  if (a.status === 'error') return { key: 'help', label: 'Needs help' };
  const nx = nextRun(a.id);
  if (!a.last_run) return { key: 'arriving', label: `First shift ${fmtNext(nx)}` };
  const hrs = nx ? (nx.getTime() - istNow().getTime()) / 3600000 : 99;
  if (hrs <= 3) return { key: 'break', label: `On break · back ${fmtNext(nx)}` };
  return { key: 'offline', label: `Offline · back ${fmtNext(nx)}` };
}
