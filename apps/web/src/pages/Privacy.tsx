import PageShell from "@/components/PageShell";
import { SectionHead } from "@/components/SectionHead";

const sections = [
  {
    h: "What we collect",
    p: "PriceStr has no accounts, no sign-up and no user database. We collect no personal information through the relay: the relay is read-only and stores only the signed price events it publishes.",
  },
  {
    h: "Analytics",
    p: "This website uses PostHog, self-hosted in the European Union, to understand aggregate usage (page views, section interactions). No personal identifiers are attached, and no price data is sent to third parties by your visit.",
  },
  {
    h: "Nostr identity",
    p: "If you interact with the relay using a Nostr client, your pubkey is part of the Nostr protocol. We do not associate pubkeys with real-world identities.",
  },
  {
    h: "Cookies",
    p: "We do not use advertising or tracking cookies.",
  },
  {
    h: "Third-party data",
    p: "The price feed aggregates publicly available market data from exchanges and oracles. Those venues have their own policies, which apply to their data.",
  },
  {
    h: "Contact",
    p: "Questions about privacy: pricestr@hexquarter.com",
  },
];

const Privacy = () => (
  <PageShell>
    <div className="max-w-3xl mx-auto px-6 flex flex-col gap-12">
      <SectionHead
        eyebrow="Legal"
        title={
          <>
            Privacy <br />
            <span className="text-violet-400">policy</span>
          </>
        }
      />
      <div className="flex flex-col gap-8 text-sm font-mono text-muted-foreground leading-relaxed">
        {sections.map((s) => (
          <section key={s.h} className="flex flex-col gap-3">
            <h3 className="text-[11px] font-mono uppercase tracking-widest text-foreground">{s.h}</h3>
            <p>{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  </PageShell>
);

export default Privacy;
