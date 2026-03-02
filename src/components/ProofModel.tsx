import { ArrowRight } from "lucide-react";

const steps = [
  "Exchange APIs",
  "Sigrate Enclave",
  "Signed Nostr Event",
  "Relay Network",
  "Your App",
];

const ProofModel = () => (
  <section className="py-24 md:py-32">
    <div className="max-w-5xl mx-auto px-6">
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-16 text-center">
        Proof model
      </h2>
      <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-3">
            <div className="px-5 py-3 rounded-md border border-border bg-navy-surface font-mono text-xs md:text-sm text-foreground whitespace-nowrap">
              {step}
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 rotate-90 md:rotate-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProofModel;
