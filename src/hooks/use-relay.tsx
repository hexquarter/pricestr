import { finalizeEvent, generateSecretKey, NostrEvent, Relay } from 'nostr-tools';
import { fetchRelayInformation, RelayInformation } from "nostr-tools/nip11";
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type PriceData = {
    timestamp: number;
    median: number;
    sources: Record<string, number>;
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

type Billing = {
    invoice: string
    from: number,
    to: number
}

type Subscription = {
    expiresAt: number
    webhookUrl?: string
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

    getSubscription(pubkey: string): Promise<Subscription | null> {
        const now = Math.floor(Date.now() / 1000);

        return new Promise((resolve) => {
            let found: Subscription | null = null;
            const sub = this.relay.subscribe([{ '#d': [`pricestr/sub/${pubkey}`] }],
                {
                    onevent(event) {
                        const expiry = Number(event.tags.find(t => t[0] === 'expiration')?.[1] ?? 0);
                        if (expiry > now) {
                            const { webhookUrl } = JSON.parse(event.content)
                            found = {
                                expiresAt: expiry,
                                webhookUrl: webhookUrl
                            };
                        }
                        sub.close();
                        resolve(found);
                    },
                    oneose() {
                        sub.close();
                        resolve(found);
                    },
                },
            );
        });
    }

    async getBillingHistory(pubkey: string): Promise<Billing[]> {
        return new Promise((resolve) => {
            const records: Billing[] = [];

            const sub = this.relay.subscribe(
                [{ '#t': [`pricestr/billing/${pubkey}`] }],
                {
                    onevent(event) {
                        const { invoice, from, to } = JSON.parse(event.content)
                        records.push({ invoice, from, to });
                    },
                    oneose() {
                        sub.close();
                        resolve(records);
                    },
                },
            );
        });
    }

    async subscribePremium(callback: (priceData: PriceData) => void) {
        const sub = () => this.relay.subscribe([{
            kinds: [30078],
            "#t": [`pricestr/pro`]
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