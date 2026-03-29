import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL ?? ''
const key =
  import.meta.env.VITE_SUPABASE_API_KEY 

export function getAuthRedirectUrl() {
  if (typeof window === 'undefined') return undefined
  return new URL(import.meta.env.BASE_URL, window.location.origin).href
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

function normalizeAccountEmail(raw) {
  if (raw == null || typeof raw !== "string") return ""
  return raw.trim().toLowerCase()
}

export async function provisionNewUserAccounts(userId, userEmailHint, authSession = null) {
  if (!userId) {
    return { error: new Error("userId required") }
  }

  if (authSession?.access_token && authSession?.refresh_token) {
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: authSession.access_token,
      refresh_token: authSession.refresh_token,
    })
    if (setSessionError) {
      return { error: setSessionError }
    }
  }

  let authUser = null
  if (authSession?.user?.id === userId) {
    authUser = authSession.user
  } else {
    const { data: authData, error: authErr } = await supabase.auth.getUser()
    if (authErr) {
      return { error: authErr }
    }
    authUser = authData?.user
  }

  if (!authUser || authUser.id !== userId) {
    return { error: new Error("Not authenticated or session user mismatch") }
  }

  const identities = authUser.identities ?? []
  const hasEmailPasswordIdentity = identities.some((i) => i.provider === "email")
  if (hasEmailPasswordIdentity && !authUser.email_confirmed_at) {
    return { error: null }
  }

  const email = normalizeAccountEmail(authUser.email ?? userEmailHint)
  if (!email) {
    return { error: new Error("Cannot provision account without an email address") }
  }

  const { error: usersError } = await supabase
    .from("user")
    .upsert({ id: userId, email }, { onConflict: "id" })

  if (usersError) {
    return { error: usersError }
  }

  const { error: walletError } = await supabase
    .from("wallet")
    .upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true })

  if (walletError) {
    return { error: walletError }
  }

  const { count, error: countError } = await supabase
    .from("transaction")
    .select("id", { count: "exact", head: true })
    .eq("receiver", userId)
    .eq("type", "Registration")

  if (countError) {
    return { error: countError }
  }

  if (count && count > 0) {
    return { error: null }
  }

  const { error: txError } = await supabase.from("transaction").insert({
    sender: SYSTEM_LEDGER_ACCOUNT_ID,
    receiver: userId,
    amount: 0,
    currency: "USD",
    type: "Registration",
  })

  if (txError) {
    return { error: txError }
  }

  return { error: null }
}

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

export async function loginWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthRedirectUrl(),
    },
  })
}

export async function logout() {
  return supabase.auth.signOut()
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}

const defaultAccountProfile = {
  frozen: false,
}

export async function fetchAccountProfile(userId) {
  if (!userId) {
    return { profile: { ...defaultAccountProfile }, error: null }
  }
  const { data, error } = await supabase
    .from("user")
    .select("frozen")
    .eq("id", userId)
    .maybeSingle()
  if (error) {
    return { profile: { ...defaultAccountProfile }, error }
  }
  return {
    profile: {
      ...defaultAccountProfile,
      frozen: !!data?.frozen,
    },
    error: null,
  }
}
