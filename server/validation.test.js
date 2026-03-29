import { describe, expect, it } from 'vitest'
import {
  normalizeCurrency,
  parseAdminCredentials,
  parsePositiveAmount,
} from './validation.js'

describe('parseAdminCredentials', () => {
  it('returns 400 error when supabase_url is missing', () => {
    const r = parseAdminCredentials({ service_role_key: 'k' })
    expect(r.error?.status).toBe(400)
    expect(r.error?.json?.error).toMatch(/supabase_url and service_role_key/)
  })

  it('returns 400 when supabase_url is whitespace only', () => {
    const r = parseAdminCredentials({
      supabase_url: '   ',
      service_role_key: 'k',
    })
    expect(r.error?.status).toBe(400)
  })

  it('returns 400 when service_role_key is missing', () => {
    const r = parseAdminCredentials({ supabase_url: 'https://x.supabase.co' })
    expect(r.error?.status).toBe(400)
  })

  it('trims supabase_url on success', () => {
    const r = parseAdminCredentials({
      supabase_url: '  https://p.supabase.co  ',
      service_role_key: 'secret',
    })
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
