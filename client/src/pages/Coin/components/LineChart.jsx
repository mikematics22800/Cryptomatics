import { useMemo, useContext } from "react"
import { CoinContext } from "../Coin"
import { Line } from "react-chartjs-2"
import { MenuItem, Select } from "@mui/material"
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "numeric",
  hour12: true,
})

const LineChart = () => {
  const { coinHistory, timePeriod, setTimePeriod, currency, usdPerEur } =
    useContext(CoinContext)

  const { timestamps, prices, changeStr, changeColor, showPlus } =
    useMemo(() => {
      const changeStr = coinHistory?.change ?? ""
      const changeVal = parseFloat(changeStr)
      const isPositive = Number.isFinite(changeVal) && changeVal > 0
      const hist = coinHistory?.history
      if (!hist?.length) {
        return {
          timestamps: [],
          prices: [],
          changeStr,
          changeColor: isPositive ? "green" : "red",
          showPlus: isPositive,
        }
      }
      const rawUsd = hist.map((h) => Number(h.price))
      const display =
        currency === "EUR" && usdPerEur
          ? rawUsd.map((p) => p / usdPerEur)
          : rawUsd
      const ts = hist.map((h) => {
        const date = new Date(h.timestamp * 1000)
        return timePeriod.includes("h")
          ? timeFormatter.format(date)
          : date.toLocaleDateString()
      })
      return {
        timestamps: [...ts].reverse(),
        prices: [...display].reverse(),
        changeStr,
        changeColor: isPositive ? "green" : "red",
        showPlus: isPositive,
      }
    }, [coinHistory, currency, usdPerEur, timePeriod])

  const data = {
    labels: timestamps,
    datasets: [
      {
        label: currency === "EUR" ? "Price (EUR)" : "Price (USD)",
        data: prices,
        backgroundColor: "blue",
        borderColor: "blue",
        pointBackgroundColor: "blue",
        color: "white",
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  }

  return (
    <div id="line-chart">
      <div id="select">
        <Select
          className="!h-10 bg-white !font-bold"
          value={timePeriod}
          size="small"
          onChange={(e) => setTimePeriod(e.target.value)}
        >
          <MenuItem value="3h">3 Hours</MenuItem>
          <MenuItem value="24h">1 Day</MenuItem>
          <MenuItem value="7d">1 Week</MenuItem>
          <MenuItem value="30d">30 Days</MenuItem>
          <MenuItem value="1y">1 Year</MenuItem>
          <MenuItem value="3y">3 Years</MenuItem>
          <MenuItem value="5y">5 Years</MenuItem>
        </Select>
        <h1 className="text-lg font-bold" style={{ color: changeColor }}>
          {showPlus ? "+" : ""}
          {changeStr}%
        </h1>
      </div>
      <div className="h-72 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] min-h-[16rem]">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}

export default LineChart
