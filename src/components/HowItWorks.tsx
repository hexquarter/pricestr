import ProofModel from "./ProofModel";
import { SectionHead } from "./SectionHead";

const steps = [
  {
    n: "01",
    title: "Aggregated",
    body:
      "Every cycle we fan out to Binance, Kraken and Coinbase in parallel. Stale ticks are rejected, outliers are dropped, and the median of the survivors becomes the canonical print. The full aggregation pipeline is open-source, reproducible, and reviewable line by line — no black box, no closed dashboard, no privileged data path.",
    meta: "median · 3 venues · stale-tick filter",
  },
  {
    n: "02",
    title: "Signed",
    body:
      "The aggregate is handed to an isolated signer that holds the private key in memory only. A Schnorr signature is computed deterministically over the canonical event payload — the same bytes, the same signature, every time. Any Nostr library, in any language, can verify it locally in a single function call.",
    meta: "schnorr · BIP-340 · isolated signer",
  },
  {
    n: "03",
    title: "Delivered",
    body:
      "The signed event is fanned out to PriceStr's primary relay and mirrored to selected public relays. Your application subscribes wherever it likes — our relay, a community relay, a self-hosted mirror. The signature travels with the data, so the relay is just transport. Trust collapses down to one cryptographic check.",
    meta: "wss · nostr · relay-agnostic",
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="scroll-mt-24">
    <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
      <SectionHead
        eyebrow="Protocol"
        title={
          <>
            How it <br />
            <span className="text-violet-400">works</span>
          </>
        }
        lead="Three discrete stages turn noisy, untrusted exchange data into a single cryptographically-signed price event that any client can verify without talking to us — ever."
      />

      <div className="grid md:grid-cols-3 border border-border/40">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className={`p-8 flex flex-col gap-5 ${i > 0 ? "md:border-l border-border/40 border-t md:border-t-0" : ""}`}
          >
            <p className="text-6xl tracking-tight font-[900] font-title uppercase text-foreground/10">{s.n}</p>
            <h3 className="tracking-tight font-[900] font-title uppercase text-3xl text-primary">{s.title}</h3>
            <p className="leading-relaxed text-sm font-mono text-muted-foreground">{s.body}</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 border-t border-border/40 pt-4 mt-auto">
              · {s.meta}
            </p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 border border-border/40 border-t-0 -mt-12">
        {[
          { k: "End-to-end latency", v: "< 1.2s", sub: "from exchange tick to signed event on the relay" },
          { k: "Failure mode", v: "Fail closed", sub: "if sources disagree past tolerance, no event is published" },
          { k: "Trust surface", v: "1 signature", sub: "everything else is verifiable, replaceable, or open-source" },
        ].map((s, i) => (
          <div key={s.k} className={`p-8 flex flex-col gap-2 ${i > 0 ? "md:border-l border-border/40 border-t md:border-t-0" : ""}`}>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.k}</p>
            <p className="text-3xl font-title font-[900] uppercase tracking-tight text-foreground">{s.v}</p>
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">{s.sub}</p>
          </div>
        ))}
      </div>

      <ProofModel />
    </div>
  </section>
);

export default HowItWorks;
