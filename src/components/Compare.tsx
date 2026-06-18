import { Check, X, Minus } from "lucide-react";
import { SectionHead } from "./SectionHead";

const rows = [
  { label: "Decentralized transport", pricestr: "yes", coingecko: "no", chainlink: "partial" },
  { label: "Verifiable client-side", pricestr: "yes", coingecko: "no", chainlink: "partial" },
  { label: "No API key / no account", pricestr: "yes", coingecko: "no", chainlink: "no" },
  { label: "Pay in sats (Lightning)", pricestr: "yes", coingecko: "no", chainlink: "no" },
  { label: "Can be revoked or rate-limited", pricestr: "no", coingecko: "yes", chainlink: "no" },
  { label: "On-chain gas to read price", pricestr: "no", coingecko: "no", chainlink: "yes" },
  { label: "Replayable historical proof", pricestr: "yes", coingecko: "no", chainlink: "partial" },
  { label: "Monthly cost for production use", pricestr: "$10", coingecko: "$129+", chainlink: "Gas per read" },
];

const cell = (v: string) => {
  if (v === "yes") return <Check className="h-4 w-4 text-violet-400 mx-auto" />;
  if (v === "no") return <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  if (v === "partial") return <Minus className="h-4 w-4 text-muted-foreground/60 mx-auto" />;
  return <span className="text-xs font-mono">{v}</span>;
};

const Compare = () => (
  <section id="compare" className="scroll-mt-24">
    <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
      <SectionHead
        eyebrow="Comparison"
        title={
          <>
            Why not just use <br />
            <span className="text-violet-400">CoinGecko or Chainlink?</span>
          </>
        }
        lead="They both work — until they don't. One can revoke your key and change its TOS overnight. The other costs gas per read and isn't designed for Bitcoin-native or off-chain Nostr apps. PriceStr is built for the gap in between."
      />

      <div className="border border-border/40 overflow-x-auto">
        <table className="w-full font-mono text-xs">
          <thead>
            <tr className="border-b border-border/40 bg-card/30">
              <th className="text-left p-4 text-[10px] uppercase tracking-widest text-muted-foreground font-normal">
                Property
              </th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-violet-400 font-normal">
                PriceStr
              </th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-muted-foreground font-normal">
                CoinGecko / CMC
              </th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-muted-foreground font-normal">
                Chainlink
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} className={i < rows.length - 1 ? "border-b border-border/40" : ""}>
                <td className="p-4 text-foreground/90">{r.label}</td>
                <td className="p-4 text-center bg-violet-400/5">{cell(r.pricestr)}</td>
                <td className="p-4 text-center">{cell(r.coingecko)}</td>
                <td className="p-4 text-center">{cell(r.chainlink)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs font-mono text-muted-foreground/70 leading-relaxed max-w-2xl">
        · Properties reflect typical production usage as of 2025. Chainlink "partial" entries account for the difference between feed transport and on-chain consumption. PriceStr is not a Chainlink replacement on EVM; it's the missing oracle for Bitcoin & Nostr-native stacks.
      </p>
    </div>
  </section>
);

export default Compare;
