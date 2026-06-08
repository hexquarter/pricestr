import { useSubscription } from "@/hooks/use-subscription"
import { usePostHog } from "@posthog/react"
import { Loader2, PlayIcon, Square } from "lucide-react"
import { finalizeEvent, NostrEvent } from "nostr-tools"
import { Relay, Subscription } from "nostr-tools/relay"
import { useEffect, useMemo, useState } from "react"
import { Button } from "./ui/button"
import { bech32 } from "bech32"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart"
import { PriceData } from "@/hooks/use-relay"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

export const Dashboard = () => {
    const subscription = useSubscription()
    const posthog = usePostHog()

    const [runResult, setRunResult] = useState<NostrEvent[]>([])
    const [stream, setStream] = useState<undefined | Subscription>(undefined)
    const streaming = !!stream;
    const stopStream = () => {
        if (stream) { stream.close(); setStream(undefined); posthog?.capture("live_stream_stopped"); }
    };

    const daysLeft = useMemo(() => {
        const expires = new Date(subscription.endPeriod * 1000);
        const daysLeft = Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 86_400_000));
        return daysLeft
    }, [subscription.endPeriod])

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
            limit: 100
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
                setChartData((prev) => [...prev, data].slice(-60));
                setRunResult((prev) => [event])
            }
        });

        sub()
    }

    const chartConfig = {} satisfies ChartConfig;
    const [chartData, setChartData] = useState<PriceData[]>([]);
    const hasData = useMemo(() => chartData.length > 0, [chartData]);
    // Fallback skeleton data so the chart never looks empty
    const skeletonData = Array.from({ length: 30 }, (_, i) => ({
        median: 70000 + Math.sin(i / 3) * 80 + Math.cos(i / 5) * 40,
    }));
    const sourceColor = {
        binance: "#ffdd00",
        coinbase: "#0059ff",
        kraken: "#6532b7",
        hyperliquid: "#00ffcc",
        chainlink: "#0622f9",
        uniswap: "#ff007a",
    };

    useEffect(() => {
        handleRun()
    }, [])

    return (
        <>
            <div className="flex flex-col justify-between gap-5">
                <h1 className="text-5xl  tracking-tight font-[900] font-title uppercase leading-[0.9]">
                    dashboard
                </h1>
                <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8 mt-10 gap-2">
                    <div className="max-w-60 bg-black/20 border border-violet-400/20 rounded-lg p-5 flex flex-col gap-2">
                        <p className="text-xs font-mono uppercase text-muted-foreground">Active since</p>
                        <p className="text-2xl font-bold">{new Date(subscription.startDate * 1000).toLocaleDateString()}</p>
                    </div>
                    <div className="max-w-60 bg-black/20 border border-violet-400/20 rounded-lg p-5 flex flex-col gap-2">
                        <p className="text-xs font-mono uppercase text-muted-foreground">Next subscription in</p>
                        <p className="text-2xl font-bold">{daysLeft} days</p>
                    </div>
                    <div className="max-w-60 bg-black/20 border border-violet-400/20 rounded-lg p-5 flex flex-col gap-2">
                        <p className="text-xs font-mono uppercase text-muted-foreground">Webhooks</p>
                        <p className="text-3xl font-bold">{subscription.webhooks.length}</p>
                    </div>
                    <div className="max-w-60 bg-black/20 border border-violet-400/20 rounded-lg p-5 flex flex-col gap-2">
                        <p className="text-xs font-mono uppercase text-muted-foreground">Invoices</p>
                        <p className="text-3xl font-bold">{subscription.invoicesNumber}</p>
                    </div>
                </div>

                <div className="flex md:flex-col lg:flex-row gap-10">

                    <div className="flex-1 bg-black/20 border border-violet-400/20 rounded-lg p-5">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <LineChart accessibilityLayer data={hasData ? chartData : skeletonData} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
                                <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.2} vertical={false} />
                                {hasData && (
                                    <ChartTooltip
                                        cursor={true}
                                        content={<ChartTooltipContent className="w-[200px]" indicator="line" />}
                                    />
                                )}
                                <YAxis domain={["dataMin - 100", "dataMax + 100"]} />

                                {hasData &&
                                    Object.entries(chartData[chartData.length - 1]?.sources || {}).map(([source]) => (
                                        <Line
                                            key={source}
                                            dataKey={`sources.${source}`}
                                            type="natural"
                                            stroke={sourceColor[source]}
                                            dot={false}
                                            opacity={0.5}
                                            strokeWidth={1}
                                            name={source}
                                        />
                                    ))}
                                <Line
                                    dataKey="median"
                                    name="pricestr"
                                    type="natural"
                                    stroke="#ddd"
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={!hasData}
                                    opacity={hasData ? 1 : 0.4}
                                />
                            </LineChart>
                        </ChartContainer>
                        {!hasData && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 animate-pulse">
                                    · awaiting first signal ·
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 bg-black/20 border border-violet-400/20 rounded-lg p-5">
                        {runResult.length === 0 ? (
                            <div className="flex items-center justify-center p-8 text-[11px] font-mono text-muted-foreground">
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
                                                    <p>Median: <span className="text-violet-400 font-bold text-sm">{new Intl.NumberFormat('us-US', { style: 'currency', currency: 'USD' }).format(parsed['median'])}</span></p>
                                                    <div className="flex flex-col gap-1">
                                                        <p>Sources:</p>
                                                        <div className="grid 2xl:grid-cols-6 md:grid-cols-3 gap-2">
                                                            {Object.entries(parsed['sources']).map(([k, v]) => (
                                                                <p className="flex flex-col gap-2 w-full bg-white border border-border p-2 rounded-sm" key={k}>
                                                                    <span className="uppercase font-bold text-black">{k}</span>
                                                                    <span className="text-violet-400">{new Intl.NumberFormat('us-US', { style: 'currency', currency: 'USD' }).format(v as number)}</span>
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <p>Forex:</p>
                                                        <div className="grid grid-cols-3 2xl:grid-cols-6 gap-2">
                                                            {Object.entries(parsed['fxRates']).map(([k, v]) => (
                                                                <p className="flex flex-col gap-2 w-full bg-black border border-border p-2 rounded-sm" key={k}>
                                                                    <span className="uppercase font-bold">{k}</span>
                                                                    <span className="text-violet-400">
                                                                        {new Intl.NumberFormat('us-US', { style: 'currency', currency: k }).format(parsed['median'] * (v as number))}
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
            </div >
        </>
    )
}