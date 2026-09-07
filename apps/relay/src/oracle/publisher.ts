import { finalizeEvent, SimplePool } from 'nostr-tools';
import { config } from '../common/config.js';
import { PriceStrRelay } from '../relay/index.js';
import { fetchAggregatedPrice } from './price.js';

import { posthog } from '../common/posthog.js';

export const KIND = 30078;

const BACKUP_RELAIS = [
    'wss://relay.nostrcheck.me',
    'wss://relay.nostriches.club',
    'wss://nos.lol',
    'wss://relay.damus.io',
    'wss://relay.primal.net'
]

const relayPool = new SimplePool()

export type PriceData = {
    timestamp: number;
    median: number;
    sources: Record<string, number>;
    fxRates: FxRate
};
export type FxRate = Record<string, number>

function buildEvent(priceData: PriceData) {
    const eventTemplate = {
        kind: KIND,
        created_at: priceData.timestamp,
        content: JSON.stringify({
            median: priceData.median,
            sources: priceData.sources,
            fxRates: "fxRates" in priceData ? priceData.fxRates : undefined
        }),
        tags: [
            ['d', `pricestr/${priceData.timestamp}`],
            ['t', `pricestr`],
            ['currency', 'USD'],
            ['sources', Object.keys(priceData.sources).toString()]
        ],
    };

    return finalizeEvent(eventTemplate, config.relayPrivkey);
}

export async function publishTick(relay: PriceStrRelay) {
    try {
        const priceData = await fetchAggregatedPrice();
        const event = buildEvent(priceData);
        await relay.registerEvent(event);
        await relay.broadcast(event);
        await Promise.any(relayPool.publish(BACKUP_RELAIS, event))
    } catch (e) {
        posthog.captureException(e)
        const err = e as Error;
        console.error('[oracle] fast tick error:', err.message);
    }
}