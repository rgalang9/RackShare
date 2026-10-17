import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { getSupabaseConfigError } from './lib/supabaseConfig';
import './styles/global.css';

const root = createRoot(document.getElementById('root')!);

// A bad Supabase URL throws when the client is imported, so check before loading the app.
const configError = getSupabaseConfigError();

if (configError) {
  root.render(
    <div style={{ maxWidth: 560, margin: '15vh auto', padding: '0 16px', fontFamily: 'var(--font-body)' }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Rack Share isn’t configured yet</h1>
      <p style={{ color: 'var(--text-muted)' }}>{configError}</p>
      <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>
        Find both values in Supabase → Project Settings → API. Set them in <code>.env</code> locally (then restart{' '}
        <code>npm run dev</code>) and in Vercel → Settings → Environment Variables (then redeploy).
      </p>
    </div>,
  );
} else {
  void import('./App').then(({ App }) =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  );
}
