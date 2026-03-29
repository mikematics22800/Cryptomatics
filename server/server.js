import express from 'express'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import {
  normalizeCurrency,
  parseAdminCredentials,
  parsePositiveAmount,
} from './validation.js'

/** Matches client `SYSTEM_LEDGER_ACCOUNT_ID` for ledger-originated rows. */
const SYSTEM_LEDGER_ACCOUNT_ID = '00000000-0000-0000-0000-000000000002'

const supabaseClientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
}

function getServiceClient(req) {
  const parsed = parseAdminCredentials(req.body ?? {})
  if (parsed.error) return parsed
  return {
    supabase: createClient(parsed.supabase_url, parsed.service_role_key, supabaseClientOptions),
  }
}

/**
 * POST /credit-user
 * Body: supabase_url, service_role_key, user_id, amount, currency (BTC|USD|EUR)
 */
async function creditUser(req, res) {
  const parsed = getServiceClient(req)
  if (parsed.error) return res.status(parsed.error.status).json(parsed.error.json)

  const { user_id, amount, currency } = req.body ?? {}
  if (typeof user_id !== 'string' || !user_id.trim()) {
    return res.status(400).json({ error: 'user_id is required' })
  }
  const col = normalizeCurrency(currency)
  if (!col) {
    return res.status(400).json({ error: 'currency must be BTC, USD, or EUR' })
  }
  const amt = parsePositiveAmount(amount)
  if (amt == null) {
    return res.status(400).json({ error: 'amount must be a positive number' })
  }

  const { supabase } = parsed
  const uid = user_id.trim()

  const { data: wallet, error: fetchErr } = await supabase
    .from('wallet')
    .select('BTC, USD, EUR')
    .eq('id', uid)
    .maybeSingle()

  if (fetchErr) {
    return res.status(500).json({ error: fetchErr.message })
  }
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found for user_id' })
  }

  const previous = Number(wallet[col] ?? 0)
  const next = previous + amt

  const { error: updateErr } = await supabase.from('wallet').update({ [col]: next }).eq('id', uid)

  if (updateErr) {
    return res.status(500).json({ error: updateErr.message })
  }

  const { error: txErr } = await supabase.from('transaction').insert({
    sender: SYSTEM_LEDGER_ACCOUNT_ID,
    receiver: uid,
    amount: amt,
    currency: col,
    type: 'AdminTopUp',
  })

  if (txErr) {
    await supabase.from('wallet').update({ [col]: previous }).eq('id', uid)
    return res.status(500).json({ error: txErr.message })
  }

  return res.json({
    ok: true,
    user_id: uid,
    currency: col,
    amount: amt,
    balance: next,
  })
}

/**
 * POST /freeze-user — user can log in but cannot send/receive (app checks user.frozen).
 * Body: supabase_url, service_role_key, user_id
 */
async function freezeUser(req, res) {
  const parsed = getServiceClient(req)
  if (parsed.error) return res.status(parsed.error.status).json(parsed.error.json)

  const { user_id } = req.body ?? {}
  if (typeof user_id !== 'string' || !user_id.trim()) {
    return res.status(400).json({ error: 'user_id is required' })
  }
  const uid = user_id.trim()

  const { data, error } = await parsed.supabase
    .from('user')
    .update({ frozen: true })
    .eq('id', uid)
    .select('id')
    .maybeSingle()

  if (error) {
    return res.status(500).json({ error: error.message })
  }
  if (!data) {
    return res.status(404).json({ error: 'User not found for user_id' })
  }

  return res.json({ ok: true, user_id: uid, frozen: true })
}

/**
 * POST /unfreeze-user
 * Body: supabase_url, service_role_key, user_id
 */
async function unfreezeUser(req, res) {
  const parsed = getServiceClient(req)
  if (parsed.error) return res.status(parsed.error.status).json(parsed.error.json)

  const { user_id } = req.body ?? {}
  if (typeof user_id !== 'string' || !user_id.trim()) {
    return res.status(400).json({ error: 'user_id is required' })
  }
  const uid = user_id.trim()

  const { data, error } = await parsed.supabase
    .from('user')
    .update({ frozen: false })
    .eq('id', uid)
    .select('id')
    .maybeSingle()

  if (error) {
    return res.status(500).json({ error: error.message })
  }
  if (!data) {
    return res.status(404).json({ error: 'User not found for user_id' })
  }

  return res.json({ ok: true, user_id: uid, frozen: false })
}

/**
 * POST /ban-user — Supabase Auth ban (cannot sign in or refresh; user_banned).
 * Body: supabase_url, service_role_key, user_id (auth user id)
 */
async function banUser(req, res) {
  const parsed = getServiceClient(req)
  if (parsed.error) return res.status(parsed.error.status).json(parsed.error.json)

  const { user_id } = req.body ?? {}
  if (typeof user_id !== 'string' || !user_id.trim()) {
    return res.status(400).json({ error: 'user_id is required' })
  }
  const uid = user_id.trim()

  const { data, error } = await parsed.supabase.auth.admin.updateUserById(uid, {
    ban_duration: '876000h',
  })

  if (error) {
    const status = /not found/i.test(error.message) ? 404 : 500
    return res.status(status).json({ error: error.message })
  }

  return res.json({
    ok: true,
    user_id: uid,
    banned_until: data?.user?.banned_until ?? null,
  })
}

const app = express()
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/credit-user', (req, res, next) => {
  creditUser(req, res).catch(next)
})
app.post('/freeze-user', (req, res, next) => {
  freezeUser(req, res).catch(next)
})
app.post('/unfreeze-user', (req, res, next) => {
  unfreezeUser(req, res).catch(next)
})
app.post('/ban-user', (req, res, next) => {
  banUser(req, res).catch(next)
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: err?.message ?? 'Internal server error' })
})

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url)

if (isMainModule) {
  const port = Number(process.env.PORT) || 3000
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`)
  })
}

export { app, creditUser, freezeUser, unfreezeUser, banUser }
