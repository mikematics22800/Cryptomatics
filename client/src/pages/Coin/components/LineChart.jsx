import { useMemo, useContext } from "react"
import { CoinContext } from "../Coin"
import { Line } from "react-chartjs-2"
import { Box, MenuItem, Select, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
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
  const theme = useTheme()
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
          changeColor: isPositive
            ? theme.palette.success.main
            : theme.palette.error.main,
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
        changeColor: isPositive
          ? theme.palette.success.main
          : theme.palette.error.main,
        showPlus: isPositive,
      }
    }, [coinHistory, currency, usdPerEur, timePeriod, theme])

  const lineColor = theme.palette.primary.main

  const data = {
    labels: timestamps,
    datasets: [
      {
        label: currency === "EUR" ? "Price (EUR)" : "Price (USD)",
        data: prices,
        backgroundColor: lineColor,
        borderColor: lineColor,
        pointBackgroundColor: lineColor,
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.25,
        borderWidth: 2,
        fill: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  }

  return (
    <Box id="line-chart" sx={{ width: "100%", minWidth: 0 }}>
      <Box
        id="select"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2.5,
        }}
      >
        <Select
          value={timePeriod}
          size="small"
          onChange={(e) => setTimePeriod(e.target.value)}
          sx={{
            minWidth: 140,
            fontWeight: 600,
            bgcolor: "background.paper",
          }}
        >
          <MenuItem value="3h">3 Hours</MenuItem>
          <MenuItem value="24h">1 Day</MenuItem>
          <MenuItem value="7d">1 Week</MenuItem>
          <MenuItem value="30d">30 Days</MenuItem>
          <MenuItem value="1y">1 Year</MenuItem>
          <MenuItem value="3y">3 Years</MenuItem>
          <MenuItem value="5y">5 Years</MenuItem>
        </Select>
        <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
          <Typography
            component="p"
            variant="h6"
            sx={{ fontWeight: 700, color: changeColor, m: 0, lineHeight: 1.2 }}
          >
            {showPlus ? "+" : ""}
            {changeStr}%
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          height: { xs: 260, sm: 300, md: 360, lg: 400, xl: 440 },
          minHeight: 220,
          position: "relative",
        }}
      >
        <Line data={data} options={options} />
      </Box>
    </Box>
  )
}

export default LineChart
