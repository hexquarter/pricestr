import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Zap, ShieldCheck, Network, Code2, Webhook, KeyRound, Radio } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

type Section = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const toc: Section[] = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "why-nostr", label: "Why Nostr", icon: Radio },
  { id: "protocol", label: "Protocol", icon: Network },
  { id: "event-schema", label: "Event schema", icon: Code2 },
  { id: "verification", label: "Verification", icon: ShieldCheck },
  { id: "free-tier", label: "Free tier", icon: Zap },
  { id: "pro-tier", label: "Pro tier", icon: KeyRound },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "faq", label: "FAQ", icon: BookOpen },
];

const Code: React.FC<{ children: React.ReactNode; lang?: string }> = ({ children, lang = "ts" }) => (
  <div className="border border-border/40 bg-[#0A0A0A] my-4">
    <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
      <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">{lang}</span>
    </div>
    <pre className="p-5 overflow-x-auto text-xs leading-[1.7] text-white/80 font-mono">
      <code>{children}</code>
    </pre>
  </div>
);

const Block: React.FC<{ id: string; eyebrow: string; title: string; children: React.ReactNode }> = ({
  id,
  eyebrow,
  title,
  children,
}) => (
  <section id={id} className="scroll-mt-28 flex flex-col gap-5">
    <div className="flex justify-between text-[10px] text-primary uppercase font-mono tracking-widest border-b border-t border-border/40 py-2">
      <span>// {eyebrow}</span>
      <span className="text-muted-foreground/60">§ {id}</span>
    </div>
    <h2 className="text-3xl md:text-5xl tracking-tight font-[900] font-title uppercase leading-[0.95]">
      {title}
    </h2>
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground font-mono max-w-3xl">
      {children}
    </div>
  </section>
);

