import { useContext } from "react"
import { CoinsContext } from "../Home"
import { Paper } from "@mui/material"
import millify from "millify"

const MarketStats = () => {
  const {marketStats} = useContext(CoinsContext)
  return (
    <Paper id="market-stats">
      <div>
        <h1>Total Cryptocurrencies</h1>
        <h2>{marketStats.total}</h2>
      </div>
      <div>
        <h1>Total Exchanges</h1>
        <h2>{millify(marketStats.totalExchanges)}</h2>
      </div>
      <div>
        <h1>Total Market Cap</h1>
        <h2 >{millify(marketStats.totalMarketCap)}</h2>
      </div>
      <div>
        <h1>Total 24h Volume</h1>
        <h2>{millify(marketStats.total24hVolume)}</h2>
      </div>
      <div>
        <h1>Total Markets</h1>
        <h2>{millify(marketStats.totalMarkets)}</h2>
      </div>
    </Paper>
  )
}

export default MarketStats