import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { SectionHead } from "./SectionHead";
import SubscribeProModal from "./SubscribeProModal";
import { usePostHog } from "@posthog/react";

const tiers = [
  {
    name: "Community",
    price: "Free",
    period: "Forever",
    blurb: "For wallets, dashboards, status pages, and weekend builds. Same signed events as Pro — slower cadence, public transport.",
    features: ["BTC/USD public feed", "60-second interval", "Public relays", "Community support"],
    cta: { label: "Get started", variant: "outline" as const, href: "#get-started" },
    highlight: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "/ month",
    blurb: "For trading UIs, fintech products, and production workloads. Faster cadence, multi-currency, and authenticated relay access.",
    features: ["BTC/USD + forex rates", "10-second updates", "Webhooks", "NIP-42 premium relay"],
    cta: { label: "Subscribe", variant: "default" as const, href: "#subscribe-pro" },
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "Contact us",
    blurb: "For exchanges, custodians, and lending desks who need dedicated capacity, custom pairs, and a contractual SLA.",
    features: ["Everything in Pro", "Dedicated relay endpoint", "Private relay infrastructure", "Custom pairs & cadence", "99.95% uptime SLA"],
    cta: { label: "Contact us", variant: "outline" as const, href: "mailto:pricestr@hexquarter.com" },
    highlight: false,
  },
];

const PricingTiers = () => {
  const [proOpen, setProOpen] = useState(false);
  const posthog = usePostHog();
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
          lead="Pay in sats over Lightning. No accounts, no credit cards, no contracts. Your subscription is bound to a Nostr pubkey — cancel by simply not renewing."
        />

        <div className="grid md:grid-cols-3 gap-px bg-border/40">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col bg-background ${t.highlight
                ? "ring-1 ring-violet-400/60 md:-my-4 md:shadow-[0_0_60px_-15px_hsl(270_85%_70%/0.25)]"
                : ""
                }`}
            >
              {t.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest bg-violet-400 text-background px-3 py-1 rounded-full">
                  Production-ready
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
                <p className="text-xs font-mono text-muted-foreground leading-relaxed pt-1">
                  {t.blurb}
                </p>
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
                  className={`uppercase font-mono w-full tracking-widest text-[11px] h-11 ${t.highlight ? "bg-violet-400 hover:bg-violet-300 text-background" : ""
                    }`}
                  onClick={
                    t.name === "Pro"
                      ? () => { posthog?.capture("subscription_modal_opened"); setProOpen(true); }
                      : t.name === "Enterprise"
                        ? () => { posthog?.capture("enterprise_contact_clicked"); window.location.href = t.cta.href; }
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
        <div className="grid md:grid-cols-3 border border-border/40 mt-2">
          {[
            { k: "Payment", v: "Lightning · sats", sub: "Pay the BOLT11 invoice from any Lightning wallet. No fiat rails, no chargebacks." },
            { k: "Identity", v: "Nostr pubkey", sub: "Your subscription is bound to an npub — not an email, not an API token." },
            { k: "Cancellation", v: "Don't renew", sub: "There is no recurring charge. The relay simply stops granting access at expiry." },
          ].map((s, i) => (
            <div key={s.k} className={`p-6 flex flex-col gap-2 ${i > 0 ? "md:border-l border-border/40 border-t md:border-t-0" : ""}`}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.k}</p>
              <p className="font-title font-[900] uppercase tracking-tight text-xl text-foreground">{s.v}</p>
              <p className="text-xs font-mono text-muted-foreground leading-relaxed">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
      <SubscribeProModal open={proOpen} onOpenChange={setProOpen} />
    </section>
  );
};

export default PricingTiers;
