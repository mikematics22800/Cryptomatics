import { createContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import millify from "millify";
import { CircularProgress, Paper } from "@mui/material";
import { Tag } from "antd";
import { Check, Close } from "@mui/icons-material";
import LineChart from "./components/LineChart";
import { getCoinDetails, getCoinHistory } from "../../libs/api";

export const CoinContext = createContext()

const Coin = () => {
  const [coinDetails, setCoinDetails] = useState(null)
  const [coinHistory, setCoinHistory] = useState(null)
  const [timePeriod, setTimePeriod] = useState('7d')
  const coinId = useParams().id

  useEffect(() => {
    getCoinDetails(coinId).then((data) => {
      setCoinDetails(data.data.coin)
    })
  }, [])

  useEffect(() => {
    getCoinHistory({coinId, timePeriod}).then((data) => {
      setCoinHistory(data.data)
    })  
  }, [timePeriod])

  const value = { coinDetails, coinHistory, timePeriod, setTimePeriod }

  const stats = [
    {title: 'Price to USD', value: `$${millify(coinDetails?.price)}`},
    {title: 'Rank', value: coinDetails?.rank, icon: <Tag/>},
    {title: '24h Volume', value: `$${millify(coinDetails?.["24hVolume"])}`},
    {title: 'Market Cap', value: `$${millify(coinDetails?.marketCap)}`},
    {title: 'All-time-high', value: `$${millify(coinDetails?.allTimeHigh?.price)}`},
    {title: 'Number Of Markets', value: coinDetails?.numberOfMarkets},
    {title: 'Number Of Exchanges', value: coinDetails?.numberOfExchanges},
    {title: 'Aprroved Supply', value: coinDetails?.supply?.confirmed ? <Check/> : <Close/>},
    {title: 'Total Supply', value: `$${millify(coinDetails?.supply?.total)}`},
    {title: 'Circulating Supply', value: `$${millify(coinDetails?.supply?.circulating)}`}
  ];

  return (
    <CoinContext.Provider value={value}>
      {!coinDetails || !coinHistory ? (
        <div className="w-screen h-screen flex justify-center items-center">
          <CircularProgress size='10rem'/>
        </div>
      ) : (
        <div className="coin">
          <Paper className="coin-stats">
            <img src={coinDetails?.iconUrl}/>
            <h1 className="text-xl mb-4 mt-2">{coinDetails?.name} {coinDetails?.symbol}</h1>
            {stats.map(({ title, value }) => (
              <div className="coin-stat">
                <h1>{title}</h1>
                <h1>{value}</h1>
              </div>
            ))}
          </Paper>
          <LineChart/>
        </div>
      )}
    </CoinContext.Provider>
  )
}

export default Coin