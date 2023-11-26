import { useState, useEffect } from "react"
import millify from "millify"
import { getCryptos } from "../api/cryptoApi"
import { CircularProgress, Paper } from "@mui/material"
import Crypto from "./Crypto/Crypto"
import logo from ".././images/logo.svg"

const Home = () => {
  const [globalStats, setGlobalStats] = useState(null)

  useEffect(() => {
    getCryptos(10).then((data) => {
      setGlobalStats(data.data.stats)
    })
  }, [])

  return (
    <div className="p-10 font-bold flex flex-col overflow-x-hidden items-center w-screen h-screen mt-20">
      <img src={logo} className="w-60 "/>
      <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r p-2 text-transparent bg-clip-text from-amber-500 via-orange-600 to-yellow-500">CRYPTOMATICS</h1>
      <h2 className="text-2xl sm:text-4xl font-black bg-gradient-to-r p-2 text-transparent bg-clip-text from-cyan-500 to-blue-500 text-center">Get the latest crypto stats and trends in real time.</h2>
      {!globalStats ? (
        <CircularProgress size='10rem' className="my-40"/>
      ) : (
        <div className="flex flex-col items-center w-screen mt-5">
          <h1 className="text-2xl my-5">Global Stats</h1>
          <Paper className="flex flex-col justify-between sm:flex-row mb-10 p-10">
            <div>
              <h1 className="opacity-50">Total Cryptocurrencies</h1>
              <div className="text-2xl">{globalStats.total}</div>
            </div>
            <div className="mx-0 my-5 sm:mx-10 sm:my-0">
              <h1 className="opacity-50">Total Exchanges</h1>
              <div className="text-2xl">{millify(globalStats.totalExchanges)}</div>
            </div>
            <div>
              <h1 className="opacity-50">Total Market Cap</h1>
              <div className="text-2xl">{millify(globalStats.totalMarketCap)}</div>
            </div>
            <div  className="mx-0 my-5 sm:mx-10 sm:my-0">
              <h1 className="opacity-50">Total 24h Volume</h1>
              <div className="text-2xl">{millify(globalStats.total24hVolume)}</div>
            </div>
            <div>
              <h1 className="opacity-50">Total Markets</h1>
              <div className="text-2xl">{millify(globalStats.totalMarkets)}</div>
            </div>
          </Paper>
          <Crypto simplified/>
        </div> 
      )}
    </div>
  ) 
}

export default Home


