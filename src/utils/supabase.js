import { createClient } from '@supabase/supabase-js'

/**
 * Password security: never hash passwords in the browser. This client sends the
 * password to Supabase over HTTPS; Supabase Auth stores a salted hash server-side
 * (industry-standard key derivation). Client-side hashing would not replace this.
 */

const url = import.meta.env.VITE_SUPABASE_URL ?? ''
const key =
  import.meta.env.VITE_SUPABASE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_API_KEY ??
  ''

/** Absolute URL for email confirmation / magic links (respects Vite `base`). */
export function getAuthRedirectUrl() {
  if (typeof window === 'undefined') return undefined
  return new URL(import.meta.env.BASE_URL, window.location.origin).href
}

/** Browser client; `public.users` / `public.wallet` rows use the same id as `auth.users`. */
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export function isSupabaseConfigured() {
  return Boolean(url && key)
}

/**
 * Register with email + password (Supabase Auth).
 * On success, `data.user.id` aligns with `public.users.id` if you sync via trigger or insert after signup.
 */
export async function registerWithEmail(email, password, options = {}) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      ...options,
    },
  })
}

/** Log in with email + password. */
export async function loginWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function logout() {
  return supabase.auth.signOut()
}

export function getSession() {
  return supabase.auth.getSession()
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}
