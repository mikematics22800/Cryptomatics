import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL ?? ""
const key = import.meta.env.VITE_SUPABASE_API_KEY ?? ""

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export function getAuthRedirectUrl() {
  if (typeof window === "undefined") return undefined
  const explicit = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim()
  if (explicit) {
    return explicit.endsWith("/") ? explicit : `${explicit}/`
  }
  return new URL(import.meta.env.BASE_URL, window.location.origin).href
}

function normEmail(v) {
  if (v == null || typeof v !== "string") return ""
  return v.trim().toLowerCase()
}

export async function provisionNewUserAccounts(userId, userEmailHint, _authSession = null) {
  if (!userId) return { error: new Error("userId required") }

  const { data: authData, error: authErr } = await supabase.auth.getUser()
  if (authErr) return { error: authErr }

  const u = authData?.user
  if (!u || u.id !== userId) {
    return { error: new Error("Not authenticated") }
  }

  const { error: rpcErr } = await supabase.rpc("ensure_user_profile")
  if (!rpcErr) return { error: null }

  console.warn(
    "[Cryptomatics] ensure_user_profile RPC failed. Run `client/provision_on_auth.sql` in the Supabase SQL Editor (server-side provisioning). Falling back to client inserts; RLS may block these.",
    rpcErr
  )

  const email = normEmail(u.email ?? userEmailHint)
  if (!email) {
    return { error: new Error("Cannot provision: missing email") }
  }

  const { error: userErr } = await supabase
    .from("user")
    .upsert({ id: userId, email }, { onConflict: "id" })
  if (userErr) return { error: userErr }

  const { error: walletErr } = await supabase
    .from("wallet")
    .upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true })
  if (walletErr) return { error: walletErr }

  return { error: null }
}

export function registerWithEmail(email, password, options = {}) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      ...options,
    },
  })
}

export function loginWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: getAuthRedirectUrl() },
  })
}

export function logout() {
  return supabase.auth.signOut()
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}

const defaultProfile = { frozen: false }

export async function fetchAccountProfile(userId) {
  if (!userId) {
    return { profile: { ...defaultProfile }, error: null }
  }
  const { data, error } = await supabase
    .from("user")
    .select("frozen")
    .eq("id", userId)
    .maybeSingle()
  if (error) return { profile: { ...defaultProfile }, error }
  return {
    profile: { ...defaultProfile, frozen: Boolean(data?.frozen) },
    error: null,
  }
}
