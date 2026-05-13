import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { SectionHead } from "./SectionHead";
import SubscribeProModal from "./SubscribeProModal";

const tiers = [
  {
    name: "Community",
    price: "Free",
    period: "Forever",
    features: ["BTC/USD public feed", "60-second interval", "Public relays", "Community support"],
    cta: { label: "Get started", variant: "outline" as const, href: "#get-started" },
    highlight: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "/ month",
    features: ["BTC/USD + Forex rates", "10-second updates", "Webhooks (10k/month)", "Premium relay"],
    cta: { label: "Subscribe", variant: "default" as const, href: "#subscribe-pro" },
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "Contact us",
    features: ["All Pro features", "Dedicated relay endpoint", "Private relay infrastructure", "Custom pairs & SLA"],
    cta: { label: "Contact us", variant: "outline" as const, href: "mailto:hello@pricestr.xyz" },
    highlight: false,
  },
];

const PricingTiers = () => {
  const [proOpen, setProOpen] = useState(false);
  return (
    <section id="pricing" className="scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
        <SectionHead
          eyebrow="Pricing"
          title={
            <>
              Simple <br />
              <span className="text-violet-400">pricing</span>
            </>
          }
          lead="Pay in sats over Lightning. No accounts, no credit cards, no lock-in. Cancel by simply not renewing."
        />

        <div className="grid md:grid-cols-3 gap-px bg-border/40">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col bg-background ${
                t.highlight
                  ? "ring-1 ring-violet-400/60 md:-my-4 md:shadow-[0_0_60px_-15px_hsl(270_85%_70%/0.25)]"
                  : ""
              }`}
            >
              {t.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest bg-violet-400 text-background px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <header className="flex flex-col gap-3 p-6 border-b border-border/40">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {t.name}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="tracking-tight font-[300] font-title text-5xl">{t.price}</h3>
                  <span className="text-xs font-mono text-muted-foreground">{t.period}</span>
                </div>
              </header>
              <div className="flex flex-col p-6 text-xs font-mono text-muted-foreground gap-3 flex-1">
                {t.features.map((f) => (
                  <p key={f} className="flex items-center gap-3">
                    <Check className={`h-3 w-3 shrink-0 ${t.highlight ? "text-violet-400" : "text-primary"}`} />
                    {f}
                  </p>
                ))}
              </div>
              <footer className="p-6 pt-0">
                <Button
                  variant={t.cta.variant}
                  className={`uppercase font-mono w-full tracking-widest text-[11px] h-11 ${
                    t.highlight ? "bg-violet-400 hover:bg-violet-300 text-background" : ""
                  }`}
                  onClick={
                    t.name === "Pro"
                      ? () => setProOpen(true)
                      : t.name === "Enterprise"
                      ? () => (window.location.href = t.cta.href)
                      : undefined
                  }
                  asChild={t.name === "Community"}
                >
                  {t.name === "Community" ? <a href={t.cta.href}>{t.cta.label}</a> : <span>{t.cta.label}</span>}
                </Button>
              </footer>
            </div>
          ))}
        </div>
      </div>
      <SubscribeProModal open={proOpen} onOpenChange={setProOpen} />
    </section>
  );
};

export default PricingTiers;
