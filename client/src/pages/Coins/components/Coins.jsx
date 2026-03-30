import { useContext } from "react"
import { CoinsContext } from "../Coins"
import { AccessTime, LocalAtm, ShowChart } from "@mui/icons-material"
import millify from "millify"
import { Card } from "antd"
import { Link } from "react-router-dom"
import { formatFiatAmount } from "../../../hooks/useFiatCurrency.js"

const Coins = () => {
  const { coins, currency, usdPerEur } = useContext(CoinsContext)
  return (
    <div id="coins">
    {coins?.map((coin) => (
      <Link
        key={coin.uuid}
        to={`/currencies/${coin.uuid}`}
        className="block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400/60"
      >
        <Card
          className="coin-catalog-card w-64"
          title={`${coin.rank}. ${coin.name}`}
          extra={<img className="h-10 w-10" src={coin.iconUrl} alt="" />}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <LocalAtm className="mr-1"/>
              <h1 className="font-bold">Price</h1>
            </div>
            {formatFiatAmount(coin.price, currency, usdPerEur)}
          </div>
          <div className="flex items-center justify-between my-2">
            <div className="flex items-center">
              <ShowChart className="mr-1"/>
              <h1 className="font-bold">Market Cap</h1>
            </div>
            {formatFiatAmount(coin.marketCap, currency, usdPerEur)}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AccessTime className="mr-1"/>
              <h1 className="font-bold">Daily Cap</h1>
            </div> 
            {millify(coin.change)}%
          </div>
        </Card>
      </Link>
    ))}
  </div>
  )
}

export default Coins