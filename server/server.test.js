import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

const { mockCreateClient } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args) => mockCreateClient(...args),
}))

import { app } from './server.js'

const adminBody = {
  supabase_url: 'https://test.supabase.co',
  service_role_key: 'service-role',
}

function walletCreditMock(walletRow) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: walletRow, error: null })
  const updateEq = vi.fn().mockResolvedValue({ error: null })
  const insert = vi.fn().mockResolvedValue({ error: null })
  return {
    from: vi.fn((table) => {
      if (table === 'wallet') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle,
          update: vi.fn().mockReturnValue({ eq: updateEq }),
        }
      }
      if (table === 'transaction') {
        return { insert }
      }
      throw new Error(`unexpected table: ${table}`)
    }),
  }
}

function userFreezeMock(result) {
  return {
    from: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue(result),
    })),
  }
}

describe('API', () => {
  beforeEach(() => {
    mockCreateClient.mockReset()
  })

  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })

  it('POST /credit-user returns 400 without admin credentials', async () => {
    const res = await request(app).post('/credit-user').send({})
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/supabase_url and service_role_key/)
    expect(mockCreateClient).not.toHaveBeenCalled()
  })

  it('POST /credit-user returns 400 when user_id is missing', async () => {
    const res = await request(app)
      .post('/credit-user')
      .send({ ...adminBody, amount: 1, currency: 'USD' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('user_id is required')
    expect(mockCreateClient).toHaveBeenCalledTimes(1)
  })

  it('POST /credit-user returns 400 for invalid currency', async () => {
    const res = await request(app)
      .post('/credit-user')
      .send({
        ...adminBody,
        user_id: 'u1',
        amount: 1,
        currency: 'XYZ',
      })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('currency must be BTC, USD, or EUR')
  })

  it('POST /credit-user returns 400 for non-positive amount', async () => {
    const res = await request(app)
      .post('/credit-user')
      .send({
        ...adminBody,
        user_id: 'u1',
        amount: 0,
        currency: 'USD',
      })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('amount must be a positive number')
  })

  it('POST /credit-user credits wallet and returns balance', async () => {
    mockCreateClient.mockReturnValue(
      walletCreditMock({ BTC: 0, USD: 10, EUR: 0 }),
    )
    const res = await request(app)
      .post('/credit-user')
      .send({
        ...adminBody,
        user_id: 'user-uuid',
        amount: 5,
        currency: 'usd',
      })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      ok: true,
      user_id: 'user-uuid',
      currency: 'USD',
      amount: 5,
      balance: 15,
    })
  })

  it('POST /credit-user returns 404 when wallet row missing', async () => {
    mockCreateClient.mockReturnValue(
      walletCreditMock(null),
    )
    const res = await request(app)
      .post('/credit-user')
      .send({
        ...adminBody,
        user_id: 'missing',
        amount: 1,
        currency: 'BTC',
      })
    expect(res.status).toBe(404)
    expect(res.body.error).toMatch(/Wallet not found/)
  })

  it('POST /freeze-user returns 404 when user row missing', async () => {
    mockCreateClient.mockReturnValue(
      userFreezeMock({ data: null, error: null }),
    )
    const res = await request(app)
      .post('/freeze-user')
      .send({ ...adminBody, user_id: 'nope' })
    expect(res.status).toBe(404)
  })

  it('POST /freeze-user returns ok when user updated', async () => {
    mockCreateClient.mockReturnValue(
      userFreezeMock({ data: { id: 'u1' }, error: null }),
    )
    const res = await request(app)
      .post('/freeze-user')
      .send({ ...adminBody, user_id: 'u1' })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true, user_id: 'u1', frozen: true })
  })

  it('POST /ban-user maps auth not found to 404', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        admin: {
          updateUserById: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'User not found' },
          }),
        },
      },
    })
    const res = await request(app)
      .post('/ban-user')
      .send({ ...adminBody, user_id: 'auth-id' })
    expect(res.status).toBe(404)
  })

  it('POST /ban-user returns ok on success', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        admin: {
          updateUserById: vi.fn().mockResolvedValue({
            data: { user: { banned_until: '2099-01-01T00:00:00Z' } },
            error: null,
          }),
        },
      },
    })
    const res = await request(app)
      .post('/ban-user')
      .send({ ...adminBody, user_id: 'auth-id' })
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.banned_until).toBe('2099-01-01T00:00:00Z')
  })
})
