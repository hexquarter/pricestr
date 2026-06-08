import { KeyRound, Loader2, Puzzle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"
import { EventTemplate, finalizeEvent, getPublicKey, nip19, nip98, NostrEvent } from "nostr-tools"
import { hexToBytes } from "nostr-tools/utils"
import { toast } from "sonner"
import { bech32 } from "bech32"
import posthog from "posthog-js"
import { Toast } from "./ui/toast"
import { ToastAction, ToastDescription, ToastTitle } from "@radix-ui/react-toast"
import { useSubscription } from "@/hooks/use-subscription"

type Props = {
    onSuccess: () => void
}

const nsecToNpub = (nsec: string) => {
    const decoded = nip19.decode(nsec)
    if (decoded.type != 'nsec') {
        return
    }
    const pubkey = getPublicKey(decoded.data);

    const pkBytes = hexToBytes(pubkey);
    return bech32.encode('npub', bech32.toWords(pkBytes));
}

const endpoint = import.meta.env.DEV ? 'http://localhost:7777' : 'https://relay.pricestr.xyz'

export const Auth: React.FC<Props> = ({ onSuccess }) => {
    const [nsecInput, setNsecInput] = useState("")
    const [errorNSec, setErrorNsec] = useState("")
    const [loading, setLoading] = useState(false)
    const [init, setInit] = useState(true)
    const subscription = useSubscription()

    const handleChangeNsec = async (nsec: string) => {
        localStorage.removeItem('nsec')
        setErrorNsec("")
        setNsecInput(nsec)

        setTimeout(() => {
            if (nsec == '') return
            const decoded = nip19.decode(nsec)
            if (decoded.type != 'nsec') {
                setErrorNsec("Enter a valid nsec");
                return;
            }

            if (nsec == '') {
                setErrorNsec("Enter a valid nsec");
                return;
            }
        }, 500)
    };

    const handleNsecConnect = async () => {
        setLoading(true)
        const npub = nsecToNpub(nsecInput)

        fetchSubscription('nsec', nsecInput)
            .then(sub => {
                localStorage.setItem('nsec', nsecInput)
                posthog?.capture("dashboard_connected_extension");
                posthog?.identify(npub, { npub });
                subscription.setNpub(npub)
                updateSubscriptionContext(sub)
                onSuccess()
            })
            .catch(e => {
                console.error(e)
                toast.error('Unable to connect')
            })
            .finally(() => setLoading(false))
    }

    const handleExtensionConnect = async () => {
        localStorage.removeItem('nsec')
        setLoading(true)
        if (!window.nostr) {
            toast.error("No NIP-07 extension found (Alby, nos2x…)");
            return;
        }
        try {
            const pubkey = await window.nostr.getPublicKey();
            const pkBytes = hexToBytes(pubkey);
            const npub = bech32.encode('npub', bech32.toWords(pkBytes));

            fetchSubscription('ext')
                .then(sub => {
                    posthog?.capture("dashboard_connected_extension");
                    posthog?.identify(npub, { npub });
                    localStorage.setItem('npub', npub)
                    subscription.setNpub(npub)
                    updateSubscriptionContext(sub)
                    onSuccess()
                })
                .catch(e => {
                    console.error(e)
                    toast.error('Unable to connect')
                })
                .finally(() => setLoading(false))
        } catch {
            toast.error("Extension connection rejected");
        }
        finally {
            setLoading(false)
        }
    };

    const fetchSubscription = async (method: 'ext' | 'nsec', nsec?: string) => {
        const authToken = await nip98.getToken(`${endpoint}/subscription`, 'POST', async (event: EventTemplate) => {
            if (method == 'nsec') {
                const decoded = bech32.decode(nsec);
                if (decoded.prefix !== 'nsec') {
                    throw new Error('Invalid nsec format');
                }
                const bytes = bech32.fromWords(decoded.words);
                return finalizeEvent(event, new Uint8Array(bytes));
            }
            const signed = await window.nostr.signEvent(event);
            return signed;
        }, true)

        const r = await fetch(`${endpoint}/subscription`, {
            method: "POST",
            headers: {
                "Authorization": authToken
            },
        })
        if (!r.ok) {
            toast.error(`There is not active subscription for your public key`)
            return
        }

        return await r.json()
    }

    useEffect(() => {
        if (localStorage.getItem('nsec') !== '') {
            fetchSubscription('nsec', localStorage.getItem('nsec')).then((sub) => {
                const npub = nsecToNpub(localStorage.getItem('nsec'))
                subscription.setNpub(npub)
                updateSubscriptionContext(sub)
                onSuccess()
            })
                .finally(() => setInit(false))
        }
        else if (localStorage.getItem('npub') !== '') {
            fetchSubscription('ext').then(async (sub) => {
                const pubkey = await window.nostr.getPublicKey();
                const pkBytes = hexToBytes(pubkey);
                const npub = bech32.encode('npub', bech32.toWords(pkBytes));
                subscription.setNpub(npub)
                updateSubscriptionContext(sub)

                onSuccess()
            })
                .finally(() => setInit(false))
        }

    }, [])

    const updateSubscriptionContext = (sub: any) => {
        subscription.setInvoicesNumber(sub.invoicesNumber)
        subscription.setWebhooks(sub.webhooks)
        subscription.setStartDate(sub.startDate)
        subscription.setEndPeriod(sub.endPeriod)
        subscription.setBillingUrl(sub.billingUrl)
    }

    return (
        <div className="flex">
            {!init &&
                <div className="md:w-1/2 mt-20 mx-auto bg-black/10 p-5 border rounded-lg shadow-xl">
                    
                    <div className="flex justify-between text-xs text-primary uppercase font-mono tracking-widest border-b border-t border-border/40 py-2">
                        <span className="">// Authentication</span>
                    </div>
                    <Tabs defaultValue="ext" className="mt-10">
                        <TabsList className="grid w-full grid-cols-2 bg-white/5">
                            <TabsTrigger value="ext" className="font-mono text-xs uppercase">
                                <Puzzle className="mr-2 h-3 w-3" /> Extension
                            </TabsTrigger>
                            <TabsTrigger value="npub" className="font-mono text-xs uppercase">
                                <KeyRound className="mr-2 h-3 w-3" /> nsec
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="npub" className="flex flex-col gap-3 pt-4">
                            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                Enter your nsec to authenticate directly
                            </label>
                            <Input
                                value={nsecInput}
                                onChange={(e) => handleChangeNsec(e.target.value)}
                                placeholder="nsec..."
                                className="font-mono text-xs"
                            />
                            <Button
                                onClick={handleNsecConnect}
                                disabled={loading || !nsecInput || errorNSec != ''}
                                variant="outline"
                                className="w-full font-mono uppercase"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
                            </Button>
                            {errorNSec && <span className="text-xs text-primary">{errorNSec}</span>}

                        </TabsContent>

                        <TabsContent value="ext" className="flex flex-col gap-3 pt-4">
                            <p className="text-xs text-muted-foreground">
                                Sign with your NIP-07 browser extension (nos2x, alby).
                            </p>
                            <Button
                                onClick={handleExtensionConnect}
                                disabled={loading}
                                variant="outline"
                                className="w-full font-mono uppercase"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect Nostr extension"}
                            </Button>
                        </TabsContent>
                    </Tabs>
                </div>
            }
        </div>

    )
}