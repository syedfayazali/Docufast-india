export type AgentStatus = 'idle' | 'running' | 'ok' | 'warn' | 'error';

export interface Agent {
  id: string; name: string; role: string | null; schedule: string | null; sort: number;
  enabled: boolean; status: AgentStatus; current_task: string | null;
  started_at: string | null; last_run: string | null; last_summary: string | null;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'done';

export interface Approval {
  id: string; agent: string | null; type: string | null; priority: string | null;
  title: string; why: string | null; body: string | null; how_to: string | null;
  meta: Record<string, unknown>; status: ApprovalStatus; edited: boolean;
  result: string | null; created_at: string; decided_at: string | null;
}

export interface Run { id: string; agent: string; at: string; status: string; summary: string | null; }

export interface Metric { label: string; value: string; delta?: string; trend?: 'up' | 'down' | 'flat'; }

export interface Kpis { id: string; updated_at: string; metrics: Metric[]; }

export interface KpiDay { day: string; data: Record<string, number>; }
