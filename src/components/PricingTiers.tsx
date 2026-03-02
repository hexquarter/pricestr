import { Check } from "lucide-react";

const tiers = [
  {
    name: "Community",
    price: "Free",
    description: "For hobbyists and explorers",
    features: [
      "Real-time BTC/USD feed",
      "Public relay access",
      "Signature verification",
      "Community support",
    ],
  },
  {
    name: "Professional",
    price: "€49",
    period: "/mo",
    description: "For builders shipping products",
    features: [
      "BTC/USD + BTC/EUR feeds",
      "Dedicated relay endpoints",
      "Historical data access",
      "Webhook notifications",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For institutions and exchanges",
    features: [
      "All Professional features",
      "Custom currency pairs",
      "SLA guarantees",
      "Dedicated enclave instance",
      "On-call engineering support",
    ],
  },
];

const PricingTiers = () => (
  <section className="py-24 md:py-32 bg-navy-surface border-y border-border">
    <div className="max-w-5xl mx-auto px-6">
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-16 text-center">
        Pricing
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-lg border p-8 flex flex-col ${
              tier.highlighted
                ? "border-primary/40 bg-card glow-orange"
                : "border-border bg-card"
            }`}
          >
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              {tier.name}
            </h3>
            <div className="mb-1">
              <span className="text-3xl font-bold text-primary font-mono">{tier.price}</span>
              {tier.period && (
                <span className="text-sm text-muted-foreground">{tier.period}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-8">{tier.description}</p>
            <ul className="space-y-3 flex-1">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-secondary-foreground">
                  <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingTiers;
