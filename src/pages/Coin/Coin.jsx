import {
  createContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useParams } from "react-router-dom"
import gsap from "gsap"
import millify from "millify"
import { CircularProgress, Paper } from "@mui/material"
import { Tag } from "antd"
import { Check, Close } from "@mui/icons-material"
import LineChart from "./components/LineChart"
import { getCoinDetails, getCoinHistory } from "../../utils/coinranking.js"

export const CoinContext = createContext()

const Coin = () => {
  const [coinDetails, setCoinDetails] = useState(null)
  const [coinHistory, setCoinHistory] = useState(null)
  const [timePeriod, setTimePeriod] = useState("7d")
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
      const title = paper.querySelector("h1")
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

  const value = { coinDetails, coinHistory, timePeriod, setTimePeriod }

  const stats = [
    {title: 'Price to USD', value: `$${millify(coinDetails?.price)}`},
    {title: 'Rank', value: coinDetails?.rank, icon: <Tag/>},
    {title: '24h Volume', value: `$${millify(coinDetails?.["24hVolume"])}`},
    {title: 'Market Cap', value: `$${millify(coinDetails?.marketCap)}`},
    {title: 'Highest Price', value: `$${millify(coinDetails?.allTimeHigh?.price)}`},
    {title: 'Markets', value: coinDetails?.numberOfMarkets},
    {title: 'Exchanges', value: coinDetails?.numberOfExchanges},
    {title: 'Total Supply', value: `$${millify(coinDetails?.supply?.total)}`},
    {title: 'Circulating Supply', value: `$${millify(coinDetails?.supply?.circulating)}`}
  ];

  return (
    <CoinContext.Provider value={value}>
      {!coinDetails || !coinHistory ? (
        <div
          ref={loaderRef}
          className="w-screen h-screen flex justify-center items-center"
        >
          <CircularProgress size="10rem" />
        </div>
      ) : (
        <div id="coin" ref={coinRootRef}>
          <Paper ref={statsRef} className="coin-stats" elevation={4}>
            <img src={coinDetails?.iconUrl} alt="" />
            <h1 className="text-lg mb-4 mt-2">
              {coinDetails?.name} {coinDetails?.symbol}
            </h1>
            {stats.map(({ title, value }) => (
              <div key={title} className="coin-stat">
                <h1>{title}</h1>
                <h1>{value}</h1>
              </div>
            ))}
          </Paper>
          <div
            ref={chartRef}
            className="w-full max-w-[min(100%,90rem)] min-w-0 lg:flex-1"
          >
            <LineChart />
          </div>
        </div>
      )}
    </CoinContext.Provider>
  )
}

export default Coin