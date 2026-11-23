import { SectionHead } from "./SectionHead";
import Verifier from "./Verifier";

const risks = [
  {
    threat: "A lying exchange",
    defense: "Outliers and stale ticks are rejected; the median is resistant to a single bad source.",
  },
  {
    threat: "A lying relay",
    defense: "A relay can hide or delay events — it cannot forge a signature it has no key for.",
  },
  {
    threat: "A tampered payload",
    defense: "One changed satoshi invalidates the signature. The event is the proof.",
  },
  {
    threat: "Stale or replayed data",
    defense: "Every print is timestamped and addressable by event ID — you decide what counts as fresh.",
  },
];

const Verify = () => (
  <section id="verify" className="scroll-mt-24">
    <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
      <SectionHead
        eyebrow="Don't trust — verify"
        title={
          <>
            Verify it <br />
            <span className="text-violet-400">right here</span>
          </>
        }
        lead="This is not a screenshot. The event below is streaming from the relay, and the signature check runs locally in your browser. Flip the tamper switch and watch a single changed satoshi break the proof."
      />

      <div className="grid lg:grid-cols-12 gap-px bg-border/40 border border-border/40">
        {/* Live verifier */}
        <div className="lg:col-span-7 bg-background p-6 md:p-8">
          <Verifier />
        </div>

        {/* Threat model */}
        <div className="lg:col-span-5 bg-background p-6 md:p-8 flex flex-col gap-6">
          <h3 className="tracking-tight font-[900] font-title uppercase text-2xl md:text-3xl">
            What could go wrong —<br />
            <span className="text-violet-400">and what stops it</span>
          </h3>
          <div className="flex flex-col divide-y divide-border/40">
            {risks.map((r) => (
              <div key={r.threat} className="py-4 flex flex-col gap-1.5 first:pt-0 last:pb-0">
                <p className="text-[11px] font-mono uppercase tracking-widest text-red-400/90">
                  ✕ {r.threat}
                </p>
                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                  → {r.defense}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-auto border-t border-border/40 pt-5 flex flex-col gap-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-primary">// bottom line</p>
            <p className="text-sm font-mono text-muted-foreground leading-relaxed">
              The signature collapses every intermediate trust hop into one local check —
              in TypeScript, Rust, Go, Python, Swift or Kotlin.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Verify;
