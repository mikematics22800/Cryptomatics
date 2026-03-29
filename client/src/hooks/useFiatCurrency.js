import { useCallback, useEffect, useState } from "react"
import millify from "millify"

const STORAGE_KEY = "cryptomatics-display-currency"

function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === "EUR" || v === "USD") return v
  } catch {
    /* ignore */
  }
  return "USD"
}

async function fetchUsdPerEur() {
  const res = await fetch(
    "https://api.frankfurter.app/latest?from=EUR&to=USD"
  )
  if (!res.ok) return null
  const j = await res.json()
  const u = j?.rates?.USD
  if (Number.isFinite(Number(u)) && Number(u) > 0) return Number(u)
  return null
}

/** CoinRanking prices are USD; EUR uses Frankfurter `usdPerEur` (USD per EUR). */
export function formatFiatAmount(usdAmount, currency, usdPerEur) {
  const n = Number(usdAmount)
  if (!Number.isFinite(n)) return "—"
  if (currency === "USD") return `$${millify(n)}`
  if (!usdPerEur) return "…"
  return `€${millify(n / usdPerEur)}`
}

export function useFiatCurrency() {
  const [currency, setCurrencyState] = useState(readStored)
  const [usdPerEur, setUsdPerEur] = useState(null)

  const setCurrency = useCallback((next) => {
    setCurrencyState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (currency !== "EUR") {
      setUsdPerEur(null)
      return
    }
    let cancelled = false
    fetchUsdPerEur().then((r) => {
      if (!cancelled && r != null) setUsdPerEur(r)
    })
    return () => {
      cancelled = true
    }
  }, [currency])

  return { currency, setCurrency, usdPerEur }
}
