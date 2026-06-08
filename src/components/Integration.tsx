import { useSubscription } from "@/hooks/use-subscription"
import { usePostHog } from "@posthog/react"
import { Code } from "./Code"
import { copy } from "@/lib/utils"
import { Copy, Loader2, PlayIcon, Square } from "lucide-react"
import { Button } from "./ui/button"
import { useState } from "react"
import { finalizeEvent, NostrEvent, Relay } from "nostr-tools"
import { bech32 } from "bech32"
import { Subscription } from "nostr-tools/abstract-relay"

const endpoint = import.meta.env.DEV ? 'http://localhost:7777' : 'https://relay.pricestr.xyz'

const snippetUsage = `import { Relay } from 'nostr-tools';

const relay = await Relay.connect('wss://relay.pricestr.xyz');

// Required to access the access the PRO tier events
relay.onauth = (e) => window.nostr.signEvent(e)

const subscribe = () => {
  relay.subscribe([{
    "#t": ['pricestr/pro'], // Request the PRO events (10s refresh rate + FOREX rate)
    limit: 1 // Get only the latest event
  }], {
    onevent: (event) => {
        const { median } = JSON.parse(event.content)
        console.log(median)
    }

    onclose: (reason) => {
      if (reason.startsWith('auth-required')) {
        // retry AFTER short delay to allow AUTH to complete
        setTimeout(subscribe, 500);
      }
    }
  });
};

subscribe();`

export const Integration = () => {
    const subscription = useSubscription()
    const posthog = usePostHog()

    const [runResult, setRunResult] = useState<NostrEvent[]>([])
    const [stream, setStream] = useState<undefined | Subscription>(undefined)
    const streaming = !!stream;
    const stopStream = () => {
        if (stream) { stream.close(); setStream(undefined); posthog?.capture("live_stream_stopped"); }
    };

    const handleRun = async () => {
        setRunResult([])
        posthog?.capture("live_stream_started");

        const relay = await Relay.connect(import.meta.env.DEV ? 'ws://localhost:7777' : 'wss://relay.pricestr.xyz');
        relay.onauth = (e) => {
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
        }
        const sub = () => relay.subscribe([{
            kinds: [30078],
            "#t": [`pricestr/pro`],
            limit: 1
        }], {
            onclose(e) {
                if (e.startsWith('auth-required')) {
                    // retry AFTER short delay to allow AUTH to complete
                    setTimeout(() => {
                        const s = sub()
                        setStream(s)
                    }, 500);
                }
            },
            onevent(event) {
                const data = JSON.parse(event.content);
                setRunResult((prev) => [event])
            }
        });

        sub()
    }

    return (
        <>
            <div className="flex flex-col justify-between gap-5">
                <h1 className="text-5xl  tracking-tight font-[900] font-title uppercase leading-[0.9]">
                    Integration
                </h1>

                <div className="flex gap-5">
                    <div className="flex-1">
                        <div className="flex justify-end">

                            <Button
                                variant="outline"
                                onClick={() => copy(snippetUsage, "Snippet")}
                            >
                                <Copy className="h-3 w-3" /> copy
                            </Button>

                        </div>
                        <Code lang="subscribe.ts">{snippetUsage}</Code>
                    </div>

                    <div className="flex flex-1 flex-col gap-2">
                        <div>
                            {streaming ?
                                <Button
                                    variant="outline"
                                    onClick={stopStream}
                                >
                                    <Square className="h-3 w-3" /> stop
                                </Button>
                                : <Button
                                    variant="outline"
                                    onClick={() => handleRun()}
                                >
                                    <PlayIcon className="h-3 w-3" /> stream prices
                                </Button>
                            }
                        </div>
                        <div className="flex-1 bg-black/40 border border-violet-400/30  divide-y divide-white/5 h-fit rounded-lg flex items-center p-2">
                            {runResult.length === 0 ? (
                                <div className="flex items-center justify-center p-8 text-xs font-mono text-muted-foreground">
                                    {streaming ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-3 w-3 animate-spin" /> waiting for next signed event…
                                        </span>
                                    ) : (
                                        <span> press "stream prices" to start</span>
                                    )}
                                </div>
                            ) : (
                                runResult.map((r, i) => {
                                    let parsed: any = null;
                                    try { parsed = JSON.parse(r.content); } catch { /* keep raw */ }
                                    return (
                                        <div key={r.id || i} className="flex items-start gap-3 p-3 text-xs font-mono w-full">
                                            <div className="flex-1 min-w-0 flex flex-col gap-5">
                                                <div className="flex items-center justify-between gap-2 text-sm text-white">
                                                    <span>{new Date(r.created_at * 1000).toLocaleTimeString()}</span>
                                                    <span>next in 10s</span>
                                                </div>
                                                {parsed && typeof parsed === "object" ? (
                                                    <div className="flex flex-col gap-5 text-white/85">
                                                        <p>Median: <span className="text-violet-400 font-bold text-sm">{new Intl.NumberFormat('us-US', { style: 'currency', currency: 'USD'}).format(parsed['median'])}</span></p>
                                                        <div className="flex flex-col gap-1">
                                                            <p>Sources:</p>
                                                            <div className="flex gap-2">
                                                                {Object.entries(parsed['sources']).map(([k, v]) => (
                                                                    <p className="flex flex-col gap-2 w-full bg-white border border-border p-2 rounded-sm" key={k}>
                                                                        <span className="uppercase font-bold text-black">{k}</span>
                                                                        <span className="text-violet-400">{new Intl.NumberFormat('us-US', { style: 'currency', currency: 'USD'}).format(v as number)}</span>
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <p>Forex:</p>
                                                            <div className="grid grid-cols-6 gap-2">
                                                                {Object.entries(parsed['fxRates']).map(([k, v]) => (
                                                                    <p className="flex flex-col gap-2 w-full bg-black border border-border p-2 rounded-sm" key={k}>
                                                                        <span className="uppercase font-bold">{k}</span>
                                                                        <span className="text-violet-400">
                                                                            {new Intl.NumberFormat('us-US', { style: 'currency', currency:  k}).format(parsed['median'] * (v as number))}
                                                                            </span>
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-white/85 break-all">{r.content}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

            </div >
        </>
    )
}