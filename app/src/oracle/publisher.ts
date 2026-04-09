import { finalizeEvent } from 'nostr-tools';
import { config } from '../common/config.js';
import { PriceStrRelay } from '../relay/index.js';
import { fetchAggregatedPrice } from './price.js';

export const KIND = 30078;

export type PriceData = {
    timestamp: number;
    aggregate: number;
    sources: Record<string, number>;
    method: string;
};

const normalizeTierName = (tier: string) => {
    return tier == 'slow' ? 'free' : 'premiium'
}

function buildEvent(priceData: PriceData, tier: string) {
    const normalizedTierName = normalizeTierName(tier)
    const eventTemplate = {
        kind: KIND,
        created_at: priceData.timestamp,
        content: JSON.stringify({
            aggregate: priceData.aggregate,
            sources: priceData.sources,
            method: priceData.method,
        }),
        tags: [
            ['d', `pricestr/${normalizedTierName}/${priceData.timestamp}`],
            ['t', `pricestr/${normalizedTierName}`],
            ['tier', normalizedTierName],
            ['currency', 'USD'],
            ['sources', Object.keys(priceData.sources).toString()],
            ['method', priceData.method],
        ],
    };

    return finalizeEvent(eventTemplate, config.relayPrivkey);
}

// Slow tick — store + broadcast
export async function publishSlowTick(relay: PriceStrRelay) {
    try {console.log('[oracle] fetching price...');
        const price = await fetchAggregatedPrice();
        const event = buildEvent(price, 'slow');
        await relay.registerEvent(event);
        relay.broadcast(event);
        console.log(`slow tick: $${price.aggregate} (${Object.keys(price.sources).join(', ')})`);
    } catch (e) {
        const err = e as Error;
        console.error('slow tick error:', err.message);
    }
}

// Fast tick — broadcast only, no storage
export async function publishFastTick(relay: PriceStrRelay) {
    try {
        const price = await fetchAggregatedPrice();
        const event = buildEvent(price, 'fast');
        await relay.registerEvent(event);
        relay.broadcast(event);
        console.log(`fast tick: $${price.aggregate} (${Object.keys(price.sources).join(', ')})`);
    } catch (e) {
        const err = e as Error;
        console.error('[oracle] fast tick error:', err.message);
    }
}