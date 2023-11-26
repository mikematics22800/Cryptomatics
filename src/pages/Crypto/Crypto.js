import { useState, useEffect } from "react"
import millify from "millify"
import { Link } from "react-router-dom"
import { Card } from "antd"
import { getCryptos } from "../../api/cryptoApi"
import { Search, LocalAtm, AccessTime, ShowChart }  from '@mui/icons-material';
import { CircularProgress, Button, Paper } from "@mui/material";

const Crypto = ({ simplified }) => {
  const count = simplified ? 10 : 100;
  const [query, setQuery] = useState('')
  const [coins, setCoins] = useState(null)

  useEffect(() => {
    getCryptos(count).then((data)=> {
      console.log(data)
      setCoins(data.data.coins.filter((coin) => coin.name.toLowerCase().includes(query.toLowerCase())))
    })
  }, [query])

  return (
    <div className='flex flex-col items-center w-screen'>
      {simplified ? (<h1 className="font-bold text-2xl">Top 10 Cryptocurrencies</h1>) : (
        <div className="fixed w-full flex justify-center items-center z-10 mt-20 h-20 bg-blue-950">
          <Paper className="flex rounded py-1 px-3 text-lg items-center w-64">
            <input className="w-full outline-none" placeholder="Search..." onChange={(e) => {setQuery(e.target.value)}}/>
            <Search sx={{color: "gray"}}/>
          </Paper>
        </div>
      )}
      <div className={`flex flex-col items-center w-screen ${!simplified && 'mt-40'}`}>
      {!coins ? (
        <CircularProgress size='10rem' className="mt-20"/>
      ) : (
        <>
          <div className="w-screen p-5 flex flex-wrap justify-center">
            {coins?.map((coin) => (
              <Link key={coin.uuid} className="m-5 w w-64" to={`/crypto/coin/${coin.uuid}`}>
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
          {simplified && <Link to="/crypto" className="mb-20">
            <Button size="large" variant="contained">SHOW MORE</Button>
          </Link>}
        </>
      )} 
      </div>
    </div>
  )
}

export default Crypto