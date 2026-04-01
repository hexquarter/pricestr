import ProofModel from "./ProofModel";
import { SectionHeader } from "./SectionHeader";

const HowItWorks = () => (
  <section className="">
    <div className="max-w-7xl mx-auto px-6 flex flex-col gap-10">
      <SectionHeader title="Protocol" />
      <header className="flex justify-between items-center gap-5">
        <h2 className="text-7xl tracking-tight mb-6 font-[900] font-title uppercase text-primary-500">
          How it <br /><span className="text-violet-400">works</span>
        </h2>
      </header>
      <div className="grid md:grid-cols-3">
        <div className="border border-white/10 p-5 flex flex-col gap-5">
          <p className="text-7xl tracking-tight font-[900] font-title uppercase text-gray-500/20">01</p>
          <h3 className="tracking-tight font-[900] font-title uppercase text-4xl text-primary">Aggregated</h3>
          <p className="leading-5 text-xs font-mono text-muted-foreground">Price data is pulled from multiple exchange APIs each cycle. The median value is computed to eliminate outliers, spoofed ticks, and single-source manipulation vectors.</p>
        </div>
        <div className="border border-white/10 border-l-0 p-5 flex flex-col gap-5">
          <p className="text-7xl tracking-tight font-[900] font-title uppercase text-gray-500/20">02</p>
          <h3 className="tracking-tight font-[900] font-title uppercase text-4xl text-primary">Signed</h3>
          <p className="leading-5 text-xs font-mono text-muted-foreground">Each price event is signed by Sigrate's Nostr keypair inside a hardened enclave. The signature is deterministic — any Nostr library can verify it in one function call.</p>
        </div>
        <div className="border border-white/10 border-l-0 p-5 flex flex-col gap-5">
          <p className="text-7xl tracking-tight font-[900] font-title uppercase text-gray-500/20">03</p>
          <h3 className="tracking-tight font-[900] font-title uppercase text-4xl text-primary">Delivered</h3>
          <p className="leading-5 text-xs font-mono text-muted-foreground">The signed event is broadcast across the Nostr relay network. Your application queries any relay — it doesn't matter which one. The signature is the truth, not the relay.</p>
        </div>
      </div>

      <ProofModel />
    </div>
  </section>
);

export default HowItWorks;
