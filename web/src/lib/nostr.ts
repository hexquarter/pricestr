import { SimplePool, getPublicKey, type Filter, type Event, type NostrEvent } from "nostr-tools"
import { fetchRelayInformation } from "nostr-tools/nip11";

const pool = new SimplePool({
    enablePing: true,
    enableReconnect: true
});

const RELAY = 'ws://localhost:7777'

export type PriceData = {
    timestamp: number;
    aggregate: number;
    sources: Record<string, number>;
    method: string;
};

export const lastPrices = async (): Promise<PriceData[]> => {
    const events = await pool.querySync([RELAY], {
        kinds: [30078],
        "#t": [`pricestr/free`],
        limit: 50
    })

    if (events.length == 0) return []
    return events.map(({ content }) => {
        const data = JSON.parse(content);
        return data as PriceData
    })
}

export const subscribePrice = (callback: (priceData: PriceData) => void) => {
    pool.subscribeMany([RELAY], {
        kinds: [30078],
        "#t": [`pricestr/free`]
    }, {
        onevent(event) {
            const { content } = event as NostrEvent;
            const data = JSON.parse(content);
            callback(data);
        }
    });
}

export const relayInfo = async () => {
    const info = await fetchRelayInformation(RELAY)
    return info
}