import { useContext, useMemo } from "react"
import { CoinsContext } from "../Home"
import millify from "millify"
import HubOutlinedIcon from "@mui/icons-material/HubOutlined"
import SwapHorizIcon from "@mui/icons-material/SwapHoriz"
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined"
import WaterfallChartIcon from "@mui/icons-material/WaterfallChart"
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined"

const fmt = (n, millifyValue = true) => {
  if (n == null || Number.isNaN(Number(n))) return "—"
  return millifyValue ? millify(Number(n)) : Number(n).toLocaleString()
}

function StatTile({ label, value, Icon }) {
  return (
    <div className="market-stat-tile" role="listitem">
      <Icon className="market-stat-tile-icon" />
      <span className="market-stat-tile-label">{label}</span>
      <p className="market-stat-tile-value">{value}</p>
    </div>
  )
}

const MarketStats = () => {
  const { marketStats } = useContext(CoinsContext)

  const tiles = useMemo(
    () => [
      {
        key: "coins",
        label: "Cryptocurrencies",
        value: fmt(marketStats?.total, false),
        Icon: HubOutlinedIcon,
      },
      {
        key: "exchanges",
        label: "Exchanges",
        value: fmt(marketStats?.totalExchanges),
        Icon: SwapHorizIcon,
      },
      {
        key: "cap",
        label: "Market cap",
        value: fmt(marketStats?.totalMarketCap),
        Icon: SavingsOutlinedIcon,
      },
      {
        key: "volume",
        label: "24h volume",
        value: fmt(marketStats?.total24hVolume),
        Icon: WaterfallChartIcon,
      },
      {
        key: "markets",
        label: "Markets",
        value: fmt(marketStats?.totalMarkets),
        Icon: StorefrontOutlinedIcon,
      },
    ],
    [marketStats]
  )

  return (
    <section
      id="market-stats"
      className="market-stats-panel"
      aria-labelledby="market-stats-heading"
    >
      <div className="market-stats-grid" role="list">
        {tiles.map(({ key, label, value, Icon }) => (
          <StatTile key={key} label={label} value={value} Icon={Icon} />
        ))}
      </div>
    </section>
  )
}

export default MarketStats
