import { finalizeEvent, generateSecretKey, NostrEvent, Relay } from 'nostr-tools';
import { fetchRelayInformation, RelayInformation } from "nostr-tools/nip11";
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type PriceData = {
    timestamp: number;
    aggregate: number;
    sources: Record<string, number>;
    method: string;
};

export interface RelayContextType {
    relay: PricestrRelay
}

const RelayContext = createContext<RelayContextType | undefined>(undefined);
const sk = generateSecretKey()

const RELAY = import.meta.env.DEV ? 'ws://localhost:7777' : 'wss://relay.pricestr.xyz'

export function RelayProvider({ children }: { children: ReactNode }) {

    const [relay, setRelay] = useState<PricestrRelay | null>(null);

    useEffect(() => {
        Relay.connect(RELAY).then(r => {
            const wrapper = new PricestrRelay(r, sk);
            setRelay(wrapper);
        })
    }, [])

    return (
        <RelayContext.Provider value={{ relay }}>
            {children}
        </RelayContext.Provider>
    )
}

class PricestrRelay {
    public relay: Relay

    constructor(r: Relay, sk: Uint8Array) {
        this.relay = r
        this.relay.onauth = async (event) => {
            const signed = finalizeEvent(event, sk);
            return signed;
        };
    }

    async info(): Promise<RelayInformation> {
        const relayInfo = await fetchRelayInformation(RELAY)
        return relayInfo
    }

    async subscribePrice(tier: 'free' | 'premium', callback: (priceData: PriceData) => void) {
        const sub = () => this.relay.subscribe([{
            kinds: [30078],
            "#t": [`pricestr/${tier}`]
        }], {
            onclose(e) {
                if (e == 'auth-required') {
                    // retry AFTER short delay to allow AUTH to complete
                    setTimeout(() => sub(), 100);
                }
            },
            onevent(event) {
                const { content } = event as NostrEvent;
                const data = JSON.parse(content);
                callback(data);
            }

        });

        sub()
    }
}

export function useRelay() {
    const context = useContext(RelayContext);
    if (!context) {
        throw new Error('useRelay must be used within RelayProvider');
    }
    return context;
}

const getTag = (tags: string[][], name: string) => tags.find(t => t[0] === name)?.[1]