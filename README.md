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

### Free Tier (available now)
- BTC/USD price – 60‑second updates
- Median aggregation from Coinbase, Binance, Kraken, Chainlink, Uniswap, Hyperliquid
- Public relays only (no authentication)
- Signature verification examples in JavaScript/TypeScript
- Open‑source aggregation logic

### Pro Tier
- BTC/USD + Forex pairs
- 10‑second updates
- Webhooks (10k/month)
- Priority support
- **Payment:** $10/month
- **Authentication:** Nostr's public key - no email required

### Enterprise (custom)
- Dedicated relay endpoint
- Private relay infrastructure
- Custom currency pairs
- SLA & phone support
- Optional self‑hosted signer

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
  authors: ['c52621244ec0233d3cc9b1b74f3257f64977f1ce9f855e026ce151bc5b097439'],
  "#t": ['pricestr/free']
}], {
  onevent(event) {
    console.log(event.content;
  }
});
```

That’s it. No API key, no backend, no database.

## Pro Tier access pattern (for developers)

Pro subscribers get:
- A dedicated relay endpoint (e.g., wss://relay.pricestr.xyz)
- Faster updates (10 seconds)
- Additional pairs (EUR, GBP, JPY, etc.)
- Webhooks

Because the dedicated relay requires authentication, we use **NIP-42** – the Nostr Authentication protocol.

For a **static frontend** (HTML/JS on IPFS or a CDN) to access the Pro feed without embedding secrets, you have two clean options:

### Option A: Pure client‑side (recommended for Nostr‑native apps)
- Your frontend connects directly to `wss://relay.pricestr.xyz`.
- The relay sends an AUTH challenge.
- The user’s Nostr browser extension (Alby, Nos2x, etc.) signs the challenge with their own private key.
- The relay verifies the signature and allows subscription – **no backend at all**.

### Option B: Static frontend + your own lightweight backend (for non‑Nostr users)
- You run a tiny backend (Node.js, Cloudflare Worker, etc.) that:
  - Maintains a single NIP‑42 authenticated session with our Pro relay.
  - Listens for price events over WebSocket.
  - Forwards those events to your static frontend (via your own WebSocket or SSE).
- Your frontend remains completely static – no API keys, no extension required.
- The backend has no database; it just re‑broadcasts the already‑signed PriceStr events.

For truly serverless static sites without any backend, the free tier remains the best fit. Pro requires either a Nostr extension (cheap) or a minimal backend (one line of code).

## License

The following components are open source (MIT license):
- Client code and dashboard
- Nostr event schema and tagging conventions
- Signature verification examples and SDK stubs
- Relay integration helpers

The production signer, aggregator, and relay infrastructure are closed source to protect our infrastructure and paid features. \
Commercial use of the Pro/Enterprise relay endpoints requires a paid subscription. \
For enterprise inquiries or custom deployments, email pricestr@hexquarter.com.







