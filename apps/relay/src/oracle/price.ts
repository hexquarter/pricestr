// Fetch and aggregate BTC/USD price from multiple sources.
// Returns { aggregate, sources, method, timestamp }

import { FxRate, PriceData } from "./publisher.js";
import { posthog } from '../common/posthog.js';
import { getChainLinkBTCPriceFeed } from "./chainlink.js";
import { getHyperliquidSpotPrice } from "./hyperliquid.js";
import { getUniswapV4WBTCPrice } from "./uniswap.js";
import { getBitcoinDiaPrice } from "./dia.js";

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

// Expected, transient failure of an external price source (timeout, HTTP
// error, network failure). Tracked as an event, not an exception.
class SourceUnavailableError extends Error {}

function isTimeoutError(err: Error): boolean {
  // AbortSignal.timeout rejects with a DOMException named 'TimeoutError'
  return err.name === 'TimeoutError' || err.name === 'AbortError';
}

function isNetworkError(err: Error): boolean {
  // fetch rejects with TypeError on DNS/connection failures
  return err instanceof TypeError;
}

// Returns null on expected source failure instead of throwing, so timeouts
// don't flood error tracking. Rethrows unexpected errors (e.g. a parse error
// caused by an API response shape change) for posthog.captureException.
async function fetchUrlSource(source: Source): Promise<{ name: string, price: number } | null> {
  try {
    const res = await fetch(source.url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new SourceUnavailableError(`${source.name}: HTTP ${res.status}`);
    const data = await res.json();
    return { name: source.name, price: source.parse(data) };
  }
  catch (e) {
    const err = e as Error;
    console.warn(`Error fetching ${source.name}:`, err.message);
    if (err instanceof SourceUnavailableError || isTimeoutError(err) || isNetworkError(err)) {
      posthog.capture({
        distinctId: 'system',
        event: 'price_source_failed',
        properties: {
          source: source.name,
          error: err.message,
        },
      });
      return null;
    }
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
    [...CEX_SOURCES.map(fetchUrlSource), getHyperliquidSpotPrice(), getChainLinkBTCPriceFeed(), getUniswapV4WBTCPrice(), getBitcoinDiaPrice()]
  );

  const sources: { [key: string]: number } = {};
  const prices: number[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      // null = expected source failure, already recorded in fetchUrlSource
      if (result.value === null) continue;
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

  // FX rates are supplementary: if they fail, still publish the price event
  // without fxRates (buildEvent omits it from the Nostr content).
  try {
    data.fxRates = await fetchFxRates()
  } catch (e) {
    const err = e as Error;
    console.warn('[oracle] fx rates fetch failed, publishing without fxRates:', err.message);
    posthog.capture({
      distinctId: 'system',
      event: 'fx_rates_failed',
      properties: {
        error: err.message,
      },
    });
  }
  return data
}

async function fetchFxRates(): Promise<FxRate> {
  const url = `https://api.frankfurter.app/latest?from=USD`;

  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) {
    throw new Error(`Frankfurter API error: ${res.status}`);
  }

  const data = await res.json();
  return data.rates
}

