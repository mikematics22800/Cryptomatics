import { useState, useEffect, useContext } from 'react'
import { CoinContext } from '../Coin';
import { Line } from 'react-chartjs-2'
import { MenuItem, Select } from '@mui/material';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend );

const LineChart = () => {
  const { coinHistory, timePeriod, setTimePeriod } = useContext(CoinContext)

  const [change, setChange] = useState('')
  const [color, setColor] = useState('')
  const [plus, setPlus] = useState('')
  const [prices, setPrices] = useState([])
  const [timestamps, setTimestamps] = useState([])

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  useEffect(() => {
    setChange(coinHistory.change)
    if (parseFloat(coinHistory.change) > 0) {
      setColor('green')
      setPlus(true)
    } else {
      setColor('red')
      setPlus(false)
    }
    const prices = coinHistory.history.map((history) => history.price);
    const timestamps = []
    coinHistory.history.map((history) => {
      const date = new Date(history.timestamp * 1000)
      if (timePeriod.includes('h')) {
        timestamps.push(timeFormatter.format(date))
      } else {
        timestamps.push(date.toLocaleDateString())
      }
    })
    setTimestamps(timestamps.reverse());
    setPrices(prices.reverse());
  }, [coinHistory])

  const data = {
    labels: timestamps,
    datasets: [
      {
        label: 'Price (USD)', 
        data: prices, 
        backgroundColor: 'blue',
        borderColor: 'blue',
        pointBackgroundColor: 'blue',
        color: 'white'
      }
    ]
  }
 
  const options = {
    responsive: true,
    maintainAspectRatio: false, 
  };

  return (
    <div id="line-chart">
      <div id='select'>
        <Select className='!h-10 bg-white' defaultValue={'7d'} size="small" onChange={(e) => setTimePeriod(e.target.value)}>
          <MenuItem value={'3h'}>3 Hours</MenuItem>
          <MenuItem value={'24h'}>1 Day</MenuItem>
          <MenuItem value={'7d'}>1 Week</MenuItem>
          <MenuItem value={'30d'}>30 Days</MenuItem>
          <MenuItem value={'1y'}>1 Year</MenuItem>
          <MenuItem value={'3y'}>3 Years</MenuItem>
          <MenuItem value={'5y'}>5 Years</MenuItem>
        </Select>
        <h1 className='text-lg font-bold' style={{color:color}}>{plus == true ? ('+') : ('')}{change}%</h1>
      </div>
      <div className='lg:h-96 md:h-80 sm:h-64'>
        <Line data={data} options={options}/>
      </div>
    </div>
  )
}

export default LineChart