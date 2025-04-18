import { useContext } from "react"
import { CoinsContext } from "../Home"
import { AccessTime, LocalAtm, ShowChart } from "@mui/icons-material"
import millify from "millify"
import { Card } from "antd"
import { Link } from "react-router-dom"

const Coins = () => {
  const {coins} = useContext(CoinsContext)
  return (
    <div id="coins">
    {coins?.map((coin) => (
      <Link key={coin.uuid} to={`/${coin.uuid}`}>
        <Card className="w-60" title={`${coin.rank}. ${coin.name}`} extra={<img className="w-10 h-10" src={coin.iconUrl}/>} hoverable>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <LocalAtm className="mr-1"/>
              <h1 className="font-bold">Price</h1>
            </div>
            ${millify(coin.price)}
          </div>
          <div className="flex items-center justify-between my-2">
            <div className="flex items-center">
              <ShowChart className="mr-1"/>
              <h1 className="font-bold">Market Cap</h1>
            </div>
            ${millify(coin.marketCap)}
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