import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Loads the Google Identity Services script exactly once, no matter how many
 * buttons mount. Returns a promise that resolves when `window.google` is ready.
 */
let gsiLoaderPromise = null;
function loadGoogleScript() {
  if (typeof window !== 'undefined' && window.google?.accounts?.id) {
    return Promise.resolve();
  }
  if (gsiLoaderPromise) return gsiLoaderPromise;

  gsiLoaderPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-gsi-script');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('gsi load error')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
    document.head.appendChild(script);
  });
  return gsiLoaderPromise;
}

/** Inline Google "G" mark for the fallback button (shown when no client ID is set). */
const GoogleGlyph = () => (
  <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

/**
 * "Sign in with Google" button.
 *
 * When VITE_GOOGLE_CLIENT_ID is configured it renders the official Google
 * Identity Services button and completes sign-in through our backend
 * (`POST /api/auth/google`). When it is not configured (or the script fails to
 * load) it degrades to a clearly-labelled inactive button so the layout stays
 * intact and the developer knows what to set.
 */
export const GoogleSignInButton = ({ onError, text = 'signin_with' }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const containerRef = useRef(null);
  const busyRef = useRef(false);
  const [rendered, setRendered] = useState(false);
  const [failed, setFailed] = useState(false);

  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!clientId) return undefined;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          callback: async (response) => {
            if (busyRef.current) return;
            if (!response?.credential) {
              onError?.('Google did not return a credential. Please try again.');
              return;
            }
            busyRef.current = true;
            try {
              onError?.('');
              const account = await loginWithGoogle(response.credential);
              navigate(account?.role === 'ROLE_ADMIN' ? '/admin/dashboard' : '/dashboard');
            } catch (err) {
              onError?.(err.message || 'Google sign-in failed. Please try again.');
            } finally {
              busyRef.current = false;
            }
          },
        });

        const measured = containerRef.current.offsetWidth || 320;
        const width = Math.max(220, Math.min(measured, 400));
        containerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          text,
          shape: 'pill',
          logo_alignment: 'center',
          width,
        });
        setRendered(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // No client ID configured — show an inactive, self-explaining button.
  if (!clientId) {
    return (
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() =>
            onError?.(
              'Google Sign-In is not configured yet. Add VITE_GOOGLE_CLIENT_ID to the frontend .env and GOOGLE_CLIENT_ID on the backend.'
            )
          }
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
          title="Set VITE_GOOGLE_CLIENT_ID to enable Google Sign-In"
        >
          <GoogleGlyph />
          Continue with Google
        </button>
        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
          Set <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* GIS renders its official button into this container. */}
      <div ref={containerRef} className="flex justify-center min-h-[44px]" />
      {failed && (
        <p className="text-[11px] text-center text-red-500">
          Couldn't load Google Sign-In. Check your connection and refresh.
        </p>
      )}
      {!rendered && !failed && (
        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
          Loading Google Sign-In…
        </p>
      )}
    </div>
  );
};

export default GoogleSignInButton;
