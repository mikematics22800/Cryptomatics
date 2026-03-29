import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import { useAuth } from "../../auth/AuthProvider.jsx"
import { fetchAccountProfile, supabase } from "../../utils/supabase.js"
import { getCoinDetails } from "../../utils/coinranking.js"

const INTERNAL_CONVERSION_ID = "00000000-0000-0000-0000-000000000001"
const COINRANKING_BTC_UUID = "Qwsogvtv82FCd"

const FIAT_CODES = ["USD", "EUR"]
const ALL_CURRENCIES = ["BTC", "USD", "EUR"]

const EMAIL_LOOKUP_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmailLookup(raw) {
  return String(raw ?? "").trim().toLowerCase()
}

async function findUserByEmail(client, { excludeUserId, excludeEmail, rawSearch }) {
  const q = normalizeEmailLookup(rawSearch)
  if (!q) {
    return { user: null, error: "Enter the recipient's email address." }
  }
  if (!EMAIL_LOOKUP_RE.test(q)) {
    return { user: null, error: "Enter a valid email address." }
  }
  const selfEmail = normalizeEmailLookup(excludeEmail)
  if (selfEmail && q === selfEmail) {
    return { user: null, error: "That is your own email address." }
  }

  const { data: row, error } = await client
    .from("user")
    .select("id, email, frozen")
    .eq("email", q)
    .maybeSingle()

  if (error) {
    return { user: null, error: error.message }
  }
  if (!row) {
    return { user: null, error: "No user found with that email." }
  }
  if (row.id === excludeUserId) {
    return { user: null, error: "That is your own account." }
  }

  return {
    user: { id: row.id, email: row.email, frozen: Boolean(row.frozen) },
    error: null,
  }
}

function formatBalance(currency, value) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return "—"
  const upper = String(currency).toUpperCase()
  if (upper === "BTC") {
    return n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    })
  }
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatTxAmount(currency, signedValue) {
  const n = Number(signedValue)
  if (!Number.isFinite(n)) return "—"
  const upper = String(currency).toUpperCase()
  const abs = Math.abs(n)
  const formatted =
    upper === "BTC"
      ? abs.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 8,
        })
      : abs.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
  const sign = n >= 0 ? "+" : "−"
  return `${sign}${formatted}`
}

function shortPartyId(uuid) {
  if (!uuid || typeof uuid !== "string") return "—"
  return `${uuid.slice(0, 8)}…`
}

function formatUserDisplay(u) {
  if (!u) return "—"
  if (typeof u.email === "string" && u.email.trim()) return u.email.trim()
  return shortPartyId(u.id)
}

function counterpartyLabel(uuid) {
  if (uuid === INTERNAL_CONVERSION_ID) return "Internal conversion"
  return shortPartyId(uuid)
}

function roundForCurrency(value, currency) {
  const upper = String(currency).toUpperCase()
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  if (upper === "BTC") {
    return Math.round(n * 1e8) / 1e8
  }
  return Math.round(n * 1e2) / 1e2
}

async function fetchBtcUsd() {
  try {
    const data = await getCoinDetails(COINRANKING_BTC_UUID)
    const p = data?.data?.coin?.price
    if (Number.isFinite(Number(p)) && Number(p) > 0) return Number(p)
  } catch {
    /* fall through */
  }
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    )
    const j = await res.json()
    const u = j?.bitcoin?.usd
    if (Number.isFinite(Number(u)) && Number(u) > 0) return Number(u)
  } catch {
    /* ignore */
  }
  return null
}

async function fetchEurUsd() {
  const res = await fetch(
    "https://api.frankfurter.app/latest?from=EUR&to=USD"
  )
  if (!res.ok) return null
  const j = await res.json()
  const u = j?.rates?.USD
  if (Number.isFinite(Number(u)) && Number(u) > 0) return Number(u)
  return null
}

