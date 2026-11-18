import { useState } from 'react';
import { supabase } from '../lib/supabase';

const G = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
  </svg>
);

const GOOGLE_ON = import.meta.env.VITE_GOOGLE_LOGIN === 'on';

export default function Login({ denied }: { denied?: string | null }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(denied ? { ok: false, text: denied } : null);
  const redirectTo = window.location.origin;

  const google = async () => {
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, queryParams: { prompt: 'select_account' } } });
    if (error) { setBusy(false); setMsg({ ok: false, text: 'Google sign-in is not switched on yet. Use the email link below for now.' }); }
  };

  const magic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo, shouldCreateUser: true } });
    setBusy(false);
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: 'Check your inbox and tap the sign-in link. You can close this tab.' });
  };

  return (
    <div className="login">
      <div className="login-card">
        <div className="mark">DF</div>
        <h1>DocuFast Control Room</h1>
        <p>Your agents work around the clock. Sign in to see what they did and approve their drafts.</p>
        {GOOGLE_ON && <>
          <button className="gbtn" onClick={google} disabled={busy}><G /> Continue with Google</button>
          <div className="or">or</div>
        </>}
        <form onSubmit={magic}>
          <input className="field" type="email" autoComplete="email" placeholder="docufast.india@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn go" style={{ width: '100%', justifyContent: 'center', padding: 12, borderRadius: 12 }} disabled={busy}>Email me a sign-in link</button>
        </form>
        {msg && <div className={`login-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
        <div className="login-note">Private dashboard. Only the DocuFast owner account can see the data.</div>
      </div>
    </div>
  );
}
