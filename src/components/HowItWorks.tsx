import ProofModel from "./ProofModel";
import { SectionHead } from "./SectionHead";

const steps = [
  {
    n: "01",
    title: "Aggregated",
    body:
      "Price data is pulled from multiple exchange APIs each cycle. The median value eliminates outliers, spoofed ticks, and single-source manipulation. Every line of aggregation code is open source.",
  },
  {
    n: "02",
    title: "Signed",
    body:
      "Each price event is signed by PriceStr's Nostr keypair on an isolated signer. The signature is deterministic — any Nostr library verifies it in one function call.",
  },
  {
    n: "03",
    title: "Delivered",
    body:
      "The signed event is broadcast across the Nostr relay network. Your application queries any relay — it doesn't matter which one. The signature is the truth, not the relay.",
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
        lead="A three-step pipeline turning noisy exchange data into a single cryptographically-signed price event, distributed over open relays."
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
          </div>
        ))}
      </div>

      <ProofModel />
    </div>
  </section>
);

export default HowItWorks;
