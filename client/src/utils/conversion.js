import axios from "axios"
import millify from "millify"

const baseURL = "https://currency-conversion-and-exchange-rates.p.rapidapi.com"

const headers = {
  "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
  "X-RapidAPI-Host": "currency-conversion-and-exchange-rates.p.rapidapi.com",
}

export async function getConversion(base, symbols) {
  try {
    const { data } = await axios.get(`${baseURL}/timeseries`, {
      headers,
      params: { base, symbols },
    })
    return data
  } catch {
    return undefined
  }
}

function usdPerEurFromEurPerUsd(data) {
  const eurPerUsd = Number(data?.rates?.EUR ?? data?.EUR)
  if (Number.isFinite(eurPerUsd) && eurPerUsd > 0) return 1 / eurPerUsd
  const byDate = data?.rates
  if (byDate && typeof byDate === "object" && !Array.isArray(byDate)) {
    const dates = Object.keys(byDate).sort()
    const last = dates[dates.length - 1]
    const row = byDate[last]
    const v = Number(row?.EUR ?? row)
    if (Number.isFinite(v) && v > 0) return 1 / v
  }
  return null
}

/**
 * USD per 1 EUR (CoinRanking prices are USD). Tries /latest, then timeseries.
 */
export async function fetchUsdPerEur() {
  try {
    const { data } = await axios.get(`${baseURL}/latest`, {
      headers,
      params: { base: "USD", symbols: "EUR" },
    })
    const r = usdPerEurFromEurPerUsd(data)
    if (r != null) return r
  } catch {
    /* try timeseries */
  }
  const ts = await getConversion("USD", "EUR")
  return usdPerEurFromEurPerUsd(ts) ?? null
}

/** CoinRanking amounts are USD; EUR display uses `usdPerEur` from {@link fetchUsdPerEur}. */
export function formatFiatAmount(usdAmount, currency, usdPerEur) {
  const n = Number(usdAmount)
  if (!Number.isFinite(n)) return "—"
  if (currency === "USD") return `$${millify(n)}`
  if (!usdPerEur) return "…"
  return `€${millify(n / usdPerEur)}`
}