const Docs = () => (
  <main className="min-h-screen bg-background text-foreground">
    <NavBar />

    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground mb-10"
        >
          <ArrowLeft className="h-3 w-3" /> Back to home
        </Link>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* TOC */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24 flex flex-col gap-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-3">
                // contents
              </p>
              <nav className="flex flex-col">
                {toc.map((t) => {
                  const Icon = t.icon;
                  return (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className="group flex items-center gap-3 py-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon className="h-3 w-3 opacity-50 group-hover:opacity-100 group-hover:text-violet-400" />
                      {t.label}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Body */}
          <article className="lg:col-span-9 flex flex-col gap-20">
            <header className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 self-start text-[10px] font-mono uppercase tracking-widest text-muted-foreground border border-border/60 rounded-full px-3 py-1">
                <BookOpen className="h-3 w-3" /> Documentation · v1
              </div>
              <h1 className="text-5xl md:text-7xl tracking-tight font-[900] font-title uppercase leading-[0.9]">
                The <span className="text-violet-400">PriceStr</span> protocol
              </h1>
              <p className="text-lg text-foreground/80 font-light max-w-2xl leading-relaxed">
                A complete reference for integrating the signed Bitcoin price feed —
                from event schema and verification to authenticated relays and webhook delivery.
              </p>
            </header>

            <Block id="overview" eyebrow="01 · overview" title="What is PriceStr?">
              <p>
                PriceStr is a public price oracle for Bitcoin built natively on the Nostr protocol.
                It aggregates real-time exchange data from Binance, Kraken and Coinbase, computes a
                tamper-resistant median, signs the result with a dedicated Nostr keypair, and
                broadcasts the event to the open relay network.
              </p>
              <p>
                Any application — web, mobile, server-side, or on-chain — can subscribe to the feed
                with a few lines of code. There are no API keys, no databases, and no proprietary
                SDKs. The signature is the contract.
              </p>
              <ul className="list-none flex flex-col gap-2 pl-0">
                <li>· <span className="text-foreground">Verifiable</span> — every event carries a Schnorr signature bound to PriceStr's public key.</li>
                <li>· <span className="text-foreground">Decentralized</span> — fetch from any relay storing the events. Relays cannot forge prices.</li>
                <li>· <span className="text-foreground">Open</span> — aggregation logic, schema, and verification examples are MIT-licensed.</li>
                <li>· <span className="text-foreground">Lightning-native</span> — the Pro tier is paid in sats; no card, no account.</li>
              </ul>
            </Block>

            <Block id="why-nostr" eyebrow="02 · rationale" title="Why Nostr, not an HTTP API?">
              <p>
                Traditional price APIs trade trust for convenience: you receive raw JSON and must
                trust the provider that nothing was rewritten in transit, in their cache, or behind
                their CDN. Even a TLS-secured response only proves you talked to the server — not
                that the server told you the truth.
              </p>
              <p>
                Nostr inverts this model. Each price event is a self-contained, signed object. The
                signature is computed once at the source and travels with the data. Whether the
                event reaches you through our relay, a community relay, or is replayed from a peer
                cache an hour later, you can verify it locally in microseconds.
              </p>
              <p>
                That property — <span className="text-foreground">portable, offline-verifiable
                truth</span> — is what makes Nostr the right transport for an oracle.
              </p>
            </Block>

            <Block id="protocol" eyebrow="03 · protocol" title="How the pipeline works">
              <p>
                Every cycle (60 seconds on the free tier, 10 seconds on Pro) the pipeline executes
                four discrete steps:
              </p>
              <ol className="list-none flex flex-col gap-3 pl-0 counter-reset">
                <li>
                  <span className="text-violet-400 font-bold">01 ·</span>{" "}
                  <span className="text-foreground">Fetch</span> — parallel REST calls to each
                  exchange's spot ticker endpoint, with strict timeouts and stale-tick rejection.
                </li>
                <li>
                  <span className="text-violet-400 font-bold">02 ·</span>{" "}
                  <span className="text-foreground">Aggregate</span> — outliers are discarded and a
                  median is computed across surviving sources. Source contributions are preserved
                  in the event payload for full transparency.
                </li>
                <li>
                  <span className="text-violet-400 font-bold">03 ·</span>{" "}
                  <span className="text-foreground">Sign</span> — the event is finalized on an
                  isolated signer that holds the private key in memory only. The signer is
                  network-isolated from the aggregator.
                </li>
                <li>
                  <span className="text-violet-400 font-bold">04 ·</span>{" "}
                  <span className="text-foreground">Broadcast</span> — the signed event is published
                  to PriceStr's primary relay and mirrored to selected public relays. Subscribers
                  receive it within the same second.
                </li>
              </ol>
            </Block>

            <Block id="event-schema" eyebrow="04 · schema" title="Event schema (kind 30078)">
              <p>
                PriceStr uses{" "}
                <span className="text-foreground">NIP-78 (kind 30078)</span> — application-specific
                replaceable events. Each event is uniquely addressable by its <code>d</code> tag
                and includes machine-readable metadata in its tag set.
              </p>
              <Code lang="event.json">{`{
  "kind": 30078,
  "pubkey": "7f9da3c2…1b",
  "created_at": 1714823944,
  "tags": [
    ["sources", "kraken,binance,coinbase"],
    ["method",  "median"],
    ["currency","USD"],
    ["tier",    "free"],
    ["d",       "pricestr/free/1714823944"],
    ["t",       "pricestr/free"]
  ],
  "content": "{\\"aggregate\\":70040,\\"sources\\":{...}}",
  "sig": "a8f31c9e…04"
}`}</Code>
              <p>
                The <code>content</code> field is a JSON-encoded payload with the aggregate price
                and a per-source breakdown. Tags expose the same fields as indexable keys so relays
                can filter efficiently.
              </p>
            </Block>

            <Block id="verification" eyebrow="05 · verification" title="Verifying an event">
              <p>
                Verification is one function call in any Nostr library. There is no separate
                handshake, no nonce, no clock dependency.
              </p>
              <Code lang="verify.ts">{`import { verifyEvent } from 'nostr-tools';

const ok = verifyEvent(event);
if (!ok) throw new Error('Tampered or forged event');

// Optional: ensure the event was signed by PriceStr
if (event.pubkey !== PRICESTR_PUBKEY) throw new Error('Wrong signer');

const { aggregate } = JSON.parse(event.content);
console.log('BTC/USD =', aggregate);`}</Code>
              <p>
                Always check the <code>pubkey</code> matches PriceStr's published key. A valid
                signature only proves <em>some</em> key signed the event — pinning the expected
                key prevents spoofing by a malicious relay operator.
              </p>
            </Block>

            <Block id="free-tier" eyebrow="06 · free tier" title="Using the free feed">
              <p>
                The free tier is anonymous, unauthenticated, and rate-limit-free for normal use.
                Connect to any public relay carrying PriceStr events and subscribe to kind 30078
                with the appropriate filter.
              </p>
              <Code lang="subscribe.ts">{`import { Relay } from 'nostr-tools';

const relay = await Relay.connect('wss://relay.pricestr.xyz');

relay.subscribe([{
  kinds: [30078],
  "#t": ['pricestr/free']
}], {
  onevent(event) {
    const { aggregate } = JSON.parse(event.content);
    console.log('BTC/USD =', aggregate);
  }
});`}</Code>
              <p>
                The free feed updates every 60 seconds and currently exposes BTC/USD only. It is
                suitable for dashboards, wallets, status pages, and any UI that does not need
                sub-minute granularity.
              </p>
            </Block>

            <Block id="pro-tier" eyebrow="07 · pro tier" title="Pro: authenticated relay access">
              <p>
                The Pro tier delivers 10-second updates, additional currency pairs (EUR, GBP, JPY)
                and webhook delivery. Access is gated by <span className="text-foreground">NIP-42</span> —
                Nostr's native authentication scheme — so your subscription is bound to a Nostr
                keypair, not an API token.
              </p>
              <p>
                After payment, the relay grants subscription rights to any pubkey listed on the
                invoice. There are two integration paths:
              </p>
              <ul className="list-none flex flex-col gap-2 pl-0">
                <li>· <span className="text-foreground">Client-side</span> — your frontend uses a Nostr browser extension (Alby, nos2x) to sign the AUTH challenge directly.</li>
                <li>· <span className="text-foreground">Server-side</span> — a tiny worker maintains one authenticated session and re-broadcasts events to your app via your own transport.</li>
              </ul>
            </Block>

            <Block id="webhooks" eyebrow="08 · webhooks" title="Webhook delivery">
              <p>
                Pro subscribers can register up to 10,000 webhook deliveries per month. The relay
                POSTs each new price event to your endpoint as soon as it is signed, with the full
                Nostr event in the body so you can verify it independently of the transport.
              </p>
              <Code lang="POST /webhook">{`POST https://your-app.example.com/pricestr
Content-Type: application/json
X-Pricestr-Signature: <hmac-sha256(secret, body)>

{
  "event": { /* full Nostr event, kind 30078 */ },
  "delivered_at": 1714823945
}`}</Code>
              <p>
                Webhooks are managed from the Pro dashboard. Deliveries are retried with
                exponential backoff for up to 24 hours; persistent failures pause the endpoint and
                notify the subscriber.
              </p>
            </Block>

            <Block id="faq" eyebrow="09 · faq" title="Frequently asked">
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-foreground">Do I need an account to use the free feed?</p>
                  <p>No. There is no signup, no key, and no rate limiter for normal use. Just connect to a relay and subscribe.</p>
                </div>
                <div>
                  <p className="text-foreground">What happens if a relay goes down?</p>
                  <p>Connect to another. Events are signed at the source, so any relay carrying them is equivalent. The signature is the truth — not the relay.</p>
                </div>
                <div>
                  <p className="text-foreground">Can I self-host a mirror?</p>
                  <p>Yes. Run any Nostr relay implementation (strfry, nostream, khatru) and subscribe to PriceStr events from upstream. Your mirror serves the same signed events.</p>
                </div>
                <div>
                  <p className="text-foreground">How is Pro authenticated without an API key?</p>
                  <p>Via NIP-42. The relay sends a challenge; your client signs it with a Nostr key. The signature is verified against the list of paid pubkeys.</p>
                </div>
              </div>
            </Block>

            <div className="border border-border/40 p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">// next</p>
                <p className="text-2xl font-title font-[900] uppercase tracking-tight">
                  Ready to integrate?
                </p>
              </div>
              <Link
                to="/#get-started"
                className="font-mono uppercase tracking-widest text-[11px] border border-border/60 px-5 h-11 inline-flex items-center hover:bg-card/40"
              >
                Go to integration →
              </Link>
            </div>
          </article>
        </div>
      </div>
    </div>

    <Footer />
  </main>
);

export default Docs;
