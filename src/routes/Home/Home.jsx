import { createContext, useContext, useEffect, useState } from "react"
import { RootContext } from "../Root/Root"
import { getCoins } from "../../libs/api"
import { CircularProgress } from "@mui/material"
import logo from "./images/logo.svg"
import MarketStats from "./components/MarketStats"
import Coins from "./components/Coins"

export const CoinsContext = createContext()

const Home = () => {
  const {query} = useContext(RootContext)

  const [marketStats, setMarketStats] = useState(null)
  const [coins, setCoins] = useState(null)

  useEffect(() => {
    getCoins().then((data) => {
      setMarketStats(data.data.stats)
      setCoins(data.data.coins.filter((coin) => coin.name.toLowerCase().includes(query.toLowerCase())))})
  }, [query])

  const value = { marketStats, coins }
  
  return (
    <CoinsContext.Provider value={value}>
      <div id="home">
        {!marketStats || !coins ? (
          <CircularProgress size='10rem'/>
        ) : (
          <>
            <div id="hero">
              <div id="title">
                <img src={logo}/>
                <h1>CRYPTOMATICS</h1>
              </div>
              <h1 id="tagline">Maximize your returns with real time coin stats and market trends!</h1>
            </div>
            <MarketStats/>
            <Coins/>
          </> 
        )}
      </div>  
    </CoinsContext.Provider>
  )
}

export default Home
