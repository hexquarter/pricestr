import { Activity, AppWindow, Lock, Network, Shrink, ChevronRight } from "lucide-react";
import { SectionHead } from "./SectionHead";

const stages = [
  { icon: Activity, n: "01", title: "Exchange APIs", lines: ["Binance", "Kraken", "Coinbase"] },
  { icon: Shrink, n: "02", title: "Aggregation", lines: ["Median filter", "Open-source logic", "Isolated signer"] },
  { icon: Lock, n: "03", title: "Signed event", lines: ["Nostr event", "Immutable ID", "Tamper-proof"] },
  { icon: Network, n: "04", title: "Relay", lines: ["wss://pricestr.xyz", "Any public relay", "Dedicated for Pro+"] },
  { icon: AppWindow, n: "05", title: "Your app", lines: ["Query any relay", "Verify signature", "Use price"] },
];

const SignalChain = () => (
  <section id="pipeline" className="scroll-mt-24">
    <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
      <SectionHead
        eyebrow="Data pipeline"
        title={
          <>
            Signal <br />
            <span className="text-violet-400">chain</span>
          </>
        }
        lead="From a raw exchange tick to a verified Nostr event running inside your application. Every hop is open-source, auditable, and replaceable — there is no proprietary middle box anywhere in this pipeline."
      />

      <div className="grid md:grid-cols-5 border border-border/40 relative">
        {stages.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.n}
              className={`p-6 flex flex-col gap-5 relative ${
                i > 0 ? "md:border-l border-border/40 border-t md:border-t-0" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <Icon className="text-primary h-5 w-5" />
                <p className="text-3xl tracking-tight font-[900] font-title uppercase text-foreground/10">{s.n}</p>
              </div>
              <h3 className="tracking-tight font-[900] font-title uppercase text-2xl leading-tight">{s.title}</h3>
              <div className="flex flex-col gap-1 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                {s.lines.map((l) => (
                  <span key={l}>· {l}</span>
                ))}
              </div>
              {i < stages.length - 1 && (
                <ChevronRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60 bg-background" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default SignalChain;
