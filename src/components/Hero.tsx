import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Line, LineChart, YAxis, CartesianGrid } from "recharts";
import { ChartConfig, ChartContainer } from "./ui/chart";
import { Link } from "react-router-dom";
import { useRelay, PriceData } from "@/hooks/use-relay";
import { ArrowRight, ShieldCheck, Zap, Radio } from "lucide-react";

const Hero = () => {
  const { relay } = useRelay();

  const [chartData, setChartData] = useState<PriceData[]>([]);
  const [changePrices, setChangePrices] = useState<number[]>([]);
  const chartConfig = {} satisfies ChartConfig;

  useEffect(() => {
    if (relay) {
      relay.subscribePrice("free", (data) => {
        setChartData((prev) => [...prev, data].slice(-60));
        setChangePrices((prev) => {
          if (prev.length === 0) return [data.aggregate];
          return [data.aggregate, prev[0]];
        });
      });
    }
  }, [relay]);

  const hasData = chartData.length > 0;
  const last = changePrices[0];
  const delta = changePrices.length > 1 ? changePrices[0] - changePrices[1] : 0;
  const deltaPositive = delta >= 0;

  const skeletonData = Array.from({ length: 30 }, (_, i) => ({
    aggregate: 70000 + Math.sin(i / 3) * 80 + Math.cos(i / 5) * 40,
  }));

  const fmt = (v?: number) =>
    typeof v === "number"
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v)
      : "—";

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden pt-24 pb-12 px-4 md:px-6">
      {/* Page-level dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden">
        {/* CRT scanline overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-30 opacity-[0.04]"
          style={{
            background:
              "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))",
            backgroundSize: "100% 2px, 3px 100%",
          }}
        />

        {/* Top status strip */}
        <div className="relative z-10 flex items-center justify-between gap-4 border-b border-border/60 bg-background/60 px-5 py-2.5 text-[10px] font-mono uppercase tracking-widest">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              <span className="text-primary">Live</span>
            </span>
            <span className="text-border">|</span>
            <span>BTC/USD · {fmt(last)}</span>
            {delta !== 0 && (
              <span className={deltaPositive ? "text-green-400" : "text-red-400"}>
                {deltaPositive ? "▲" : "▼"} {fmt(Math.abs(delta))}
              </span>
            )}
          </div>
          <div className="hidden md:flex items-center gap-4 text-muted-foreground/70">
            <span>relay: wss://relay.pricestr.xyz</span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
              Operational
            </span>
          </div>
        </div>

        {/* Main interface grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12">
          {/* LEFT — Core hook + live visualization */}
          <div className="lg:col-span-7 p-6 md:p-10 lg:border-r border-border/60 flex flex-col gap-7">
            <div className="inline-flex self-start items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1">
              <span className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest">
                Signed Oracle
              </span>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-foreground/80 text-[10px] font-mono uppercase tracking-widest">
                NIP-78 · kind 30078
              </span>
            </div>

            <div className="flex flex-col gap-5">
              <h1 className="text-5xl md:text-7xl lg:text-8xl tracking-tight font-[900] font-title uppercase leading-[0.9]">
                The <span className="text-violet-400">Nostr</span>
                <br />
                price oracle.
              </h1>

              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                No API keys. No black-box databases. Just cryptographically signed Bitcoin price
                events broadcast over open Nostr relays.{" "}
                <span className="text-foreground underline decoration-primary underline-offset-4 decoration-2">
                  Verifiability is the signal.
                </span>
              </p>
            </div>

            {/* Live signal visualization */}
            <div className="relative h-56 md:h-64 w-full border border-border/60 bg-background/60 overflow-hidden">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "radial-gradient(hsl(var(--primary) / 0.4) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />
              <div className="absolute top-3 left-4 text-[10px] font-mono text-primary/80 uppercase tracking-widest z-10">
                signal stream · kind:30078
              </div>
              <div className="absolute top-3 right-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest z-10 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                {hasData ? `${chartData.length} ticks` : "awaiting…"}
              </div>

              <div className="absolute inset-x-0 bottom-0 top-10">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <LineChart
                    accessibilityLayer
                    data={hasData ? chartData : skeletonData}
                    margin={{ top: 8, right: 12, left: 12, bottom: 8 }}
                  >
                    <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.15} vertical={false} />
                    <YAxis domain={["dataMin - 100", "dataMax + 100"]} hide />
                    <Line
                      dataKey="aggregate"
                      type="natural"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={!hasData}
                      opacity={hasData ? 1 : 0.4}
                    />
                  </LineChart>
                </ChartContainer>
              </div>

              {/* Code snippet overlay */}
              <div className="absolute bottom-3 right-4 text-[9px] font-mono leading-relaxed text-right text-green-400/70 hidden sm:block z-10 bg-background/40 px-2 py-1 backdrop-blur-sm">
                "kind": 30078,
                <br />
                "pubkey": "npub1…",
                <br />
                "sig": "{hasData ? "verified ✓" : "8f2b…"}"
              </div>

              {!hasData && (
                <div className="absolute inset-x-0 bottom-4 flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 animate-pulse">
                    · awaiting first signal ·
                  </span>
                </div>
              )}
            </div>

            {/* Big price + CTAs */}
            <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-end">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Consensus · median 3 sources
                </span>
                <span className="font-title text-4xl md:text-5xl font-[900] tracking-tight tabular-nums leading-none mt-2">
                  {fmt(last)}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 justify-start sm:justify-end">
                <Button asChild className="font-mono uppercase tracking-widest text-xs h-12 px-6">
                  <Link to="#get-started">
                    Start free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="font-mono uppercase tracking-widest text-xs h-12 px-6"
                >
                  <Link to="/docs">Read docs</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT — Signal chain + tier teaser */}
          <div className="lg:col-span-5 flex flex-col border-t lg:border-t-0 border-border/60">
            {/* Signal chain */}
            <div className="p-6 md:p-8 border-b border-border/60 flex flex-col gap-6">
              <h3 className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] font-bold">
                // the signal chain
              </h3>

              <div className="flex flex-col gap-5">
                {[
                  {
                    n: "01",
                    title: "Aggregate",
                    body: "Weighted median across Binance, Coinbase, Kraken. Outliers and spoofed ticks filtered out.",
                  },
                  {
                    n: "02",
                    title: "Sign & broadcast",
                    body: "Each tick signed by PriceStr's isolated Nostr keypair as a kind 30078 event, then pushed to relays.",
                  },
                  {
                    n: "03",
                    title: "Verify locally",
                    body: "Your client checks the signature in one function call. The signature is truth — not the relay.",
                  },
                ].map((step, i, arr) => (
                  <div key={step.n} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-7 w-7 rounded-full border border-primary/60 flex items-center justify-center text-[10px] font-mono text-primary">
                        {step.n}
                      </div>
                      {i < arr.length - 1 && <div className="w-px flex-1 bg-border/60 mt-1" />}
                    </div>
                    <div className="pb-2">
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-foreground mb-1">
                        {step.title}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="#how-it-works"
                className="text-[10px] font-mono uppercase tracking-widest text-primary hover:text-primary/80 flex items-center gap-1 self-start"
              >
                Read the protocol <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Tier teaser */}
            <div className="p-6 md:p-8 flex-1 bg-background/40 flex flex-col gap-5">
              <h3 className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] font-bold">
                // service tiers
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="#get-started"
                  className="group p-4 border border-border/60 bg-card/40 hover:border-primary/40 transition-colors flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                      Community
                    </span>
                    <Radio className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-xl font-title font-[900] uppercase tracking-tight">Free</div>
                  <ul className="text-[10px] font-mono text-muted-foreground space-y-1 mt-1">
                    <li className="flex items-center gap-1.5">
                      <span className="text-green-400">✓</span> Public relay feed
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-green-400">✓</span> 60s resolution
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-green-400">✓</span> Open-source SDK
                    </li>
                  </ul>
                </Link>

                <Link
                  to="#pricing"
                  className="group relative p-4 border border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col gap-2"
                >
                  <div className="absolute -top-2 right-2 bg-primary text-primary-foreground text-[8px] font-mono font-bold px-1.5 py-0.5 uppercase tracking-widest">
                    L402
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-primary/80">
                      Professional
                    </span>
                    <Zap className="h-3 w-3 text-primary" />
                  </div>
                  <div className="text-xl font-title font-[900] uppercase tracking-tight">Pro</div>
                  <ul className="text-[10px] font-mono text-foreground/80 space-y-1 mt-1">
                    <li className="flex items-center gap-1.5">
                      <span className="text-primary">✓</span> Dedicated relay
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-primary">✓</span> Webhook push
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-primary">✓</span> 1s resolution
                    </li>
                  </ul>
                </Link>
              </div>

              {/* Trust strip */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/40">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-title font-bold text-foreground">3+</span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                    sources
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-title font-bold text-foreground">100%</span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                    open source
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 items-start">
                  <span className="text-sm font-title font-bold text-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Signed
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                    every event
                  </span>
                </div>
              </div>

              <Link
                to="#pricing"
                className="mt-auto py-3 border border-border/60 hover:border-foreground/60 hover:text-foreground transition-colors text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground text-center"
              >
                Compare full features →
              </Link>
            </div>
          </div>
        </div>

        {/* Terminal status footer */}
        <div className="relative z-10 border-t border-border/60 bg-background/60 px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono text-muted-foreground/70 uppercase tracking-widest">
          <div className="flex flex-wrap gap-4">
            <span>os: sigrate-v1.0</span>
            <span>latency: ~40ms</span>
            <span className="text-primary/70">entropy: verified</span>
          </div>
          <div className="text-primary/70">building on bitcoin + nostr</div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
