import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { SectionHead } from "../components/SectionHead";
import { CodeBlock } from "../components/CodeBlock";
import PageShell from "@/components/PageShell";
import { useRelay } from "@/hooks/use-relay";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const subscribeSnippet = `// npm install nostr-tools
import { Relay } from 'nostr-tools';

const relay = await Relay.connect('wss://relay.pricestr.xyz');

relay.subscribe([{
  "#t": ['pricestr']
}], {
  onevent(event) {
    console.log(event.content);
  }
});`;

const verifySnippet = `import { SimplePool, verifyEvent, getEventHash } from 'nostr-tools';

const pool = new SimplePool();
const event = await pool.get(['wss://relay.pricestr.xyz'], {
  kinds: [30078],
  "#t": ['pricestr'],
  limit: 1,
});

// Two local checks: payload integrity + signature
getEventHash(event) === event.id && verifyEvent(event);`;

const parseSnippet = `const price = JSON.parse(event.content);
// {
//   timestamp: 1714823944000,
//   median: 70040,
//   sources: { binance: 70041, coinbase: 70038, kraken: 70044, ... }
// }
console.log(price.median);`;

const steps = [
  {
    n: "01",
    title: "Install nostr-tools",
    body: "Any Nostr library works. The examples below use nostr-tools for JavaScript and TypeScript; ports exist for Rust, Go, Python, Swift and Kotlin.",
    code: <CodeBlock title="shell" code="npm install nostr-tools" lang="bash" />,
  },
  {
    n: "02",
    title: "Subscribe to the relay",
    body: "Connect to the relay and filter on the pricestr tag. You receive a signed kind-30078 replaceable event every 10 seconds.",
    code: <CodeBlock title="subscribe.ts" code={subscribeSnippet} lang="ts" />,
  },
  {
    n: "03",
    title: "Verify the signature",
    body: "Check that the event is signed by PriceStr's published pubkey. verifyEvent returns true only if the Schnorr signature matches the payload — the relay cannot forge it.",
    code: <CodeBlock title="verify.ts" code={verifySnippet} lang="ts" />,
  },
  {
    n: "04",
    title: "Parse the price",
    body: "The content is a JSON payload with the median price and every source it was computed from.",
    code: <CodeBlock title="parse.ts" code={parseSnippet} lang="ts" />,
  },
];

const facts = [
  ["Event kind", "30078 — replaceable parameterized event"],
  ["Filter tag", "#t: pricestr"],
  ["Cadence", "New event every 10 seconds"],
  ["Content", "JSON: timestamp, median, sources"],
  ["Transport", "Any Nostr relay carrying the events"],
  ["Verification", "verifyEvent(event) — local, no network"],
];

const Docs = () => {
  const { relay } = useRelay();
  const [relayPub, setRelayPubState] = useState("");
  const [copied, setCopied] = useState("");
  const [relayOnline, setRelayOnline] = useState(true);

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
    toast.info("Copied to clipboard");
  };

  useEffect(() => {
    if (!relay) {
      const t = setTimeout(() => setRelayOnline(false), 3000);
      return () => clearTimeout(t);
    }
    relay
      .info()
      .then((info) => setRelayPubState(info.pubkey))
      .catch(() => setRelayOnline(false));
  }, [relay]);

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-16">
        <SectionHead
          eyebrow="Docs"
          title={
            <>
              Start in <br />
              <span className="text-violet-400">minutes</span>
            </>
          }
          lead="Everything you need is a relay URL and a public key. Subscribe, verify, parse — no API key, no account, no backend."
        />

        {/* Endpoints */}
        <div className="grid md:grid-cols-2 gap-px bg-border/40 border border-border/40">
          <div className="bg-background p-6 flex flex-col gap-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Relay endpoint</p>
            <div className="flex items-center justify-between border border-border/60 bg-card/40 px-4 py-3">
              <code className="text-xs font-mono">wss://relay.pricestr.xyz</code>
              <button onClick={() => handleCopy("wss://relay.pricestr.xyz", "endpoint")} className="text-muted-foreground hover:text-foreground" aria-label="Copy endpoint">
                {copied === "endpoint" ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="bg-background p-6 flex flex-col gap-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Signer public key</p>
            <div className="flex items-start justify-between gap-3 border border-border/60 bg-card/40 px-4 py-3">
              <code className="text-xs font-mono break-all leading-relaxed">
                {relayPub || (relayOnline ? "loading…" : "unavailable — relay offline")}
              </code>
              <button onClick={() => handleCopy(relayPub, "pubkey")} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5" aria-label="Copy pubkey">
                {copied === "pubkey" ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-16">
          {steps.map((s) => (
            <div key={s.n} className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 flex flex-col gap-3">
                <p className="text-5xl tracking-tight font-[900] font-title uppercase text-white/10">{s.n}</p>
                <h3 className="tracking-tight font-[900] font-title uppercase text-2xl">{s.title}</h3>
                <p className="text-sm font-mono text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
              <div className="lg:col-span-8">{s.code}</div>
            </div>
          ))}
        </div>

        {/* Reference */}
        <div className="flex flex-col gap-6">
          <h3 className="tracking-tight font-[900] font-title uppercase text-2xl">Event reference</h3>
          <div className="border border-border/40 divide-y divide-border/40">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 px-5 py-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground pt-0.5">{k}</span>
                <span className="md:col-span-2 text-xs font-mono text-foreground/90">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <div className="border border-border/40 bg-card/20 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-primary">// next steps</p>
            <p className="text-sm font-mono text-muted-foreground leading-relaxed">
              Questions about the protocol, the trust model, or self-hosting the pipeline?
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/#verify"
              className="border border-border/60 px-5 py-2.5 text-[11px] font-mono uppercase tracking-widest hover:bg-card transition-colors"
            >
              Try the live verifier
            </Link>
            <Link
              to="/#faq"
              className="border border-border/60 px-5 py-2.5 text-[11px] font-mono uppercase tracking-widest hover:bg-card transition-colors"
            >
              Read the FAQ
            </Link>
            <a
              href="https://github.com/hexquarter/pricestr"
              target="_blank"
              rel="noreferrer"
              className="border border-border/60 px-5 py-2.5 text-[11px] font-mono uppercase tracking-widest hover:bg-card transition-colors"
            >
              Source on GitHub
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Docs;
