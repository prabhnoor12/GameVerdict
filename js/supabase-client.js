/**
 * Supabase client. The project is configured via build-time
 * VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (or stored overrides);
 * `connect()` runs at boot and every caller assumes a live client.
 * A missing config is an error, never a silent offline mode.
 */

const LS_URL = 'gv:supabase:url';
const LS_KEY = 'gv:supabase:anon';

let client = null;
let cachedConfig = null;
let connectPromise = null;

function readStored() {
  try {
    return {
      url: localStorage.getItem(LS_URL) || import.meta.env?.VITE_SUPABASE_URL || '',
      anonKey: localStorage.getItem(LS_KEY) || import.meta.env?.VITE_SUPABASE_ANON_KEY || ''
    };
  } catch {
    return { url: '', anonKey: '' };
  }
}

export function isConfigured() {
  const s = readStored();
  return !!(s.url && s.anonKey);
}

export function getConfig() {
  return cachedConfig || { url: '', anonKey: '', source: 'none' };
}

/** Connect (and persist overrides). Returns { ok, error? }. Safe to call twice. */
export async function connect(input) {
  if (connectPromise) return connectPromise;
  connectPromise = (async () => {
    const stored = readStored();
    const url = (input?.url || stored.url || '').trim().replace(/\/+$/, '');
    const anonKey = (input?.anonKey || stored.anonKey || '').trim();
    if (!url || !anonKey) {
      connectPromise = null;
      return { ok: false, error: 'Supabase is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
    }
    try {
      const { createClient } = await import('@supabase/supabase-js');
      client = createClient(url, anonKey);
      // Auth probe: no session yet is fine, network failure is not.
      const { error } = await client.auth.getSession();
      if (error) throw error;
      cachedConfig = { url, anonKey, source: input?.url ? 'settings' : 'env' };
      if (input?.url) {
        try {
          localStorage.setItem(LS_URL, url);
          localStorage.setItem(LS_KEY, anonKey);
        } catch { /* private mode: session-only */ }
      }
      return { ok: true };
    } catch (err) {
      client = null;
      cachedConfig = null;
      connectPromise = null;
      return { ok: false, error: err?.message || 'Could not reach that Supabase project.' };
    }
  })();
  return connectPromise;
}

/** The live client, or null when connect() has not succeeded yet. */
export function db() {
  return client;
}

/** Current user id, or null when signed out. */
export async function currentUserId() {
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data?.user?.id || null;
}

/** Current user email, or null when signed out. */
export async function currentUserEmail() {
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data?.user?.email || null;
}

/** Minimal email sanity check for the sign-in form. Pure — covered by tests. */
export function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
}

/** Magic-link sign-in. Returns { ok, error? }. Caller validates the email first. */
export async function signInWithEmail(email) {
  if (!client) return { ok: false, error: 'Cloud sync is unavailable — reload and try again.' };
  const redirectTo = typeof location !== 'undefined'
    ? location.origin + location.pathname
    : undefined;
  const { error } = await client.auth.signInWithOtp({
    email: String(email).trim(),
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Sign out on this device. */
export async function signOutUser() {
  if (!client) return { ok: true };
  const { error } = await client.auth.signOut();
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Live auth subscription. No-ops until connect() succeeds. */
export function onAuthChange(cb) {
  if (!client) return () => {};
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    cb(session?.user || null);
  });
  return () => data?.subscription?.unsubscribe();
}
