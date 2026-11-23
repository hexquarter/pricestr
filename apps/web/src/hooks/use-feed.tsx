import { createContext, useContext, useEffect, useState } from "react";
import { SimplePool } from "nostr-tools";
import type { NostrEvent } from "nostr-tools";
import type { ReactNode } from "react";

export type PriceData = {
  timestamp: number;
  median: number;
  sources: Record<string, number>;
};

export type LatestPrint = {
  event: NostrEvent;
  data: PriceData;
  /** Date.now() when the event arrived client-side */
  at: number;
};

export type FeedState = {
  latest: LatestPrint | null;
  history: PriceData[];
  /** true once at least one event has been received this session */
  received: boolean;
};

const FeedContext = createContext<FeedState>({ latest: null, history: [], received: false });

const RELAY = import.meta.env.DEV ? "ws://localhost:7777" : "wss://relay.pricestr.xyz";
const MIRROR_RELAYS = [
  "wss://relay.nostrcheck.me",
  "wss://relay.nostriches.club",
  "wss://nos.lol",
  "wss://relay.damus.io",
  "wss://relay.primal.net",
];

export function LiveFeedProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FeedState>({ latest: null, history: [], received: false });

  useEffect(() => {
    const pool = new SimplePool();
    const sub = pool.subscribe([RELAY, ...MIRROR_RELAYS], {
      kinds: [30078],
      "#t": ["pricestr"],
      limit: 50,
    }, {
      onevent(event) {
        try {
          const data = JSON.parse(event.content) as PriceData;
          setState((prev) => ({
            latest: { event, data, at: Date.now() },
            history: [...prev.history, data].slice(-60),
            received: true,
          }));
        } catch {
          // ignore malformed content
        }
      },
    });
    return () => sub.close();
  }, []);

  return <FeedContext.Provider value={state}>{children}</FeedContext.Provider>;
}

export function useFeed() {
  return useContext(FeedContext);
}
