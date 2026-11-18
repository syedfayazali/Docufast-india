const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
export const IcOffice = () => <svg viewBox="0 0 24 24" {...s}><rect x="3" y="10" width="18" height="4" rx="1"/><path d="M6 14v6M18 14v6M9 10V6h6v4"/></svg>;
export const IcCheck = () => <svg viewBox="0 0 24 24" {...s}><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg>;
export const IcSocial = () => <svg viewBox="0 0 24 24" {...s}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>;
export const IcChart = () => <svg viewBox="0 0 24 24" {...s}><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>;
export const ICON = {
  ig: <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#fff"/></svg>,
  fb: <svg viewBox="0 0 24 24" fill="#fff"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6Z"/></svg>,
  yt: <svg viewBox="0 0 24 24" fill="#fff"><path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>,
  th: <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M16.5 11.5c-.6-3-3-4-5-3.6-2.4.5-3 3.1-1.6 4.4 1.9 1.7 6.4.9 6.6-2.5"/><path d="M17.5 8.5C16.4 5.3 14 4 11.6 4 7 4 4.5 7.6 4.5 12s2.5 8 7.1 8c3.6 0 6.3-2 6.9-5"/></svg>,
  g: <svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>,
  wa: <svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3 1 2.6 1.1 2.7a11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.3Z"/></svg>,
  web: <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 0 0 18 14 14 0 0 0 0-18Z"/></svg>,
};
