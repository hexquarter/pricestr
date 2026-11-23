import { useMemo, useState } from "react";
import { ArrowRight, Check, Copy, ShieldCheck } from "lucide-react";
import { Line, LineChart, YAxis, CartesianGrid } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { verifyEvent } from "nostr-tools";
import { useFeed } from "@/hooks/use-feed";
import { CodeBlock } from "./CodeBlock";
import TrustStrip from "./TrustStrip";

const RELAY_URL = "wss://relay.pricestr.xyz";

const subscribeSnippet = `// npm install nostr-tools
import { Relay } from 'nostr-tools';

const relay = await Relay.connect('${RELAY_URL}');

relay.subscribe([{ "#t": ['pricestr'] }], {
  onevent(event) {
    console.log(JSON.parse(event.content));
  }
});`;

const verifySnippet = `import { verifyEvent, getEventHash } from 'nostr-tools';

// Runs locally, two checks:
// 1. the payload hash matches the event id
// 2. the signature matches the signer key
getEventHash(event) === event.id && verifyEvent(event);
// => true — signed by PriceStr's published key`;

const chips = ["NIP-11", "kind 30078", "replaceable events", "no API key", "self-hostable"];

const sourceColor: Record<string, string> = {
  binance: "#ffdd00",
  coinbase: "#0059ff",
  kraken: "#6532b7",
  hyperliquid: "#00ffcc",
  chainlink: "#0622f9",
  uniswap: "#ff007a",
  dia: "#15ff00",
};

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const Hero = () => {
  const { latest, history, received } = useFeed();
  const [copied, setCopied] = useState(false);

  const hasData = history.length > 0;
  const last = latest?.data.median;
  const prev = history.length > 1 ? history[history.length - 2].median : undefined;
  const delta = last !== undefined && prev !== undefined ? last - prev : 0;
  const deltaPositive = delta >= 0;

  const result = useMemo(() => {
    if (!latest) return null;
    let pretty = latest.event.content;
    try {
      pretty = JSON.stringify(JSON.parse(latest.event.content), null, 2);
    } catch { /* keep raw */ }
    return { pretty, valid: verifyEvent(latest.event) };
  }, [latest]);

  const chartConfig = {} satisfies ChartConfig;
  // Fallback skeleton so the chart never looks empty before the first signal
  const skeletonData = Array.from({ length: 30 }, (_, i) => ({
    median: 70000 + Math.sin(i / 3) * 80 + Math.cos(i / 5) * 40,
  }));

  const copyRelay = () => {
    navigator.clipboard.writeText(RELAY_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.info("Relay URL copied", { description: "Point any Nostr client at it." });
  };

  return (
    <section className="relative min-h-[100svh] flex items-center pt-24 pb-16">
      {/* subtle background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      <div className="relative z-10 lg:max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-12 gap-12 items-center">
        {/* Left: claim */}
        <div className="lg:col-span-5 col-span-12 flex flex-col gap-7">
          <div className="inline-flex items-center gap-2 self-start text-[10px] font-mono uppercase tracking-widest text-muted-foreground border border-border/60 rounded-full px-3 py-1">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            Live · signed every 10s
          </div>

          <h1 className="lg:text-7xl text-6xl tracking-tight font-[900] font-title uppercase leading-[0.9]">
            The <span className="text-violet-400">signed</span> BTC price feed
          </h1>

          <p className="text-base font-light text-foreground/90 max-w-md leading-relaxed">
            Median of 7 venues — centralized and decentralized. Signed once,
            verifiable anywhere, every 10 seconds. No API key, no sign-up, no backend.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button onClick={copyRelay} className="font-mono uppercase tracking-widest text-xs h-11 px-6">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              Copy relay URL
            </Button>
            <Button variant="outline" asChild className="font-mono uppercase tracking-widest text-xs h-11 px-6">
              <Link to="#get-started">
                See it in code<ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <TrustStrip />

          <div className="flex flex-wrap gap-2 pt-1">
            {chips.map((c) => (
              <span
                key={c}
                className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/70 border border-border/40 rounded-full px-2.5 py-1"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Right: live terminal */}
        <div className="lg:col-span-7 flex flex-col font-mono">
          <Tabs defaultValue="chart" className="w-full">
            <div className="border border-b-0 border-border/60 bg-card/40 backdrop-blur-sm px-2 pt-2">
              <TabsList className="bg-transparent h-auto p-0 gap-1 justify-start w-full">
                {[
                  { value: "chart", label: "Chart" },
                  { value: "subscribe", label: "Subscribe" },
                  { value: "verify", label: "Verify" },
                  { value: "result", label: "Result" },
                ].map((t) => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="font-mono uppercase tracking-widest text-[10px] px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-400 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
                <span className="ml-auto pr-3 text-[10px] uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                  <span className="relative flex size-1.5">
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${received ? "bg-emerald-400" : "bg-muted-foreground"} opacity-60`} />
                    <span className={`relative inline-flex size-1.5 rounded-full ${received ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                  </span>
                  {received ? "live" : "connecting"}
                </span>
              </TabsList>
            </div>

            <TabsContent value="chart" className="mt-0 flex flex-col">
              <div className="border border-t-0 border-border/60 bg-card/20 backdrop-blur-sm relative h-[280px] md:h-[330px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <LineChart
                    accessibilityLayer
                    data={hasData ? history : skeletonData}
                    margin={{ top: 16, right: 16, left: 16, bottom: 16 }}
                  >
                    <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.2} vertical={false} />
                    {hasData && (
                      <ChartTooltip
                        cursor={true}
                        content={<ChartTooltipContent className="w-[200px]" indicator="line" />}
                      />
                    )}
                    <YAxis domain={["dataMin - 100", "dataMax + 100"]} hide />
                    {hasData &&
                      Object.entries(history[history.length - 1]?.sources || {}).map(([source]) => (
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

              <div className="border border-t-0 border-border/60 grid grid-cols-2 bg-card/40 backdrop-blur-sm">
                <div className="flex flex-col p-5 gap-2 border-r border-border/60">
                  <div className="flex justify-between items-center">
                    <span className="uppercase tracking-widest text-muted-foreground text-[10px]">BTC / USD</span>
                    {delta !== 0 && (
                      <span className={`text-[10px] tracking-widest ${deltaPositive ? "text-emerald-400" : "text-red-400"}`}>
                        {deltaPositive ? "▲" : "▼"} {fmt(Math.abs(delta))}
                      </span>
                    )}
                  </div>
                  <p className="font-title text-3xl md:text-4xl font-bold tracking-tight">
                    {last !== undefined ? fmt(last) : "—"}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
                    median · {latest ? Object.keys(latest.data.sources).length : 0} sources
                  </p>
                </div>
                <div className="flex flex-col p-5 gap-2">
                  <span className="uppercase tracking-widest text-muted-foreground text-[10px]">Sources</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1 overflow-hidden">
                    {(latest
                      ? Object.entries(latest.data.sources)
                      : [["binance", 0], ["coinbase", 0], ["kraken", 0], ["chainlink", 0]]
                    ).slice(0, 6).map(([source, price]) => (
                      <div
                        key={source as string}
                        className="text-[11px] uppercase tracking-wider flex items-center justify-between gap-2 text-muted-foreground"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: sourceColor[source as string] ?? "#888" }}
                          />
                          {source}
                        </span>
                        <span className="text-foreground/80">
                          {price ? fmt(price as number) : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subscribe" className="mt-0">
              <CodeBlock title="price.ts" code={subscribeSnippet} lang="ts" />
            </TabsContent>

            <TabsContent value="verify" className="mt-0">
              <CodeBlock title="verify.ts" code={verifySnippet} lang="ts" />
            </TabsContent>

            <TabsContent value="result" className="mt-0">
              <CodeBlock
                title="latest event — streaming"
                lang="json"
                code={result?.pretty ?? "// awaiting first signal from the relay…"}
                footer={
                  result && (
                    <div className="border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 divide-x divide-white/10">
                      <div className="px-4 py-3 flex flex-col gap-1">
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">BTC / USD</span>
                        <span className="text-base font-bold tracking-tight text-white">
                          {fmt(latest!.data.median)}
                        </span>
                      </div>
                      <div className="px-4 py-3 flex flex-col gap-1">
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Sources</span>
                        <span className="text-base font-bold tracking-tight text-white">
                          {Object.keys(latest!.data.sources).length}/7
                        </span>
                      </div>
                      <div className="px-4 py-3 flex items-center gap-2 col-span-2 sm:col-span-1">
                        {result.valid && (
                          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" /> signature valid
                          </span>
                        )}
                      </div>
                    </div>
                  )
                }
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default Hero;
