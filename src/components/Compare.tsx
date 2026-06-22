import { Check, Minus, X } from "lucide-react";
import { SectionHead } from "./SectionHead";

type Cell = boolean | "partial" | string;

const rows: { label: string; pricestr: Cell; coingecko: Cell; chainlink: Cell }[] = [
  { label: "Cryptographically signed", pricestr: true, coingecko: false, chainlink: true },
  { label: "Verifiable client-side", pricestr: true, coingecko: false, chainlink: "partial" },
  { label: "No API key required", pricestr: true, coingecko: false, chainlink: true },
  { label: "Nostr-native transport", pricestr: true, coingecko: false, chainlink: false },
  { label: "10-second cadence", pricestr: true, coingecko: "partial", chainlink: false },
  { label: "Self-hostable relay", pricestr: true, coingecko: false, chainlink: false },
  { label: "Price for Pro tier", pricestr: "$10 / mo", coingecko: "$129+ / mo", chainlink: "Gas + integration" },
];

const renderCell = (v: Cell, accent = false) => {
  if (v === true) return <Check className={`h-4 w-4 ${accent ? "text-violet-400" : "text-primary"}`} />;
  if (v === false) return <X className="h-4 w-4 text-muted-foreground/40" />;
  if (v === "partial") return <Minus className="h-4 w-4 text-muted-foreground" />;
  return <span className={`text-xs font-mono ${accent ? "text-violet-400" : "text-foreground/80"}`}>{v}</span>;
};

const Compare = () => (
  <section id="compare" className="scroll-mt-24">
    <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
      <SectionHead
        eyebrow="Compare"
        title={
          <>
            Simple since <br />
            <span className="text-violet-400">the begining</span>
          </>
        }
        lead="PriceStr ships a signed event you can integrate in 8 lines of code. No key, no JWT rotation, no rate-limit dashboards."
      />

      <div className="border border-border/40 overflow-hidden">
        <div className="grid grid-cols-4 bg-card/40 border-b border-border/40">
          <div className="p-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Capability</div>
          <div className="p-4 text-[10px] font-mono uppercase tracking-widest text-violet-400 border-l border-border/40">PriceStr</div>
          <div className="p-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-l border-border/40">CoinGecko</div>
          <div className="p-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-l border-border/40">Chainlink</div>
        </div>
        {rows.map((r, i) => (
          <div key={r.label} className={`grid grid-cols-4 ${i < rows.length - 1 ? "border-b border-border/40" : ""}`}>
            <div className="p-4 text-xs font-mono text-foreground/90">{r.label}</div>
            <div className="p-4 border-l border-border/40 flex items-center">{renderCell(r.pricestr, true)}</div>
            <div className="p-4 border-l border-border/40 flex items-center">{renderCell(r.coingecko)}</div>
            <div className="p-4 border-l border-border/40 flex items-center">{renderCell(r.chainlink)}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Compare;
