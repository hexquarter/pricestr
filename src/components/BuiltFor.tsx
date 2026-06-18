import { Wallet, Repeat, Banknote, Zap, Bot, Building2 } from "lucide-react";
import { SectionHead } from "./SectionHead";

const audiences = [
  {
    icon: Wallet,
    title: "Bitcoin wallets",
    body: "Show a fiat balance you can prove. Stop trusting CoinGecko or a centralized API key that can be revoked, rate-limited, or quietly changed.",
  },
  {
    icon: Repeat,
    title: "Nostr-native DEXes",
    body: "Quote, hedge and settle against a price feed that lives on the same protocol as your order book. One subscription, zero extra trust roots.",
  },
  {
    icon: Banknote,
    title: "Lending & credit desks",
    body: "Margin calls and liquidations against a signed, replayable price. Auditors can verify every historical print without trusting your database.",
  },
  {
    icon: Zap,
    title: "Lightning service providers",
    body: "Convert sats ↔ fiat inside LSPs, swap services and payment processors with a feed that costs $10/mo instead of an enterprise oracle contract.",
  },
  {
    icon: Bot,
    title: "Trading bots & agents",
    body: "Subscribe over WebSocket via any Nostr library. No SDK lock-in. Verify the signature inside your bot — the relay is just transport.",
  },
  {
    icon: Building2,
    title: "Custodians & PSPs",
    body: "Cryptographic audit trail by construction. Every price your back-office acted on is a signed event with a permanent ID. Compliance teams love it.",
  },
];

const BuiltFor = () => (
  <section id="built-for" className="scroll-mt-24">
    <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
      <SectionHead
        eyebrow="Built for"
        title={
          <>
            For teams whose stack is <br />
            <span className="text-violet-400">already decentralized.</span>
          </>
        }
        lead="If you ship Bitcoin or Nostr-native financial infrastructure, your price feed is the last centralized dependency in your architecture. PriceStr is the drop-in fix."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 border border-border/40">
        {audiences.map((a, i) => {
          const Icon = a.icon;
          return (
            <div
              key={a.title}
              className={`p-7 flex flex-col gap-4 ${
                i % 3 !== 0 ? "lg:border-l border-border/40" : ""
              } ${i % 2 !== 0 ? "md:border-l lg:border-l border-border/40" : ""} ${
                i >= 2 ? "lg:border-t border-border/40" : ""
              } ${i >= 2 ? "md:border-t" : ""}`}
            >
              <Icon className="h-5 w-5 text-violet-400" />
              <h3 className="font-title font-[900] uppercase tracking-tight text-xl">
                {a.title}
              </h3>
              <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                {a.body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default BuiltFor;
