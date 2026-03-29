import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import gsap from "gsap"
import { Search } from "@mui/icons-material"
import { getCoins } from "../../utils/coinranking.js"
import { CircularProgress, ToggleButton, ToggleButtonGroup } from "@mui/material"
import Coins from "./components/Coins.jsx"
import { useFiatCurrency } from "../../hooks/useFiatCurrency.js"

export const CoinsContext = createContext()

const CoinsPage = () => {
  const [query, setQuery] = useState("")
  const fiat = useFiatCurrency()

  const [coins, setCoins] = useState(null)

  const homeRef = useRef(null)
  const loaderRef = useRef(null)
  const coinsWrapRef = useRef(null)
  const homeIntroDone = useRef(false)

  useEffect(() => {
    getCoins().then((data) => {
      setCoins(
        data.data.coins.filter((coin) =>
          coin.name.toLowerCase().includes(query.toLowerCase())
        )
      )
    })
  }, [query])

  useLayoutEffect(() => {
    if (coins) return
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
  }, [coins])

  useLayoutEffect(() => {
    if (!coins) return

    const ctx = gsap.context(() => {
      if (!homeIntroDone.current) {
        homeIntroDone.current = true
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
  }, [coins])

  const value = { coins, ...fiat }

  return (
    <CoinsContext.Provider value={value}>
      <div id="home" ref={homeRef}>
        {!coins ? (
          <div
            ref={loaderRef}
            className="fixed top-0 w-screen h-screen flex justify-center items-center"
          >
            <CircularProgress size="10rem" />
          </div>
        ) : (
          <>
            <div className="flex w-full flex-wrap items-center justify-center gap-3 px-2">
              <div id="searchbar">
                <input
                  type="search"
                  placeholder="Enter currency"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search coins"
                />
                <Search className="shrink-0 text-slate-400" fontSize="medium" />
              </div>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={fiat.currency}
                onChange={(_, v) => v && fiat.setCurrency(v)}
                aria-label="Display currency"
              >
                <ToggleButton value="USD">USD</ToggleButton>
                <ToggleButton value="EUR">EUR</ToggleButton>
              </ToggleButtonGroup>
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

export default CoinsPage
