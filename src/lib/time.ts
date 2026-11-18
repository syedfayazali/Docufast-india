export const DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Current wall-clock time in India, as a Date whose local fields read IST. */
export function istNow(): Date {
  const d = new Date();
  return new Date(d.getTime() + (330 + d.getTimezoneOffset()) * 60000);
}

export function ago(iso?: string | null): string {
  if (!iso) return 'never';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (isNaN(s)) return '–';
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

export function fmt(iso?: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export function num(v: unknown): string {
  return typeof v === 'number' && isFinite(v) ? v.toLocaleString('en-IN') : '–';
}
