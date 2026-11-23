import PageShell from "@/components/PageShell";
import { SectionHead } from "@/components/SectionHead";

const sections = [
  {
    h: "The service",
    p: "PriceStr publishes cryptographically signed Bitcoin price data as Nostr events (kind 30078) on the relay at wss://relay.pricestr.xyz and on public relays. The service is free and provided as-is.",
  },
  {
    h: "No warranty",
    p: "PriceStr is provided \"as is\", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and non-infringement. The feed is an aggregate of third-party market data and may be delayed, incorrect, or unavailable. Do not rely on it as your sole source of truth for financial decisions.",
  },
  {
    h: "Not financial advice",
    p: "Nothing published by PriceStr constitutes financial, investment, or trading advice. Prices are aggregated references, not executable quotes.",
  },
  {
    h: "Acceptable use",
    p: "You may use, redistribute, and re-publish the signed events freely. You may not misrepresent PriceStr data as your own signed data, or attempt to disrupt the relay infrastructure.",
  },
  {
    h: "Limitation of liability",
    p: "In no event shall HexQuarter be liable for any claim, damages, or other liability arising from, out of, or in connection with the service or its use.",
  },
  {
    h: "Contact",
    p: "Questions about these terms: pricestr@hexquarter.com",
  },
];

const Terms = () => (
  <PageShell>
    <div className="max-w-3xl mx-auto px-6 flex flex-col gap-12">
      <SectionHead
        eyebrow="Legal"
        title={
          <>
            Terms of <br />
            <span className="text-violet-400">use</span>
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

export default Terms;
