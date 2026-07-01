const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export interface TokenStats {
  price: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  priceChange24h: number;
}

export const getTokenStats = async (): Promise<TokenStats> => {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/stellar?localization=false&tickers=false&community_data=false&developer_data=false`
    );
    const data = await response.json();

    const priceInRub = data.market_data?.current_price?.rub || 0;

    return {
      price: priceInRub,
      marketCap: data.market_data?.market_cap?.rub || 0,
      circulatingSupply: data.market_data?.circulating_supply || 0,
      totalSupply: data.market_data?.total_supply || 0,
      priceChange24h: data.market_data?.price_change_percentage_24h || 0,
    };
  } catch {
    return {
      price: 0,
      marketCap: 0,
      circulatingSupply: 0,
      totalSupply: 0,
      priceChange24h: 0,
    };
  }
};
