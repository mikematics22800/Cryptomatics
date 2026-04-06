import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL ?? ""
const key = import.meta.env.VITE_SUPABASE_API_KEY ?? ""

/** Ledger account used for internal currency conversions (matches Dashboard / DB seed). */
export const INTERNAL_CONVERSION_ID = "00000000-0000-0000-0000-000000000001"

export const ALLOWED_CURRENCIES = ["BTC", "USD", "EUR"]

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUuid(value) {
  return typeof value === "string" && UUID_RE.test(value.trim())
}

export function normalizeCurrency(raw) {
  if (raw == null || typeof raw !== "string") return null
  const c = raw.trim().toUpperCase()
  return ALLOWED_CURRENCIES.includes(c) ? c : null
}

export function roundForCurrency(value, currency) {
  const col = normalizeCurrency(currency)
  if (!col) return NaN
  const n = Number(value)
  if (!Number.isFinite(n)) return NaN
  if (col === "BTC") {
    return Math.round(n * 1e8) / 1e8
  }
  return Math.round(n * 1e2) / 1e2
}

/**
 * Validates a peer-to-peer transfer before wallet/transaction writes.
 * @returns {{ ok: true, amount: number, currency: string } | { ok: false, error: string }}
 */
export function validateUserTransfer({
  senderId,
  receiverId,
  rawAmount,
  currency,
}) {
  if (!isValidUuid(senderId) || !isValidUuid(receiverId)) {
    return { ok: false, error: "Invalid party identifiers." }
  }
  if (senderId === receiverId) {
    return { ok: false, error: "You cannot send money to yourself." }
  }
  if (senderId === INTERNAL_CONVERSION_ID || receiverId === INTERNAL_CONVERSION_ID) {
    return { ok: false, error: "Invalid transfer route." }
  }
  const cur = normalizeCurrency(currency)
  if (!cur) {
    return { ok: false, error: "Invalid currency." }
  }
  const amt = roundForCurrency(rawAmount, cur)
  if (!Number.isFinite(amt) || amt <= 0) {
    return { ok: false, error: "Enter a valid positive amount." }
  }
  return { ok: true, amount: amt, currency: cur }
}

/**
 * Validates an internal conversion (two ledger rows) before inserts.
 * @returns {{ ok: true, debit: number, credit: number, from: string, to: string } | { ok: false, error: string }}
 */
export function validateConversionPair({
  userId,
  fromCurrency,
  toCurrency,
  debitAmount,
  creditAmount,
}) {
  if (!isValidUuid(userId)) {
    return { ok: false, error: "Invalid account." }
  }
  const from = normalizeCurrency(fromCurrency)
  const to = normalizeCurrency(toCurrency)
  if (!from || !to) {
    return { ok: false, error: "Invalid currency." }
  }
  if (from === to) {
    return { ok: false, error: "Choose two different currencies." }
  }
  const debit = roundForCurrency(debitAmount, from)
  const credit = roundForCurrency(creditAmount, to)
  if (!Number.isFinite(debit) || debit <= 0) {
    return { ok: false, error: "Enter a valid positive amount." }
  }
  if (!Number.isFinite(credit) || credit <= 0) {
    return { ok: false, error: "Converted amount is too small after rounding." }
  }
  return { ok: true, debit, credit, from, to }
}

export function buildValidatedConversionTransactionRows(
  userId,
  fromCurrency,
  toCurrency,
  debitAmount,
  creditAmount
) {
  const v = validateConversionPair({
    userId,
    fromCurrency,
    toCurrency,
    debitAmount,
    creditAmount,
  })
  if (!v.ok) return v
  return {
    ok: true,
    debit: v.debit,
    credit: v.credit,
    from: v.from,
    to: v.to,
    rows: [
      {
        sender: userId,
        receiver: INTERNAL_CONVERSION_ID,
        amount: v.debit,
        currency: v.from,
        type: "Conversion",
      },
      {
        sender: INTERNAL_CONVERSION_ID,
        receiver: userId,
        amount: v.credit,
        currency: v.to,
        type: "Conversion",
      },
    ],
  }
}

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
