import axios from "axios"

const headers = {
  "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
  "X-RapidAPI-Host": "coinranking1.p.rapidapi.com",
}

export async function getCoins() {
  try {
    const { data } = await axios.request({
      method: "GET",
      url: "https://coinranking1.p.rapidapi.com/coins?limit=100",
      headers,
    })
    console.log(data);
    return data
  } catch (error) {
    console.error(error)
  }
}

export async function getCoinDetails(coinId) {
  try {
    const { data } = await axios.request({
      method: "GET",
      url: `https://coinranking1.p.rapidapi.com/coin/${coinId}`,
      headers,
    })
    return data
  } catch (error) {
    console.error(error)
  }
}

export async function getCoinHistory({ coinId, timePeriod }) {
  try {
    const { data } = await axios.request({
      method: "GET",
      url: `https://coinranking1.p.rapidapi.com/coin/${coinId}/history?timePeriod=${timePeriod}`,
      headers,
    })
    return data
  } catch (error) {
    console.error(error)
  }
}

