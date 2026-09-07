// Fetch and aggregate BTC/USD price from multiple sources.
// Returns { aggregate, sources, method, timestamp }

import { FxRate, PriceData } from "./publisher.js";
import { posthog } from '../common/posthog.js';
import { getChainLinkBTCPriceFeed } from "./chainlink.js";
import { getHyperliquidSpotPrice } from "./hyperliquid.js";
import { getUniswapV4WBTCPrice } from "./uniswap.js";

type Source = {
  name: string;
  url: string;
  parse: (data: any) => number;
}

const CEX_SOURCES: Source[] = [
  {
    name: 'coinbase',
    url: 'https://api.coinbase.com/v2/prices/BTC-USD/spot',
    parse: (data: any) => parseFloat(data.data.amount),
  },
  {
    name: 'binance',
    url: 'https://data-api.binance.vision/api/v3/ticker/price?symbol=BTCUSDT',
    parse: (data: any) => parseFloat(data.price),
  },
  {
    name: 'kraken',
    url: 'https://api.kraken.com/0/public/Ticker?pair=XBTUSD',
    parse: (data: any) => parseFloat(data.result.XXBTZUSD.c[0]),
  },
];

async function fetchUrlSource(source: Source): Promise<{ name: string, price: number }> {
  try {
    const res = await fetch(source.url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`${source.name}: HTTP ${res.status}`);
    const data = await res.json();
    return { name: source.name, price: source.parse(data) };
  }
  catch (e) {
    const err = e as Error;
    console.warn(`Error fetching ${source.name}:`, err.message);
    posthog.captureException(err, '', {
      source: source.name
    })
    throw err;
  }
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export async function fetchAggregatedPrice(): Promise<PriceData> {
  const results = await Promise.allSettled(
    [...CEX_SOURCES.map(fetchUrlSource), getHyperliquidSpotPrice(), getChainLinkBTCPriceFeed(), getUniswapV4WBTCPrice()]
  );

  const sources: { [key: string]: number } = {};
  const prices: number[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { name, price } = result.value;
      sources[name] = Number(price.toFixed(2));
      prices.push(price);
    } else {
      console.warn('price source error:', result);
      posthog.captureException(result.reason);
      posthog.capture({
        distinctId: 'system',
        event: 'price_source_failed',
        properties: {
          error: result.reason?.message ?? String(result.reason)
        },
      });
    }
  }

  if (prices.length === 0) throw new Error('all price sources failed');

  const data = {
    median: Number(median(prices).toFixed(2)),
    sources,
    timestamp: Math.floor(Date.now() / 1000),
  } as PriceData;

  const fxRates = await fetchFxRates()
  data.fxRates = fxRates
  return data
}

async function fetchFxRates(): Promise<FxRate> {
  const url = `https://api.frankfurter.app/latest?from=USD`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Frankfurter API error: ${res.status}`);
  }

  const data = await res.json();
  return data.rates
}

