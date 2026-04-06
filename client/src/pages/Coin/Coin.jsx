import {
  createContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useFiatCurrency } from "../Dashboard/Dashboard.jsx"
import { formatFiatAmount } from "../../utils/conversion.js"
import { useParams } from "react-router-dom"
import gsap from "gsap"
import millify from "millify"
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import LineChart from "./components/LineChart"
import { getCoinDetails, getCoinHistory } from "../../utils/coinranking.js"

export const CoinContext = createContext()

const Coin = () => {
  const [coinDetails, setCoinDetails] = useState(null)
  const [coinHistory, setCoinHistory] = useState(null)
  const [timePeriod, setTimePeriod] = useState("7d")
  const { currency, setCurrency, usdPerEur } = useFiatCurrency()
  const coinId = useParams().id

  const coinRootRef = useRef(null)
  const loaderRef = useRef(null)
  const statsRef = useRef(null)
  const chartRef = useRef(null)
  const entranceDoneForCoinRef = useRef(null)

  const entranceTrigger = useMemo(() => {
    if (
      !coinDetails ||
      !coinHistory ||
      coinDetails.uuid !== coinId
    ) {
      return null
    }
    return coinId
  }, [coinId, coinDetails, coinHistory])

  useEffect(() => {
    getCoinDetails(coinId).then((data) => {
      setCoinDetails(data.data.coin)
    })
  }, [coinId])

  useEffect(() => {
    getCoinHistory({ coinId, timePeriod }).then((data) => {
      setCoinHistory(data.data)
    })
  }, [coinId, timePeriod])

  useLayoutEffect(() => {
    if (coinDetails && coinHistory) return
    const wrap = loaderRef.current
    if (!wrap) return
    const spinner = wrap.querySelector(".MuiCircularProgress-root")
    const target = spinner || wrap
    const tween = gsap.to(target, {
      scale: 1.06,
      opacity: 0.88,
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    })
    return () => tween.kill()
  }, [coinDetails, coinHistory])

  useLayoutEffect(() => {
    if (!entranceTrigger) {
      entranceDoneForCoinRef.current = null
      return
    }
    if (entranceDoneForCoinRef.current === entranceTrigger) return
    entranceDoneForCoinRef.current = entranceTrigger

    const ctx = gsap.context(() => {
      const paper = statsRef.current
      const chartEl = chartRef.current
      if (!paper || !chartEl) return

      const icon = paper.querySelector("img")
      const title = paper.querySelector(".coin-page-title")
      const rows = paper.querySelectorAll(".coin-stat")

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.from(paper, { opacity: 0, y: 28, duration: 0.5 })
      if (icon) {
        tl.from(
          icon,
          {
            scale: 0,
            opacity: 0,
            rotation: -12,
            duration: 0.55,
            ease: "back.out(1.35)",
          },
          "-=0.35"
        )
      }
      if (title) {
        tl.from(title, { opacity: 0, y: 10, duration: 0.35 }, "-=0.35")
      }
      if (rows.length) {
        tl.from(
          rows,
          {
            opacity: 0,
            x: -18,
            stagger: 0.045,
            duration: 0.38,
            ease: "power2.out",
          },
          "-=0.2"
        )
      }
      tl.from(
        chartEl,
        { opacity: 0, y: 36, duration: 0.6, ease: "power2.out" },
        "-=0.35"
      )
    }, coinRootRef)

    return () => ctx.revert()
  }, [entranceTrigger])

  const value = {
    coinDetails,
    coinHistory,
    timePeriod,
    setTimePeriod,
    currency,
    usdPerEur,
  }

  const stats = useMemo(
    () => [
      {
        title: "Rank",
        value:
          coinDetails?.rank != null && coinDetails.rank !== ""
            ? `#${coinDetails.rank}`
            : "—",
      },
      {
        title: `Price`,
        value: formatFiatAmount(coinDetails?.price, currency, usdPerEur),
      },
      {
        title: `24h Volume`,
        value: formatFiatAmount(coinDetails?.["24hVolume"], currency, usdPerEur),
      },
      {
        title: `Market Cap`,
        value: formatFiatAmount(coinDetails?.marketCap, currency, usdPerEur),
      },
      {
        title: `Highest Price`,
        value: formatFiatAmount(
          coinDetails?.allTimeHigh?.price,
          currency,
          usdPerEur
        ),
      },
      { title: "Markets", value: coinDetails?.numberOfMarkets },
      { title: "Exchanges", value: coinDetails?.numberOfExchanges },
      {
        title: "Total Supply",
        value:
          coinDetails?.supply?.total != null
            ? millify(coinDetails.supply.total)
            : "—",
      },
      {
        title: "Circulating Supply",
        value:
          coinDetails?.supply?.circulating != null
            ? millify(coinDetails.supply.circulating)
            : "—",
      },
    ],
    [coinDetails, currency, usdPerEur]
  )

  return (
    <CoinContext.Provider value={value}>
      {!coinDetails || !coinHistory ? (
        <div
          ref={loaderRef}
          className="flex min-h-[calc(100vh-6rem)] w-screen items-center justify-center p-8"
        >
          <CircularProgress
            size="4rem"
            sx={{ color: "rgba(251,191,36,0.9)" }}
          />
        </div>
      ) : (
        <Box
          id="coin"
          ref={coinRootRef}
          sx={{
            width: "100%",
            maxWidth: 1400,
            mx: "auto",
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: { xs: "stretch", lg: "flex-start" },
            justifyContent: "center",
            gap: { xs: 3, md: 4 },
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 3, sm: 4 },
            pt: { xs: 3, sm: 4, lg: 5 },
          }}
        >
          <Paper
            ref={statsRef}
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
              width: "100%",
              maxWidth: { xs: "100%", lg: 400 },
              flexShrink: 0,
              background: "rgba(255, 255, 255, 0.88)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Avatar
                src={coinDetails?.iconUrl}
                alt=""
                variant="rounded"
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "transparent",
                }}
              />
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                sx={{ width: "100%", flexWrap: "wrap", gap: 1.5 }}
              >
                <Typography
                  component="h1"
                  className="coin-page-title"
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "rgba(15, 23, 42, 0.92)",
                    lineHeight: 1.25,
                    flex: "1 1 auto",
                    minWidth: 0,
                  }}
                >
                  {coinDetails?.name}{" "}
                  <Typography
                    component="span"
                    variant="h5"
                    sx={{ fontWeight: 600, color: "primary.main" }}
                  >
                    {coinDetails?.symbol}
                  </Typography>
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={currency}
                  onChange={(_, v) => v && setCurrency(v)}
                  aria-label="Display currency"
                >
                  <ToggleButton value="USD">USD</ToggleButton>
                  <ToggleButton value="EUR">EUR</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack divider={<Divider flexItem />} spacing={0}>
              {stats.map(({ title, value: statValue }) => (
                <Stack
                  key={title}
                  className="coin-stat"
                  direction="row"
                  justifyContent="space-between"
                  alignItems="baseline"
                  spacing={2}
                  sx={{ py: 1.35, px: 0.5 }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ flexShrink: 0 }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      textAlign: "right",
                      color: "rgba(15, 23, 42, 0.9)",
                      wordBreak: "break-word",
                    }}
                  >
                    {statValue ?? "—"}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>

          <Paper
            ref={chartRef}
            elevation={2}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              width: "100%",
              minWidth: 0,
              flex: { lg: 1 },
              background: "rgba(255, 255, 255, 0.88)",
              backdropFilter: "blur(8px)",
            }}
          >
            <LineChart />
          </Paper>
        </Box>
      )}
    </CoinContext.Provider>
  )
}

export default Coin