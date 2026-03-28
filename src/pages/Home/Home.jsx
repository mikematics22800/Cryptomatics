import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import gsap from "gsap"
import { RootContext } from "../../layouts/RootLayout.jsx"
import { getCoins } from "../../utils/coinranking.js"
import { CircularProgress } from "@mui/material"
import MarketStats from "./components/MarketStats"
import Coins from "./components/Coins"

export const CoinsContext = createContext()

const Home = () => {
  const { query } = useContext(RootContext)

  const [marketStats, setMarketStats] = useState(null)
  const [coins, setCoins] = useState(null)

  const homeRef = useRef(null)
  const loaderRef = useRef(null)
  const statsWrapRef = useRef(null)
  const coinsWrapRef = useRef(null)
  const homeIntroDone = useRef(false)

  useEffect(() => {
    getCoins().then((data) => {
      setMarketStats(data.data.stats)
      setCoins(
        data.data.coins.filter((coin) =>
          coin.name.toLowerCase().includes(query.toLowerCase())
        )
      )
    })
  }, [query])

  useLayoutEffect(() => {
    if (marketStats && coins) return
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
  }, [marketStats, coins])

  useLayoutEffect(() => {
    if (!marketStats || !coins) return

    const ctx = gsap.context(() => {
      if (!homeIntroDone.current) {
        homeIntroDone.current = true
        const paper = statsWrapRef.current?.querySelector("#market-stats")
        const blocks = paper?.querySelectorAll(".market-stat-tile") || []
        if (paper) {
          const tl = gsap.timeline()
          tl.from(paper, {
            opacity: 0,
            y: 26,
            duration: 0.52,
            ease: "power3.out",
          })
          if (blocks.length) {
            tl.from(
              blocks,
              {
                opacity: 0,
                y: 14,
                stagger: 0.055,
                duration: 0.4,
                ease: "power2.out",
              },
              "-=0.32"
            )
          }
        }
        const links = coinsWrapRef.current?.querySelectorAll("#coins > a")
        if (links?.length) {
          gsap.from(links, {
            opacity: 0,
            y: 32,
            scale: 0.96,
            duration: 0.5,
            stagger: { each: 0.045, from: "start" },
            ease: "power3.out",
            delay: 0.12,
          })
        }
        return
      }

      const links = coinsWrapRef.current?.querySelectorAll("#coins > a")
      if (links?.length) {
        gsap.fromTo(
          links,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.32,
            stagger: 0.025,
            ease: "power2.out",
          }
        )
      }
    }, homeRef)

    return () => ctx.revert()
  }, [marketStats, coins])

  const value = { marketStats, coins }

  return (
    <CoinsContext.Provider value={value}>
      <div id="home" ref={homeRef}>
        {!marketStats || !coins ? (
          <div
            ref={loaderRef}
            className="fixed top-0 w-screen h-screen flex justify-center items-center"
          >
            <CircularProgress size="10rem" />
          </div>
        ) : (
          <>
            <div ref={statsWrapRef} className="w-full flex justify-center">
              <MarketStats />
            </div>
            <div ref={coinsWrapRef} className="w-full">
              <Coins />
            </div>
          </>
        )}
      </div>
    </CoinsContext.Provider>
  )
}

export default Home
