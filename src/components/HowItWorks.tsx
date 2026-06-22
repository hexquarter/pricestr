import ProofModel from "./ProofModel";
import { SectionHead } from "./SectionHead";

const steps = [
  {
    n: "01",
    title: "Aggregated",
    body: "We fan out to CEX, DEX, and P2P venues in parallel.",
    items: [
      'Stale ticks rejected',
      'Outliers dropped',
      'Median becomes canonical'
    ],
    meta: "trusted median · Stale rejection · Outliers cleaned",
  },
  {
    n: "02",
    title: "Signed",
    body: "Canonical event payload signature",
    meta: "Deterministc · Schnorr signature · One verification call",
  },
  {
    n: "03",
    title: "Delivered",
    body: "Fanned out to primary & public relays.",
    meta: "Signature travels with data · Relay-agnostic · < 5s latency",
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
        lead="Three stages. One cryptographically signed truth."
      />

      <div className="grid md:grid-cols-3 border border-border/40">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className={`p-8 flex flex-col gap-5 ${i > 0 ? "md:border-l border-border/40 border-t md:border-t-0" : ""}`}
          >
            <p className="text-6xl tracking-tight font-[900] font-title uppercase text-white/10">{s.n}</p>
            <h3 className="tracking-tight font-[900] font-title uppercase text-3xl text-white">{s.title}</h3>
            <p className="leading-relaxed text-sm font-mono text-muted-foreground">{s.body}</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 border-t border-border/40 pt-4 mt-auto">
              · {s.meta}
            </p>
          </div>
        ))}
      </div>

      <ProofModel />
    </div>
  </section>
);

export default HowItWorks;