function convertWithRates(amount, from, to, rates) {
  const f = String(from).toUpperCase()
  const t = String(to).toUpperCase()
  const { btcUsd, eurUsd } = rates

  const toUsd = (value, cur) => {
    if (cur === "USD") return value
    if (cur === "EUR") return value * eurUsd
    if (cur === "BTC") return value * btcUsd
    return 0
  }

  const fromUsd = (usd, cur) => {
    if (cur === "USD") return usd
    if (cur === "EUR") return usd / eurUsd
    if (cur === "BTC") return usd / btcUsd
    return 0
  }

  const usd = toUsd(amount, f)
  return fromUsd(usd, t)
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const userId = user?.id
  const accountFrozen = Boolean(profile?.frozen)

  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [rates, setRates] = useState(null)
  const [ratesError, setRatesError] = useState(null)
  const [ratesLoading, setRatesLoading] = useState(false)

  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("BTC")
  const [amountInput, setAmountInput] = useState("")
  const [convertSubmitting, setConvertSubmitting] = useState(false)
  const [convertMessage, setConvertMessage] = useState(null)

  const [lookupInput, setLookupInput] = useState("")
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupUser, setLookupUser] = useState(null)
  const [lookupError, setLookupError] = useState(null)

  const [sendCurrency, setSendCurrency] = useState("USD")
  const [sendAmountInput, setSendAmountInput] = useState("")
  const [sendSubmitting, setSendSubmitting] = useState(false)
  const [sendMessage, setSendMessage] = useState(null)

  const loadDashboard = useCallback(async () => {
    if (!userId) return

    const [walletRes, txRes] = await Promise.all([
      supabase
        .from("wallet")
        .select("BTC, USD, EUR")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("transaction")
        .select("id, date, sender, receiver, amount, currency, type")
        .or(`sender.eq.${userId},receiver.eq.${userId}`)
        .order("date", { ascending: false }),
    ])

    if (walletRes.error) {
      setError(walletRes.error.message)
      setWallet(null)
    } else {
      setWallet(walletRes.data)
    }

    if (txRes.error) {
      setError((prev) => prev ?? txRes.error.message)
      setTransactions([])
    } else {
      setTransactions(txRes.data ?? [])
    }
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        await loadDashboard()
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load dashboard data."
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId, loadDashboard])

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    async function loadRates() {
      setRatesLoading(true)
      setRatesError(null)
      const [btcUsd, eurUsd] = await Promise.all([fetchBtcUsd(), fetchEurUsd()])
      if (cancelled) return
      if (btcUsd == null || eurUsd == null) {
        setRates(null)
        setRatesError(
          "Could not load exchange rates. Check your connection or API configuration."
        )
      } else {
        setRates({ btcUsd, eurUsd })
      }
      setRatesLoading(false)
    }

    loadRates()
    return () => {
      cancelled = true
    }
  }, [userId])

  const rows = useMemo(() => {
    if (!userId || !transactions.length) return []
    return transactions.map((tx) => {
      const inbound = tx.receiver === userId
      const counterpartyId = inbound ? tx.sender : tx.receiver
      const signed = inbound ? Number(tx.amount) : -Number(tx.amount)
      return {
        id: tx.id,
        date: tx.date,
        signedAmount: signed,
        currency: tx.currency,
        counterpartyId,
        direction: inbound ? "Inbound" : "Outbound",
        txKind: typeof tx.type === "string" ? tx.type.trim() : "",
      }
    })
  }, [transactions, userId])

  const parsedAmount = useMemo(() => {
    const t = amountInput.trim().replace(",", ".")
    if (t === "") return null
    const n = Number(t)
    if (!Number.isFinite(n) || n <= 0) return null
    return n
  }, [amountInput])

  const previewDestination = useMemo(() => {
    if (
      parsedAmount == null ||
      !rates ||
      fromCurrency === toCurrency
    ) {
      return null
    }
    return roundForCurrency(
      convertWithRates(parsedAmount, fromCurrency, toCurrency, rates),
      toCurrency
    )
  }, [parsedAmount, rates, fromCurrency, toCurrency])

  const parsedSendAmount = useMemo(() => {
    const t = sendAmountInput.trim().replace(",", ".")
    if (t === "") return null
    const n = Number(t)
    if (!Number.isFinite(n) || n <= 0) return null
    return n
  }, [sendAmountInput])

  useEffect(() => {
    setLookupUser(null)
    setLookupError(null)
  }, [lookupInput])

  async function handleLookup(e) {
    e.preventDefault()
    if (!userId) return
    setLookupLoading(true)
    setLookupError(null)
    setLookupUser(null)
    setSendMessage(null)
    const { user: found, error: err } = await findUserByEmail(supabase, {
      excludeUserId: userId,
      excludeEmail: user?.email,
      rawSearch: lookupInput,
    })
    setLookupLoading(false)
    if (err) {
      setLookupError(err)
      return
    }
    setLookupUser(found)
  }

  async function handleSend(e) {
    e.preventDefault()
    setSendMessage(null)

    if (accountFrozen) {
      setSendMessage({
        severity: "error",
        text: "Your account is frozen. You cannot send or receive transfers.",
      })
      return
    }

    if (userId) {
      const { profile: fresh } = await fetchAccountProfile(userId)
      if (fresh.frozen) {
        setSendMessage({
          severity: "error",
          text: "Your account is frozen. You cannot send or receive transfers.",
        })
        return
      }
    }

    if (!userId || !lookupUser?.id) {
      setSendMessage({
        severity: "error",
        text: "Find a recipient first.",
      })
      return
    }
    if (lookupUser.id === userId) {
      setSendMessage({
        severity: "error",
        text: "You cannot send money to yourself.",
      })
      return
    }
    if (lookupUser.frozen) {
      setSendMessage({
        severity: "error",
        text: "That account is frozen and cannot receive transfers.",
      })
      return
    }
    if (parsedSendAmount == null) {
      setSendMessage({
        severity: "error",
        text: "Enter a valid positive amount.",
      })
      return
    }

    const amt = roundForCurrency(parsedSendAmount, sendCurrency)
    const col = sendCurrency

    const { data: senderW, error: swErr } = await supabase
      .from("wallet")
      .select("BTC, USD, EUR")
      .eq("id", userId)
      .maybeSingle()

    if (swErr || !senderW) {
      setSendMessage({
        severity: "error",
        text: swErr?.message ?? "Could not load your wallet.",
      })
      return
    }

    const available = Number(senderW[col] ?? 0)
    if (!Number.isFinite(available) || amt > available + 1e-9) {
      setSendMessage({
        severity: "error",
        text: `Insufficient ${col} balance.`,
      })
      return
    }

    const { data: recvW, error: rwErr } = await supabase
      .from("wallet")
      .select("BTC, USD, EUR")
      .eq("id", lookupUser.id)
      .maybeSingle()

    if (rwErr || !recvW) {
      setSendMessage({
        severity: "error",
        text: rwErr?.message ?? "Recipient wallet not found.",
      })
      return
    }

    const prevSender = {
      BTC: Number(senderW.BTC ?? 0),
      USD: Number(senderW.USD ?? 0),
      EUR: Number(senderW.EUR ?? 0),
    }
    const prevRecv = {
      BTC: Number(recvW.BTC ?? 0),
      USD: Number(recvW.USD ?? 0),
      EUR: Number(recvW.EUR ?? 0),
    }

    const nextSender = { ...prevSender }
    nextSender[col] = roundForCurrency(prevSender[col] - amt, col)
    if (nextSender[col] < -1e-9) {
      setSendMessage({
        severity: "error",
        text: `Insufficient ${col} balance.`,
      })
      return
    }

    const nextRecv = { ...prevRecv }
    nextRecv[col] = roundForCurrency(prevRecv[col] + amt, col)

    setSendSubmitting(true)

    const { error: u1 } = await supabase
      .from("wallet")
      .update({
        BTC: nextSender.BTC,
        USD: nextSender.USD,
        EUR: nextSender.EUR,
      })
      .eq("id", userId)

    if (u1) {
      setSendSubmitting(false)
      setSendMessage({ severity: "error", text: u1.message })
      return
    }

    const { error: u2 } = await supabase
      .from("wallet")
      .update({
        BTC: nextRecv.BTC,
        USD: nextRecv.USD,
        EUR: nextRecv.EUR,
      })
      .eq("id", lookupUser.id)

    if (u2) {
      await supabase
        .from("wallet")
        .update({
          BTC: prevSender.BTC,
          USD: prevSender.USD,
          EUR: prevSender.EUR,
        })
        .eq("id", userId)
      setSendSubmitting(false)
      setSendMessage({ severity: "error", text: u2.message })
      return
    }

    const { error: insErr } = await supabase.from("transaction").insert({
      sender: userId,
      receiver: lookupUser.id,
      amount: amt,
      currency: col,
      type: "Transfer",
    })

    if (insErr) {
      await supabase
        .from("wallet")
        .update({
          BTC: prevSender.BTC,
          USD: prevSender.USD,
          EUR: prevSender.EUR,
        })
        .eq("id", userId)
      await supabase
        .from("wallet")
        .update({
          BTC: prevRecv.BTC,
          USD: prevRecv.USD,
          EUR: prevRecv.EUR,
        })
        .eq("id", lookupUser.id)
      setSendSubmitting(false)
      setSendMessage({ severity: "error", text: insErr.message })
      return
    }

    setWallet({
      BTC: nextSender.BTC,
      USD: nextSender.USD,
      EUR: nextSender.EUR,
    })
    await loadDashboard()
    setSendAmountInput("")
    setSendSubmitting(false)
    setSendMessage({
      severity: "success",
      text: `Sent ${formatBalance(col, amt)} ${col} to ${formatUserDisplay(lookupUser)}.`,
    })
  }

  async function handleConvert(e) {
    e.preventDefault()
    setConvertMessage(null)

    if (accountFrozen) {
      setConvertMessage({
        severity: "error",
        text: "Your account is frozen. You cannot convert currencies.",
      })
      return
    }

    if (userId) {
      const { profile: fresh } = await fetchAccountProfile(userId)
      if (fresh.frozen) {
        setConvertMessage({
          severity: "error",
          text: "Your account is frozen. You cannot convert currencies.",
        })
        return
      }
    }

    if (!userId || !wallet || !rates) {
      setConvertMessage({
        severity: "error",
        text: "Rates or wallet not ready. Try again in a moment.",
      })
      return
    }

    if (fromCurrency === toCurrency) {
      setConvertMessage({
        severity: "error",
        text: "Choose two different currencies.",
      })
      return
    }

    if (parsedAmount == null) {
      setConvertMessage({
        severity: "error",
        text: "Enter a valid positive amount.",
      })
      return
    }

    const debitRaw = roundForCurrency(parsedAmount, fromCurrency)
    const balanceKey = fromCurrency
    const available = Number(wallet[balanceKey] ?? 0)
    if (!Number.isFinite(available) || debitRaw > available + 1e-9) {
      setConvertMessage({
        severity: "error",
        text: `Insufficient ${fromCurrency} balance.`,
      })
      return
    }

    const creditRaw = roundForCurrency(
      convertWithRates(debitRaw, fromCurrency, toCurrency, rates),
      toCurrency
    )

    if (creditRaw <= 0) {
      setConvertMessage({
        severity: "error",
        text: "Converted amount is too small after rounding.",
      })
      return
    }

    const prevSnapshot = {
      BTC: Number(wallet.BTC ?? 0),
      USD: Number(wallet.USD ?? 0),
      EUR: Number(wallet.EUR ?? 0),
    }

    const next = { ...prevSnapshot }
    next[balanceKey] = roundForCurrency(
      prevSnapshot[balanceKey] - debitRaw,
      fromCurrency
    )
    next[toCurrency] = roundForCurrency(
      prevSnapshot[toCurrency] + creditRaw,
      toCurrency
    )

    if (next[balanceKey] < -1e-9) {
      setConvertMessage({
        severity: "error",
        text: `Insufficient ${fromCurrency} balance.`,
      })
      return
    }

    setConvertSubmitting(true)

    const { error: upErr } = await supabase
      .from("wallet")
      .update({
        BTC: next.BTC,
        USD: next.USD,
        EUR: next.EUR,
      })
      .eq("id", userId)

    if (upErr) {
      setConvertSubmitting(false)
      setConvertMessage({ severity: "error", text: upErr.message })
      return
    }

    const { error: insErr } = await supabase.from("transaction").insert([
      {
        sender: userId,
        receiver: INTERNAL_CONVERSION_ID,
        amount: debitRaw,
        currency: fromCurrency,
        type: "Conversion",
      },
      {
        sender: INTERNAL_CONVERSION_ID,
        receiver: userId,
        amount: creditRaw,
        currency: toCurrency,
        type: "Conversion",
      },
    ])

    if (insErr) {
      await supabase
        .from("wallet")
        .update({
          BTC: prevSnapshot.BTC,
          USD: prevSnapshot.USD,
          EUR: prevSnapshot.EUR,
        })
        .eq("id", userId)
      setConvertSubmitting(false)
      setConvertMessage({
        severity: "error",
        text: insErr.message,
      })
      return
    }

    setWallet({ BTC: next.BTC, USD: next.USD, EUR: next.EUR })
    await loadDashboard()
    setAmountInput("")
    setConvertSubmitting(false)
    setConvertMessage({
      severity: "success",
      text: `Converted ${formatBalance(fromCurrency, debitRaw)} ${fromCurrency} → ${formatBalance(toCurrency, creditRaw)} ${toCurrency}.`,
    })
  }

  if (loading) {
    return (
      <div
        id="dashboard"
        className="p-8 mt-20 w-screen min-h-[calc(100vh-6rem)] flex justify-center items-center"
      >
        <CircularProgress size="4rem" sx={{ color: "rgba(251,191,36,0.9)" }} />
      </div>
    )
  }

  const currencies = [
    { code: "BTC", value: wallet?.BTC ?? 0 },
    { code: "USD", value: wallet?.USD ?? 0 },
    { code: "EUR", value: wallet?.EUR ?? 0 },
  ]

  return (
    <div
      id="dashboard"
      className="p-8 mt-20 w-screen min-h-[calc(100vh-6rem)] flex flex-col items-center gap-8 max-w-5xl mx-auto"
    >
      {error ? (
        <Typography color="error" role="alert">
          {error}
        </Typography>
      ) : null}

      {accountFrozen ? (
        <Alert severity="warning" sx={{ width: "100%" }}>
          Your account is frozen. You can view balances and history, but you cannot
          send, receive, or convert funds until an administrator unfreezes your account.
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 2,
          width: "100%",
        }}
      >
        {currencies.map(({ code, value }) => (
          <Paper
            key={code}
            elevation={2}
            sx={{
              p: 2.5,
              borderRadius: 2,
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Typography variant="overline" color="text.secondary">
              Balance ({code})
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
              {formatBalance(code, value)}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper
        component="form"
        onSubmit={handleConvert}
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 2,
          width: "100%",
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2, color: "rgba(15, 23, 42, 0.92)" }}
        >
          Convert between your accounts
        </Typography>

        {ratesLoading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <CircularProgress size={22} />
            <Typography variant="body2" color="text.secondary">
              Loading exchange rates…
            </Typography>
          </Box>
        ) : ratesError ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {ratesError}
          </Alert>
        ) : rates ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            1 BTC = {formatBalance("USD", rates.btcUsd)} USD ={" "}
            {formatBalance("EUR", rates.btcUsd / rates.eurUsd)} EUR
          </Typography>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 2,
            alignItems: "flex-end",
          }}
        >
          <FormControl fullWidth size="small">
            <InputLabel id="convert-from-label">From</InputLabel>
            <Select
              labelId="convert-from-label"
              label="From"
              value={fromCurrency}
              onChange={(ev) => {
                const v = ev.target.value
                setFromCurrency(v)
                if (v === toCurrency) {
                  const alt = ALL_CURRENCIES.find((c) => c !== v)
                  setToCurrency(alt ?? "BTC")
                }
              }}
            >
              {FIAT_CODES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
              <MenuItem value="BTC">BTC</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="convert-to-label">To</InputLabel>
            <Select
              labelId="convert-to-label"
              label="To"
              value={toCurrency}
              onChange={(ev) => {
                const v = ev.target.value
                setToCurrency(v)
                if (v === fromCurrency) {
                  const alt = ALL_CURRENCIES.find((c) => c !== v)
                  setFromCurrency(alt ?? "USD")
                }
              }}
            >
              {FIAT_CODES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
              <MenuItem value="BTC">BTC</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label={`Amount (${fromCurrency})`}
            value={amountInput}
            onChange={(ev) => setAmountInput(ev.target.value)}
            inputProps={{ inputMode: "decimal" }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={
              accountFrozen ||
              convertSubmitting ||
              !rates ||
              ratesLoading ||
              fromCurrency === toCurrency
            }
            sx={{ py: 1.25, fontWeight: 700 }}
          >
            {convertSubmitting ? "Converting…" : "Convert"}
          </Button>
        </Box>

        {previewDestination != null ? (
          <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
            You receive approximately{" "}
            {formatBalance(toCurrency, previewDestination)} {toCurrency}
          </Typography>
        ) : null}

        {convertMessage ? (
          <Alert severity={convertMessage.severity} sx={{ mt: 2 }}>
            {convertMessage.text}
          </Alert>
        ) : null}
      </Paper>

      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 2,
          width: "100%",
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2, color: "rgba(15, 23, 42, 0.92)" }}
        >
          Send to another user
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter another member&apos;s account email (same as they use to sign in), then
          send BTC, USD, or EUR. Both wallets update and the transfer appears in each
          user&apos;s history.
        </Typography>

        <Box
          component="form"
          onSubmit={handleLookup}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Recipient email"
            type="email"
            value={lookupInput}
            onChange={(ev) => setLookupInput(ev.target.value)}
            autoComplete="off"
            sx={{ flex: "1 1 220px", minWidth: 200 }}
          />
          <Button
            type="submit"
            variant="outlined"
            disabled={lookupLoading}
            sx={{ py: 1.25, fontWeight: 700, mt: 0.5 }}
          >
            {lookupLoading ? "Searching…" : "Find user"}
          </Button>
        </Box>

        {lookupError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {lookupError}
          </Alert>
        ) : null}

        {lookupUser ? (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: "rgba(15, 23, 42, 0.04)",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Recipient
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {formatUserDisplay(lookupUser)}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontFamily: "ui-monospace, monospace", color: "text.secondary" }}
              title={lookupUser.id}
            >
              {shortPartyId(lookupUser.id)}
            </Typography>
          </Box>
        ) : null}

        <Box
          component="form"
          onSubmit={handleSend}
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 2,
            alignItems: "flex-end",
          }}
        >
          <FormControl fullWidth size="small">
            <InputLabel id="send-currency-label">Currency</InputLabel>
            <Select
              labelId="send-currency-label"
              label="Currency"
              value={sendCurrency}
              onChange={(ev) => setSendCurrency(ev.target.value)}
            >
              {ALL_CURRENCIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label={`Amount (${sendCurrency})`}
            value={sendAmountInput}
            onChange={(ev) => setSendAmountInput(ev.target.value)}
            inputProps={{ inputMode: "decimal" }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={accountFrozen || sendSubmitting || !lookupUser}
            sx={{ py: 1.25, fontWeight: 700 }}
          >
            {sendSubmitting ? "Sending…" : "Send"}
          </Button>
        </Box>

        {sendMessage ? (
          <Alert severity={sendMessage.severity} sx={{ mt: 2 }}>
            {sendMessage.text}
          </Alert>
        ) : null}
      </Paper>

      <Box sx={{ width: "100%" }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2, color: "rgba(15, 23, 42, 0.92)" }}
        >
          Transaction history
        </Typography>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{
            borderRadius: 2,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            maxHeight: 480,
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Amount
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Currency</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Counterparty</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No transactions yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      {row.date
                        ? new Date(row.date).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: 600,
                        color:
                          row.signedAmount >= 0
                            ? "success.dark"
                            : "error.dark",
                      }}
                    >
                      {formatTxAmount(row.currency, row.signedAmount)}
                    </TableCell>
                    <TableCell>
                      {String(row.currency || "").toUpperCase() || "—"}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "ui-monospace, monospace",
                        fontSize: "0.85rem",
                      }}
                      title={row.counterpartyId}
                    >
                      {counterpartyLabel(row.counterpartyId)}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          size="small"
                          label={row.direction}
                          color={
                            row.direction === "Inbound" ? "success" : "default"
                          }
                          variant={
                            row.direction === "Outbound" ? "outlined" : "filled"
                          }
                          sx={{ fontWeight: 600 }}
                        />
                        {row.txKind ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            component="span"
                          >
                            {row.txKind}
                          </Typography>
                        ) : null}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  )
}
