import millify from "millify"
import { Link } from "react-router-dom"
import { Card } from "antd"
import { LocalAtm, AccessTime, ShowChart }  from '@mui/icons-material';
import { CircularProgress } from "@mui/material";

const Crypto = ({ coins }) => {
  return (
    <>
      <h1 className="text-2xl">Top 100 Cryptocurrencies</h1>
      {!coins ? (
        <CircularProgress/>
      ) : (
        <div className="w-screen p-5 flex flex-wrap justify-center">
          {coins?.map((coin) => (
            <Link key={coin.uuid} className="m-5 w w-64" to={`/coin/${coin.uuid}`}>
              <Card title={`${coin.rank}. ${coin.name}`} extra={<img className="w-10 h-10" src={coin.iconUrl}/>} hoverable>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <LocalAtm className="mr-1"/>
                    <h1 className="font-bold">Price:</h1>
                  </div>
                  ${millify(coin.price)}</div>
                <div className="flex items-center justify-between my-2">
                  <div className="flex items-center">
                    <ShowChart className="mr-1"/>
                    <h1 className="font-bold">Market Cap:</h1>
                  </div>
                  ${millify(coin.marketCap)}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AccessTime className="mr-1"/>
                    <h1 className="font-bold">Daily Cap:</h1>
                  </div> 
                  {millify(coin.change)}%
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )} 
    </>
  )
}

export default Crypto