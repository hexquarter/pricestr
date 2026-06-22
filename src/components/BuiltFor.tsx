import { ArrowRightLeft, Bot, ShieldCheck, Tickets, Wallet, Zap } from "lucide-react";
import ProofModel from "./ProofModel";
import { SectionHead } from "./SectionHead";

const actors = [
  {
    icon: Wallet,
    title: "Bitcoin Wallets",
    body:
      "Show a BTC/USD price your users can verify with the same pubkey they already trust. No third-party CDN, no rate-limited free tier.",
  },
  {
    icon: ArrowRightLeft,
    title: "DEXs and Swaps",
    body: "Settle quotes against a signed reference price. Median of 6 venues, replaceable event, sub-10s freshness."
  },
  {
    icon: Tickets,
    title: "Lending & credit desks",
    body: "Mark collateral and trigger liquidations on a price feed with cryptographic provenance — auditable to any counterparty."
  },
  {
    icon: Zap,
    title: "LSPs & Lightning ops",
    body: "Price channels, fees, and routing in fiat without trusting a SaaS oracle. One relay subscription, every node."
  },
  {
    icon: Bot,
    title: "Trading & MM bots",
    body: "10-second cadence, multi-source median, webhook delivery. Replace your CoinGecko cron with a Nostr subscription."
  },
  {
    icon: ShieldCheck,
    title: "Custodians & treasuries",
    body: "Mark NAV on a feed you can prove was not tampered with — at any point in time, by anyone, forever."
  }
];

const BuiltFor = () => (
  <section id="built-for" className="scroll-mt-24">
    <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
      <SectionHead
        eyebrow="Built for"
        title={
          <>
            Teams whose stack
            is already <br />
            <span className="text-violet-400">decentralized</span>
          </>
        }
        lead="If your protocol is permissionless but your price feed isn't, you have a single point of failure. PriceStr removes it."
      />

      <div className="grid md:grid-cols-3 gap-2">
        {actors.map((s, i) => (
          <div
            key={i}
            className={`p-8 flex flex-col gap-2 border border-border/80 bg-black/20`}
          >
            <s.icon className="text-violet-400"/>
            <h3 className="tracking-tight font-[900] font-title uppercase text-3xl text-white">{s.title}</h3>
            <p className="leading-relaxed text-sm font-mono text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BuiltFor;
