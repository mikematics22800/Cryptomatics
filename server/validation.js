const CURRENCIES = ['BTC', 'USD', 'EUR']

export function normalizeCurrency(currency) {
  if (currency == null || typeof currency !== 'string') return null
  const c = currency.trim().toUpperCase()
  return CURRENCIES.includes(c) ? c : null
}

export function parsePositiveAmount(amount) {
  const n = typeof amount === 'string' ? parseFloat(amount) : Number(amount)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

export function parseAdminCredentials(body, supabaseUrlFromEnv) {
  const supabase_url =
    typeof supabaseUrlFromEnv === 'string' ? supabaseUrlFromEnv.trim() : ''
  if (!supabase_url) {
    return {
      error: {
        status: 500,
        json: {
          error:
            'Server misconfiguration: SUPABASE_URL is not set. Add it to the server environment or .env file.',
        },
      },
    }
  }
  const service_role_key = body?.service_role_key
  if (typeof service_role_key !== 'string' || !service_role_key) {
    return {
      error: {
        status: 400,
        json: {
          error:
            'service_role_key is required in the JSON body (admin API credentials).',
        },
      },
    }
  }
  return {
    supabase_url,
    service_role_key,
  }
}
