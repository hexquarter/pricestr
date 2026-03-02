import { BarChart3, KeyRound, Radio } from "lucide-react";

const steps = [
  {
    icon: BarChart3,
    title: "Aggregated",
    description: "Median price across tier-1 exchanges — Coinbase, Kraken, Bitstamp, Binance.",
  },
  {
    icon: KeyRound,
    title: "Signed",
    description: "Every tick cryptographically signed with a Schnorr keypair. Tamper-proof by design.",
  },
  {
    icon: Radio,
    title: "Delivered",
    description: "Published as NIP-compliant events to the Nostr relay network in real time.",
  },
];

const HowItWorks = () => (
  <section className="py-24 md:py-32">
    <div className="max-w-5xl mx-auto px-6">
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-16 text-center">
        How it works
      </h2>
      <div className="grid md:grid-cols-3 gap-12 md:gap-8">
        {steps.map((step) => (
          <div key={step.title} className="text-center md:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-5">
              <step.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
