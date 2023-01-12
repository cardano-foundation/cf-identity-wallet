import axios from 'axios';

const COIN_GECKO_URL = 'https://api.coingecko.com/api/v3/';

export const coinGeckoAPI = axios.create({
  baseURL: COIN_GECKO_URL,
});
