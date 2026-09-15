# PriceStr

**PriceStr** is a cryptographically signed Bitcoin price feed built natively for the Nostr protocol.  
It delivers median‑aggregated exchange prices as verifiable Nostr events from these sources:
- Coinbase: USD-BTC spot
- Binance: BTCUSDT
- Kraken: XBTUSD
- Chainlink: https://etherscan.io/address/0xf4030086522a5beea4988f8ca5b36dbc97bee88c
- Uniswap: WBTC/USDC (0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48)
- Hyperliquid: perp mid prices for BTC market

## Motivation

dApp developers often end up using centralized API endpoints for price data because on‑chain oracles are cumbersome and public APIs require API keys, rate limits, and trust.

PriceStr flips the model:

1. **Aggregate** – pull real‑time prices from multiple exchanges, compute the median.
2. **Sign** – sign the result with a dedicated Nostr keypair (deterministic, any Nostr library can verify).
3. **Broadcast** – publish the signed event to the Nostr relay network.
4. **Consume** – your frontend fetches from any relay, verifies the signature in one function call.

No backend needed for the free tier. No database. No API key.

---

## Features

- BTC/USD price – 10‑second updates
- Median aggregation from Coinbase, Binance, Kraken, Chainlink, Uniswap, Hyperliquid
- Forex pairs
- Public relays only (no authentication)
- Open‑source aggregation logic

## Using the free feed in your frontend

1. Choose any Nostr relay that stores PriceStr events (e.g., wss://relay.damus.io, wss://relay.primal.net, or our relay wss://relay.pricestr.xyz).
2. Subscribe to events from PriceStr’s pubkey with kind 30078.
3. Verify the signature using nostr-tools or any Nostr library.
4. Read the price from the content field or the price tag.

```js
import { Relay } from 'nostr-tools';

const relay = await Relay.connect('wss://relay.pricestr.xyz');
relay.subscribe([{
  kinds: [30078],
  "#t": ['pricestr']
}], {
  onevent(event) {
    console.log(event.content;
  }
});
```

That’s it. No API key, no backend, no database.

## License

MIT






