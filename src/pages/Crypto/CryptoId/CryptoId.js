import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom"
import millify from "millify"
import { getCryptoDetails } from "../../../api/cryptoApi";
import { Tag, Check, Close, ArrowCircleLeft }  from '@mui/icons-material';
import LineChart from "./components/LineChart";
import { CircularProgress, Paper } from "@mui/material";

const CryptoId = () => {
  const coinId = useParams().id
  const [details, setDetails] = useState(null)

  useEffect(() => {
    getCryptoDetails(coinId).then((data) => {
      setDetails(data.data.coin)
    })
  }, [])

  const stats = [
    { i:0, title: 'Price to USD:', value: `$${millify(details?.price)}`},
    { i:1, title: 'Rank:', value: details?.rank, icon: <Tag/>},
    { i:2, title: '24h Volume:', value: `$${millify(details?.["24hVolume"])}`},
    { i:3, title: 'Market Cap:', value: `$${millify(details?.marketCap)}`},
    { i:4, title: 'All-time-high:', value: `$${millify(details?.allTimeHigh?.price)}`},
  ];

  const otherStats = [
    { i:0, title: 'Number Of Markets:', value: details?.numberOfMarkets},
    { i:1, title: 'Number Of Exchanges:', value: details?.numberOfExchanges},
    { i:2, title: 'Aprroved Supply:', value: details?.supply?.confirmed ? <Check/> : <Close/>},
    { i:3, title: 'Total Supply:', value: `$${millify(details?.supply?.total)}`},
    { i:4, title: 'Circulating Supply:', value: `$${millify(details?.supply?.circulating)}`},
  ];

  return (
    <div className="mt-24 w-screen flex flex-col items-center">
      {!details ? (
        <CircularProgress size='10rem' className="mt-20"/>
      ) : (
        <>
          <div className="flex justify-start w-screen">
            <Link to='/crypto' className="ml-5 p-0 my-0 sm:my-5 text-blue-950">
              <ArrowCircleLeft className="!text-6xl rounded-full"/>
            </Link>
          </div>
          <div className="text-xl font-bold flex w-screen px-20 flex-col items-center mb-20 justify-between xl:flex-row">
            <img className="h-72 xl:hidden block" src={details?.iconUrl}/>
            <h1 className="!text-3xl text-blue-700 font-bold mb-10 xl:hidden text-center">{details?.name} ({details?.symbol})</h1>
            <Paper>
              {stats.map(({ title, value, i }) => (
                <div className="flex justify-between p-5 items-center w-80 sm:w-96 border-b-gray-400 border-b-2" key={i}>
                  <h1>{title}</h1>
                  <h1>{value}</h1>
                </div>
              ))}
            </Paper>
            <div className="flex-col items-center hidden xl:flex">
              <img className="h-72" src={details?.iconUrl}/>
              <h1 className="!text-3xl text-blue-700 font-bold mt-10">{details?.name} ({details?.symbol})</h1>
            </div>
            <Paper>
              {otherStats.map(({ title, value, i }) => (
                <div className="flex justify-between p-5 items-center w-80 sm:w-96 border-b-gray-400 border-b-2" key={i}>
                  <h1>{title}</h1>
                  <h1>{value}</h1>
                </div>
              ))}
              </Paper>
          </div>
          <LineChart coinId={details?.uuid} coinName={details?.name}/>
        </>
      )}
    </div>
  )
}

export default CryptoId