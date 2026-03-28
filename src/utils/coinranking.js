import axios from 'axios';

const headers = {
  'X-RapidAPI-Key': import.meta.env.VITE_COINRANKING_API_KEY,
  'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com'
}

export const getCoins = async () => {
  try {
    const { data: data } = await axios.request({
      method: 'GET',
      url: `https://coinranking1.p.rapidapi.com/coins?limit=100`,
      headers: headers
    });
    return data
  } catch (error) {
    console.error(error);
  }
}

export const getCoinDetails = async (coinId) => {
  try {
    const { data: data } = await axios.request({
      method: 'GET',
      url: `https://coinranking1.p.rapidapi.com/coin/${coinId}`,
      headers: headers
    });
    return data
  } catch (error) {
    console.error(error);
  }
}

export const getCoinHistory = async ({coinId, timePeriod}) => {
  try {
    const { data: data } = await axios.request({
      method: 'GET',
      url: `https://coinranking1.p.rapidapi.com/coin/${coinId}/history?timePeriod=${timePeriod}`,
      headers: headers
    });
    return data
  } catch (error) {
    console.log(error)
  }
}


