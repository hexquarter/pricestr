import { useSubscription } from "@/hooks/use-subscription"
import { copy } from "@/lib/utils"
import { Copy, Loader2, Trash2 } from "lucide-react"
import { Input } from "./ui/input"
import { useState } from "react"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { toast } from "./ui/sonner"
import { finalizeEvent, nip98 } from "nostr-tools"
import { usePostHog } from "@posthog/react"
import { bech32 } from "bech32"

const endpoint = import.meta.env.DEV ? 'http://localhost:7777' : 'https://relay.pricestr.xyz'

export const Webhooks = () => {
    const subscription = useSubscription()
    const posthog = usePostHog()

    const [webhookInput, setWebhookInput] = useState("")
    const [webhookLoading, setWebhookLoading] = useState(false)
    const [webhooks, setWebhooks] = useState(subscription.webhooks)

    const registerWebhook = async () => {
        const url = webhookInput.trim()
        if (!url) return
        try { new URL(url) } catch { toast.error("Invalid URL"); return }
        if (!/^https?:\/\//.test(url)) { toast.error("URL must start with http(s)://"); return }
        setWebhookLoading(true)

        try {
            if (!window.nostr) {
                toast.error("No NIP-07 extension found (Alby, nos2x…)");
                return;
            }
            const authToken = await nip98.getToken(`${endpoint}/webhook`, 'POST', async (e: any) => {
                if (localStorage.getItem('nsec')) {
                    const decoded = bech32.decode(localStorage.getItem('nsec'));
                    if (decoded.prefix !== 'nsec') {
                        throw new Error('Invalid nsec format');
                    }
                    const bytes = bech32.fromWords(decoded.words);
                    return Promise.resolve(finalizeEvent(e, new Uint8Array(bytes)))
                }
                else {
                    return window.nostr.signEvent(e)
                }
            }, true, { url })

            const r = await fetch(`${endpoint}/webhook`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authToken
                },
                body: JSON.stringify({ url }),
            })
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
            setWebhooks(prev => [webhookInput, ...prev])
            setWebhookInput("")
            posthog?.capture("webhook_registered", { webhook_url: url });
            toast.success("Webhook registered")
        } catch (e) {
            const err = e as Error
            toast.error(`Failed to register webhook: ${err.message}`)
        } finally {
            setWebhookLoading(false)
        }
    }

    const removeWebhook = async (url: string) => {
        try {
            const authToken = await nip98.getToken(`${endpoint}/webhook`, 'DELETE', async (e: any) => {
                if (localStorage.getItem('nsec')) {
                    const decoded = bech32.decode(localStorage.getItem('nsec'));
                    if (decoded.prefix !== 'nsec') {
                        throw new Error('Invalid nsec format');
                    }
                    const bytes = bech32.fromWords(decoded.words);
                    return Promise.resolve(finalizeEvent(e, new Uint8Array(bytes)))
                }
                else {
                    return window.nostr.signEvent(e)
                }
            }, true, { url })

            const r = await fetch(`${endpoint}/webhook`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authToken
                },
                body: JSON.stringify({ url })
            })
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
            posthog?.capture("webhook_removed");
            toast.success("Webhook removed")
            setWebhookInput("")
            setWebhooks(prev => prev.filter(p => p != url))
        } catch (e) {
            const err = e as Error
            toast.error(`Failed to remove: ${err.message}`)
        }
    }

    return (
        <>
            <div className="flex flex-col justify-between gap-5">
                <h1 className="text-5xl  tracking-tight font-[900] font-title uppercase leading-[0.9]">
                    Webhooks
                </h1>

                <div className="flex gap-2 items-end">
                    <div className="flex flex-col gap-2 w-full">
                        <Label htmlFor="webhookUrl" className="text-white/80 text-xs">Endpoint</Label>
                        <Input
                            className="focus-visible:ring-offset-0 focus-visible:ring-1"
                            id='webhookUrl'
                            value={webhookInput}
                            onChange={(e) => setWebhookInput(e.target.value)}
                            placeholder="https://your-app.com/hooks/pricestr"
                            disabled={webhookLoading}
                        />
                    </div>
                    <Button
                        onClick={registerWebhook}
                        disabled={webhookLoading || !webhookInput.trim()}
                        variant="outline"
                        className="font-mono uppercase"
                    >
                        {webhookLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <>Register</>}
                    </Button>
                </div>
                {webhooks.length == 0 && <p className="text-muted-foreground text-sm text-center mt-10">No wehbooks registered yet</p>}
                {webhooks.map((webhook, i) => (
                    <div className="border border-white/10 bg-[#07070C] divide-y divide-white/5" key={i}>
                        <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs font-mono">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                                <code className="truncate text-white/80">{webhook}</code>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <Button
                                    className="w-10 h-10"
                                    variant="ghost"
                                    onClick={() => copy(webhook, "URL")}
                                    aria-label="Copy URL"
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                    className="w-10 h-10"
                                    variant="outline"
                                    onClick={() => removeWebhook(webhook)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div >
        </>
    )
}