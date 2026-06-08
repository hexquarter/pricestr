import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type ContextType = {
    npub: string
    setNpub(npub: string): void
    setInvoicesNumber(invoiceNumber: number): void
    invoicesNumber: number
    webhooks: string[]
    setWebhooks(hooks: string[]): void
    endPeriod: number
    setEndPeriod(d: number): void
    startDate: number
    setStartDate(d: number): void
    billingUrl: string
    setBillingUrl(url: string): void
}

const SubscriptionContext = createContext<ContextType | undefined>(undefined);
export function SubscriptionProvider({ children }: { children: ReactNode }) {

    const [npub, setNpub] = useState("")
    const [invoicesNumber, setInvoicesNumber] = useState(0)
    const [webhooks, setWebhooks] = useState([])
    const [startDate, setStartDate] = useState(0)
    const [endPeriod, setEndPeriod] = useState(0)
    const [billingUrl, setBillingUrl] = useState('')

    return (
        <SubscriptionContext.Provider value={{
            npub, setNpub,
            invoicesNumber, setInvoicesNumber,
            webhooks, setWebhooks,
            startDate, setStartDate,
            endPeriod, setEndPeriod,
            billingUrl, setBillingUrl
        }}>
            {children}
        </SubscriptionContext.Provider>
    )
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within SubscriptionProvider');
    }
    return context;
}