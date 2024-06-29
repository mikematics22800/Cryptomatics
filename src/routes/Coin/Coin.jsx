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

  const stats1 = [
    { i:0, title: 'Price to USD:', value: `$${millify(coinDetails?.price)}`},
    { i:1, title: 'Rank:', value: coinDetails?.rank, icon: <Tag/>},
    { i:2, title: '24h Volume:', value: `$${millify(coinDetails?.["24hVolume"])}`},
    { i:3, title: 'Market Cap:', value: `$${millify(coinDetails?.marketCap)}`},
    { i:4, title: 'All-time-high:', value: `$${millify(coinDetails?.allTimeHigh?.price)}`},
  ];

  const stats2 = [
    { i:0, title: 'Number Of Markets:', value: coinDetails?.numberOfMarkets},
    { i:1, title: 'Number Of Exchanges:', value: coinDetails?.numberOfExchanges},
    { i:2, title: 'Aprroved Supply:', value: coinDetails?.supply?.confirmed ? <Check/> : <Close/>},
    { i:3, title: 'Total Supply:', value: `$${millify(coinDetails?.supply?.total)}`},
    { i:4, title: 'Circulating Supply:', value: `$${millify(coinDetails?.supply?.circulating)}`},
  ];
  
  return (
    <CoinContext.Provider value={value}>
      <div id="coin">
        {!coinDetails || !coinHistory ? (
          <CircularProgress size='10rem'/>
        ) : (
          <>
            <div id="coin-stats">
              <header className="xl:hidden flex">
                <img src={coinDetails?.iconUrl}/>
                <h1>{coinDetails?.name} {coinDetails?.symbol}</h1>
              </header>
              <Paper>
                {stats1.map(({ title, value, i }) => (
                  <div className="box" key={i}>
                    <h1>{title}</h1>
                    <h1>{value}</h1>
                  </div>
                ))}
              </Paper>
              <header className="name-logo xl:flex hidden">
                <img src={coinDetails?.iconUrl}/>
                <h1>{coinDetails?.name} ({coinDetails?.symbol})</h1>
              </header>
              <Paper>
                {stats2.map(({ title, value, i }) => (
                  <div className="box" key={i}>
                    <h1>{title}</h1>
                    <h1>{value}</h1>
                  </div>
                ))}
                </Paper>
            </div>
            <LineChart/>
          </>
        )}
      </div>
    </CoinContext.Provider>
  )
}

export default Coin