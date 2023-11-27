import axios from 'axios';

const headers = {
  'X-RapidAPI-Key': "b838712149msh20436172aeaeb14p16cfa4jsn227b1dfecc4d",
  'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com'
}

export const getCryptos = async (limit) => {
  try {
    const { data: data } = await axios.request({
      method: 'GET',
      url: `https://coinranking1.p.rapidapi.com/coins?limit=${limit}`,
      headers: headers
    });
    return data
  } catch (error) {
    console.error(error);
    console.log(process.env.REACT_APP_RAPID_API_KEY)
  }
}

export const getCryptoDetails = async (coinId) => {
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

export const getCryptoHistory = async ({coinId, timePeriod}) => {
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


