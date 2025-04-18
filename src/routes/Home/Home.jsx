import { createContext, useContext, useEffect, useState } from "react"
import { RootContext } from "../Root/Root"
import { getCoins } from "../../libs/api"
import { CircularProgress } from "@mui/material"
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
          <div className="fixed top-0 w-screen h-screen flex justify-center items-center">
            <CircularProgress size='10rem'/>
          </div>
        ) : (
          <>
            <MarketStats/>
            <Coins/>
          </> 
        )}
      </div>  
    </CoinsContext.Provider>
  )
}

export default Home
