import type { Agent, Approval, Run, Kpis, KpiDay } from './types';
const now = Date.now();
export const agents: Agent[] = [
  { id: 'pulse', name: 'Morning Pulse', role: 'Daily numbers', schedule: 'Daily 8:12 am', sort: 1, enabled: true, status: 'ok', current_task: null, started_at: null, last_run: new Date(now - 9 * 3600e3).toISOString(), last_summary: 'All sources read. Reach up 12%.' },
  { id: 'ops', name: 'App Ops Watch', role: 'App health', schedule: 'Daily 1:07 pm', sort: 2, enabled: true, status: 'running', current_task: 'Checking the print app', started_at: new Date(now - 60e3).toISOString(), last_run: null, last_summary: null },
  { id: 'content', name: 'Content Studio', role: 'Reels', schedule: 'Mon–Sat 6:37 pm', sort: 3, enabled: true, status: 'ok', current_task: null, started_at: null, last_run: new Date(now - 24 * 3600e3).toISOString(), last_summary: 'Drafted the PAN–Aadhaar reel.' },
  { id: 'replies', name: 'Reply Desk', role: 'Replies', schedule: 'Daily 8:41 pm', sort: 4, enabled: true, status: 'error', current_task: null, started_at: null, last_run: new Date(now - 20 * 3600e3).toISOString(), last_summary: 'Instagram comments could not be read.' },
  { id: 'growth', name: 'Growth Strategist', role: 'Weekly', schedule: 'Mondays 9:23 am', sort: 5, enabled: false, status: 'ok', current_task: null, started_at: null, last_run: new Date(now - 50 * 3600e3).toISOString(), last_summary: 'Weekly report ready.' },
];
export const approvals: Approval[] = [
  { id: 'a1', agent: 'Growth Strategist', type: 'task', priority: 'high', title: 'Change your Google Business category to Print shop', why: 'Main reason you miss xerox searches.', body: 'Google Business Profile → Edit profile → Business category\nPrimary: Print shop', how_to: 'Do it, then Mark done.', meta: {}, status: 'pending', edited: false, result: null, created_at: new Date(now - 3600e3).toISOString(), decided_at: null },
  { id: 'a2', agent: 'Reply Desk', type: 'instagram_reply', priority: null, title: 'Reply to @ravi: "PAN card kitne din me aata hai?"', why: 'Comment from today', body: 'Namaste Ravi ji! Usually 7–15 din lagte hain. Details ke liye WhatsApp karein 83749 68022 🙏', how_to: null, meta: { commentId: '1' }, status: 'approved', edited: false, result: null, created_at: new Date(now - 7200e3).toISOString(), decided_at: null },
];
export const runs: Run[] = [{ id: 'r1', agent: 'Morning Pulse', at: new Date(now - 9 * 3600e3).toISOString(), status: 'ok', summary: 'All sources read. Reach up 12%.' }];
export const kpis: Kpis = { id: 'latest', updated_at: new Date(now - 9 * 3600e3).toISOString(), metrics: [{ label: 'Google rating', value: '5.0★', delta: '37 reviews', trend: 'flat' }, { label: 'Checkout abandoned', value: '47%', delta: 'Paytm 73%', trend: 'down' }] };
export const history: KpiDay[] = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((d, i) => ({ day: new Date(now - d * 864e5).toISOString().slice(0, 10), data: { igFollowers: 880 + i * 4, googleReviews: 33 + Math.floor(i / 3), ytSubscribers: 15 + Math.floor(i / 2) } }));
