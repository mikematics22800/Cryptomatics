import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { MenuItem, Select } from '@mui/material';
import { getCryptoHistory } from '../../../../api/cryptoApi';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend );

const LineChart = ({ coinId }) => {
  const [change, setChange] = useState('')
  const [color, setColor] = useState('')
  const [plus, setPlus] = useState('')
  const [prices, setPrices] = useState([])
  const [timestamps, setTimestamps] = useState([])
  const [timePeriod, setTimePeriod] = useState('7d')

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  useEffect(() => {
    getCryptoHistory({ coinId, timePeriod }).then((data) => {
      setChange(data.data.change)
      if (parseFloat(data.data.change) > 0) {
        setColor('green')
        setPlus(true)
      } else {
        setColor('red')
        setPlus(false)
      }
      const prices = data.data.history.map((history) => history.price);
      const timestamps = []
      data.data.history.map((history) => {
        const date = new Date(history.timestamp * 1000)
        console.log(date)
        if (timePeriod.includes('h')) {
          timestamps.push(timeFormatter.format(date))
        } else {
          timestamps.push(date.toLocaleDateString())
        }
      })
      setTimestamps(timestamps.reverse());
      setPrices(prices.reverse());
    })
  }, [timePeriod])

  const data = {
    labels: timestamps,
    datasets: [
      {
        label: 'Price In USD', 
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
    <div className='w-screen px-5 sm:px-10 sm:mb-10 mb-5'>
      <div className='w-full flex items-center justify-between mb-5'>
        <Select className='!h-10 bg-white' defaultValue={'7d'} size="small" onChange={(e) => setTimePeriod(e.target.value)}>
          <MenuItem value={'3h'}>3 Hours</MenuItem>
          <MenuItem value={'24h'}>1 Day</MenuItem>
          <MenuItem value={'7d'}>1 Week</MenuItem>
          <MenuItem value={'30d'}>30 Days</MenuItem>
          <MenuItem value={'1y'}>1 Year</MenuItem>
          <MenuItem value={'3y'}>3 Years</MenuItem>
          <MenuItem value={'5y'}>5 Years</MenuItem>
        </Select>
        <h1 className='text-2xl font-bold' style={{color:color}}>{plus == true ? ('+') : ('')}{change}%</h1>
      </div>
      <div className='sm:h-[32rem] h-[16rem]'>
        <Line data={data} options={options}/>
      </div>
    </div>
  )
}

export default LineChart