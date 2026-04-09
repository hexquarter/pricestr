// Fetch and aggregate BTC/USD price from multiple sources.
// Returns { aggregate, sources, method, timestamp }

import { PriceData } from "./publisher.js";

type Source = {
    name: string; 
    url: string;
    parse: (data: any) => number;
}

const SOURCES: Source[] = [
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

async function fetchSource(source: Source) {
  const res = await fetch(source.url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`${source.name}: HTTP ${res.status}`);
  const data = await res.json();
  return { name: source.name, price: source.parse(data) };
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export async function fetchAggregatedPrice(): Promise<PriceData> {
  const results = await Promise.allSettled(SOURCES.map(fetchSource));

  const sources: { [key: string]: number } = {};
  const prices: number[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { name, price } = result.value;
      sources[name] = Number(price.toFixed(2));
      prices.push(price);
    } else {
      console.warn('price source error:', result.reason?.message);
    }
  }

  if (prices.length === 0) throw new Error('all price sources failed');

  const aggregate = median(prices);

  return {
    aggregate: Number(aggregate.toFixed(2)),
    sources,
    method: 'median',
    timestamp: Math.floor(Date.now() / 1000),
  };
}