/**
 * Lazy Supabase client. Disconnected by default: every export is safe to call
 * with no credentials configured — reads report `configured: false` and
 * writes resolve `{ skipped: true }` without touching the network.
 *
 * Connection arrives later via `connect({ url, anonKey })` (persisted to
 * localStorage) or the VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY build vars.
 */

const LS_URL = 'gv:supabase:url';
const LS_KEY = 'gv:supabase:anon';

let client = null;
let cachedConfig = null;

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
  return !!(cachedConfig?.url && cachedConfig?.anonKey && client);
}

export function getConfig() {
  return cachedConfig || { url: '', anonKey: '', source: 'none' };
}

/** Connect (and persist). Returns { ok, error? }. Safe to call twice. */
export async function connect(input) {
  const url = (input?.url || readStored().url || '').trim().replace(/\/+$/, '');
  const anonKey = (input?.anonKey || readStored().anonKey || '').trim();
  if (!url || !anonKey) {
    return { ok: false, error: 'Paste your Supabase project URL and anon key first.' };
  }
  try {
    const { createClient } = await import('@supabase/supabase-js');
    client = createClient(url, anonKey);
    // Cheap auth probe: no session yet is fine, network failure is not.
    const { error } = await client.auth.getSession();
    if (error) throw error;
    cachedConfig = { url, anonKey, source: input?.url ? 'settings' : 'stored' };
    try {
      localStorage.setItem(LS_URL, url);
      localStorage.setItem(LS_KEY, anonKey);
    } catch { /* private mode: session-only */ }
    return { ok: true };
  } catch (err) {
    client = null;
    cachedConfig = null;
    return { ok: false, error: err?.message || 'Could not reach that Supabase project.' };
  }
}

export function disconnect() {
  client = null;
  cachedConfig = null;
  try {
    localStorage.removeItem(LS_URL);
    localStorage.removeItem(LS_KEY);
  } catch { /* noop */ }
}

/** The live client, or null when disconnected. Callers must null-check. */
export function db() {
  return client;
}

/** Current user id, or null (signed out / disconnected). */
export async function currentUserId() {
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data?.user?.id || null;
}
