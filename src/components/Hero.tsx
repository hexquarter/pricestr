import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Line, LineChart, YAxis, CartesianGrid } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { Link } from "react-router-dom";
import { PriceData } from "@/hooks/use-relay";
import { ArrowRight } from "lucide-react";
import { SimplePool } from "nostr-tools";

const FREE_RELAIS = [
  'wss://relay.nostrcheck.me',
  'wss://relay.nostriches.club',
  'wss://nos.lol',
  'wss://relay.damus.io',
  'wss://relay.primal.net'
]

const Hero = () => {
  const [chartData, setChartData] = useState<PriceData[]>([]);
  const [changePrices, setChangePrices] = useState<number[]>([]);
  const chartConfig = {} satisfies ChartConfig;

  useEffect(() => {
    const pool = new SimplePool()
    pool.subscribe(FREE_RELAIS, {
      kinds: [30078],
      "#t": [`pricestr/free`]
    }, {
      onevent({ content }) {
        const data = JSON.parse(content);
        setChartData((prev) => [...prev, data].slice(-60));
        setChangePrices((prev) => {
          if (prev.length === 0) return [data.median];
          return [data.median, prev[0]];
        });
      }
    })
  }, []);

  const hasData = chartData.length > 0;
  const last = changePrices[0];
  const delta = changePrices.length > 1 ? changePrices[0] - changePrices[1] : 0;
  const deltaPositive = delta >= 0;

  // Fallback skeleton data so the chart never looks empty
  const skeletonData = Array.from({ length: 30 }, (_, i) => ({
    median: 70000 + Math.sin(i / 3) * 80 + Math.cos(i / 5) * 40,
  }));

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden pt-24 pb-16">
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-12 gap-12 items-center">
        {/* Left: copy */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="inline-flex items-center gap-2 self-start text-[10px] font-mono uppercase tracking-widest text-muted-foreground border border-border/60 rounded-full px-3 py-1">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            Decentralized price oracle · live on Nostr
          </div>

          <h1 className="text-5xl md:text-7xl tracking-tight font-[900] font-title uppercase leading-[0.9]">
            Verifiable <span className="text-violet-400">BTC price</span> for the rest of your stack.
          </h1>

          <p className="text-lg md:text-xl font-light text-foreground/90 leading-relaxed">
            The decentralized price oracle for Bitcoin & Nostr-native dApps. Signed at the source, served over relays, verified locally. No API keys. No trusted middlemen. No oracle risk.
          </p>

          <div className="border-l border-violet-400/60 pl-5 flex flex-col gap-1 text-sm text-muted-foreground leading-relaxed font-mono">
            <p>· Drop-in for wallets, DEXes, lending desks, LSPs and Nostr apps</p>
            <p>· One Schnorr signature replaces a CoinGecko key + a Chainlink feed</p>
            <p>· $10/mo for production. Free forever for builders.</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="font-mono uppercase tracking-widest text-xs h-11 px-6 bg-violet-400 hover:bg-violet-300 text-background">
              <Link to="#pricing">
                Start for $10/mo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="font-mono uppercase tracking-widest text-xs h-11 px-6">
              <Link to="#get-started">Try free feed →</Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="py-1.5 px-3 text-[10px] font-mono uppercase tracking-widest rounded-full border border-border/60 text-muted-foreground">
              Open-source
            </span>
            <span className="py-1.5 px-3 text-[10px] font-mono uppercase tracking-widest rounded-full border border-border/60 text-muted-foreground">
              Lightning-paid
            </span>
            <span className="py-1.5 px-3 text-[10px] font-mono uppercase tracking-widest rounded-full border border-primary/20 text-primary/80">
              No KYC · no accounts
            </span>
          </div>
        </div>

        {/* Right: chart */}
        <div className="lg:col-span-7 flex flex-col font-mono text-xs">
          <div className="border border-border/60 flex justify-between items-center px-4 py-3 uppercase tracking-widest text-[10px] bg-card/40 backdrop-blur-sm">
            <span className="text-muted-foreground">Price signal</span>
            <span className="text-primary flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Live
            </span>
            <span className="text-muted-foreground">60s interval</span>
          </div>

          <div className="border border-t-0 border-border/60 bg-card/20 backdrop-blur-sm relative h-[280px] md:h-[320px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart accessibilityLayer data={hasData ? chartData : skeletonData} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.2} vertical={false} />
                {hasData && (
                  <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent className="w-[200px]" indicator="line" />}
                  />
                )}
                <YAxis domain={["dataMin - 100", "dataMax + 100"]} hide />
                {hasData &&
                  Object.entries(chartData[0]?.sources || {}).map(([source]) => (
                    <Line
                      key={source}
                      dataKey={`sources.${source}`}
                      type="natural"
                      stroke={source === "binance" ? "#ffdd00" : source === "coinbase" ? "#0059ff" : "#6532b7"}
                      dot={false}
                      opacity={0.5}
                      strokeWidth={1}
                      name={source}
                    />
                  ))}
                <Line
                  dataKey="median"
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
                  <span className={`text-[10px] tracking-widest ${deltaPositive ? "text-green-400" : "text-red-400"}`}>
                    {deltaPositive ? "▲" : "▼"} {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(delta))}
                  </span>
                )}
              </div>
              <p className="font-title text-3xl md:text-4xl font-bold tracking-tight">
                {hasData
                  ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(last)
                  : "—"}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">median · 3 sources</p>
            </div>
            <div className="flex flex-col p-5 gap-2">
              <span className="uppercase tracking-widest text-muted-foreground text-[10px]">Sources</span>
              <div className="flex flex-col gap-1.5 mt-1">
                {hasData
                  ? Object.entries(chartData[chartData.length - 1].sources).map(([source, price]) => (
                    <div key={source} className="text-[11px] uppercase tracking-wider flex items-center justify-between gap-2 text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${source === "binance" ? "bg-yellow-400" : source === "coinbase" ? "bg-blue-500" : "bg-violet-400"
                            }`}
                        />
                        {source}
                      </span>
                      <span className="text-foreground/80">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)}
                      </span>
                    </div>
                  ))
                  : ["binance", "coinbase", "kraken"].map((s) => (
                    <div key={s} className="text-[11px] uppercase tracking-wider flex items-center gap-2 text-muted-foreground/40">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                      {s}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
