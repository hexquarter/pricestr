import { Check } from "lucide-react";
import ProofModel from "./ProofModel";
import { Button } from "./ui/button";
import { SectionHeader } from "./SectionHeader";

const PricingTiers = () => (
  <section className="">
    <div className="max-w-7xl mx-auto px-6 flex flex-col gap-10">
      <SectionHeader title="Pricing" />
      <header className="flex justify-between items-center gap-5">
        <h2 className="text-7xl tracking-tight mb-6 font-[900] font-title uppercase">
          Simple <br /><span className="text-violet-400">Pricing</span>
        </h2>
      </header>
      <div className="grid md:grid-cols-3">
        <div className="border border-white/10 flex flex-col gap-5">
          <header className="flex flex-col gap-2 border-b p-5 ">
            <p className="text-xs font-mono uppercase text-muted-foreground">Communitity</p>
            <h3 className="tracking-tight font-[300] font-title text-5xl">Free</h3>
          </header>
          <div className="flex flex-col p-5 text-xs font-mono text-muted-foreground gap-2 border-b border-border/10">
            <p className="flex items-center gap-2"><Check className="text-primary h-3" /> BTC/USD public feed</p>
            <p className="flex items-center gap-2"><Check className="text-primary h-3" /> 60-second interval</p>
            <p className="flex items-center gap-2"><Check className="text-primary h-3" /> Community support</p>
            <p className="flex items-center gap-2"><Check className="text-primary h-3" /> Signature verification</p>
          </div>
          <footer className="p-5 ">
            <Button variant='outline' className="uppercase font-mono w-full">Get started</Button>
          </footer>
        </div>
        <div className="border border border-violet-400 flex flex-col gap-5">
          <header className="flex flex-col gap-2 border-b p-5 ">
            <p className="text-xs font-mono uppercase text-muted-foreground">Professional</p>
            <h3 className="tracking-tight font-[300] font-title text-5xl">$20</h3>
          </header>
          <div className="flex flex-col p-5 text-xs font-mono text-muted-foreground gap-2 border-b border-border/10">
            <p className="flex items-center gap-2"><Check className="text-primary h-3" /> USD, EUR pairs</p>
            <p className="flex items-center gap-2"><Check className="text-primary h-3" /> Real-time feed</p>
            <p className="flex items-center gap-2"><Check className="text-primary h-3" /> Dedicated relay endpoints</p>
            <p className="flex items-center gap-2"><Check className="text-primary h-3" /> Webhook notifications</p>
          </div>
          <footer className="p-5 ">
            <Button variant='default' className="uppercase font-mono w-full">Subscribe</Button>
          </footer>
        </div>
        <div className="border border-l-0 border-white/10 flex flex-col gap-5">
          <header className="flex flex-col gap-2 border-b p-5 ">
            <p className="text-xs font-mono uppercase text-muted-foreground">Enterprise</p>
            <h3 className="tracking-tight font-[300] font-title text-5xl">Custom</h3>
          </header>
          <div className="flex flex-col p-5 text-xs font-mono text-muted-foreground gap-2 border-b border-border/10">
            <p className="flex items-center gap-2"><Check className="text-primary h-3" /> All Professional features</p>
            <p className="flex items-center gap-2"><Check className="text-primary h-3" /> Custom currency pairs</p>
            <p className="flex items-center gap-2"><Check className="text-primary h-3" /> Private relay infra</p>
            <p className="flex items-center gap-2"><Check className="text-primary h-3" /> SLA guarantees</p>
          </div>
          <footer className="p-5 ">
            <Button variant='outline' className="uppercase font-mono w-full">Contact us</Button>
          </footer>
        </div>
      </div>
    </div>
  </section>
);

export default PricingTiers;
