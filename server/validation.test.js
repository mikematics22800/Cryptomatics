import { describe, expect, it } from 'vitest'
import {
  normalizeCurrency,
  parseAdminCredentials,
  parsePositiveAmount,
} from './validation.js'

describe('parseAdminCredentials', () => {
  it('returns 500 when SUPABASE_URL env value is missing', () => {
    const r = parseAdminCredentials({ service_role_key: 'k' }, undefined)
    expect(r.error?.status).toBe(500)
    expect(r.error?.json?.error).toMatch(/SUPABASE_URL is not set/)
  })

  it('returns 500 when SUPABASE_URL env value is whitespace only', () => {
    const r = parseAdminCredentials({ service_role_key: 'k' }, '   ')
    expect(r.error?.status).toBe(500)
  })

  it('returns 400 when service_role_key is missing', () => {
    const r = parseAdminCredentials({}, 'https://x.supabase.co')
    expect(r.error?.status).toBe(400)
    expect(r.error?.json?.error).toMatch(/service_role_key/)
  })

  it('uses env URL and passes through service_role_key on success', () => {
    const r = parseAdminCredentials(
      { service_role_key: 'secret' },
      '  https://p.supabase.co  ',
    )
    expect(r.error).toBeUndefined()
    expect(r.supabase_url).toBe('https://p.supabase.co')
    expect(r.service_role_key).toBe('secret')
  })
})

describe('normalizeCurrency', () => {
  it('accepts BTC, USD, EUR case-insensitively with trim', () => {
    expect(normalizeCurrency(' btc ')).toBe('BTC')
    expect(normalizeCurrency('eur')).toBe('EUR')
  })

  it('rejects unknown and non-strings', () => {
    expect(normalizeCurrency('GBP')).toBeNull()
    expect(normalizeCurrency(null)).toBeNull()
    expect(normalizeCurrency(1)).toBeNull()
  })
})

describe('parsePositiveAmount', () => {
  it('parses positive numbers and numeric strings', () => {
    expect(parsePositiveAmount(1.5)).toBe(1.5)
    expect(parsePositiveAmount('2.25')).toBe(2.25)
  })

  it('rejects zero, negative, NaN, and non-finite', () => {
    expect(parsePositiveAmount(0)).toBeNull()
    expect(parsePositiveAmount(-1)).toBeNull()
    expect(parsePositiveAmount('')).toBeNull()
    expect(parsePositiveAmount(NaN)).toBeNull()
    expect(parsePositiveAmount(Infinity)).toBeNull()
  })
})
