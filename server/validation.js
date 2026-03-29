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

export function parseAdminCredentials(body) {
  const supabase_url = body?.supabase_url
  const service_role_key = body?.service_role_key
  if (
    typeof supabase_url !== 'string' ||
    !supabase_url.trim() ||
    typeof service_role_key !== 'string' ||
    !service_role_key
  ) {
    return {
      error: {
        status: 400,
        json: {
          error:
            'supabase_url and service_role_key are required in the JSON body (admin API credentials).',
        },
      },
    }
  }
  return {
    supabase_url: supabase_url.trim(),
    service_role_key,
  }
}
