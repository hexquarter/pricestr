import { SectionHead } from "./SectionHead";

const proofs = [
  {
    n: "01",
    title: "Relay-agnostic truth",
    body:
      "The Schnorr signature binds the price payload to PriceStr's published public key. Any relay can deliver the event, none can rewrite it. A malicious relay operator cannot forge a price without producing a signature they do not have the key to compute.",
  },
  {
    n: "02",
    title: "Permanent, replayable history",
    body:
      "Every event is permanently addressable by its event ID. Relays store a full queryable history; subscribers can backfill from any point in time. There is no proprietary database, no admin console, no closed-source endpoint between you and the price.",
  },
  {
    n: "03",
    title: "One function call",
    body:
      "Verification is verifyEvent(event) in any Nostr library — in TypeScript, Rust, Go, Python, Swift, or Kotlin. Boolean result, no handshake, no nonce, no clock dependency. The check runs locally in microseconds, on-device or in your edge function.",
  },
];

const codeLines: { k?: string; v?: string; line: React.ReactNode; indent: number }[] = [
  { line: <span>{`{`}</span>, indent: 0 },
  { line: <><span className="text-muted-foreground">"kind"</span>: <span className="text-primary">30078</span>,</>, indent: 1 },
  { line: <><span className="text-muted-foreground">"pubkey"</span>: <span className="text-primary">"7f9da3c2…1b"</span>,</>, indent: 1 },
  { line: <><span className="text-muted-foreground">"created_at"</span>: <span className="text-primary">1714823944</span>,</>, indent: 1 },
  { line: <><span className="text-muted-foreground">"tags"</span>: [</>, indent: 1 },
  { line: <>[<span className="text-violet-400">"sources"</span>, <span className="text-primary">"kraken,binance,coinbase"</span>],</>, indent: 2 },
  { line: <>[<span className="text-violet-400">"currency"</span>, <span className="text-primary">"USD"</span>],</>, indent: 2 },
  { line: <>[<span className="text-violet-400">"tier"</span>, <span className="text-primary">"free"</span>],</>, indent: 2 },
  { line: <>[<span className="text-violet-400">"d"</span>, <span className="text-primary">"pricestr/free/1714823944"</span>],</>, indent: 2 },
  { line: <>[<span className="text-violet-400">"t"</span>, <span className="text-primary">"pricestr/free"</span>]</>, indent: 2 },
  { line: <>],</>, indent: 1 },
  { line: <><span className="text-muted-foreground">"content"</span>: <span className="text-primary">{'"{median:70040,sources:{…}}"'}</span>,</>, indent: 1 },
  { line: <><span className="text-muted-foreground">"sig"</span>: <span className="text-primary">"a8f31c9e…04"</span></>, indent: 1 },
  { line: <span>{`}`}</span>, indent: 0 },
];

const Verify = () => (
  <section id="verify" className="scroll-mt-24">
    <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
      <SectionHead
        eyebrow="Self-sovereign"
        title={
          <>
            Verify <br />
            <span className="text-violet-400">everything</span>
          </>
        }
        lead="Nothing about the price feed requires trust in PriceStr's infrastructure. The signature is computed once at the source and travels with the data — across any relay, any cache, any peer. The event itself is the proof."
      />

      <div className="grid lg:grid-cols-2 border border-border/40">
        {/* Code panel */}
        <div className="border-b lg:border-b-0 lg:border-r border-border/40 bg-card/30">
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-3">
            <span className="font-mono tracking-widest text-[10px] uppercase text-muted-foreground">
              event.json
            </span>
            <span className="font-mono tracking-widest text-[10px] uppercase text-primary">verified</span>
          </div>
          <div className="p-6 md:p-8 font-mono text-xs leading-relaxed flex">
            <div className="text-muted-foreground/40 select-none pr-4 text-right tabular-nums">
              {codeLines.map((_, i) => (
                <div key={i}>{(i + 1).toString().padStart(2, "0")}</div>
              ))}
            </div>
            <div className="flex-1 overflow-x-auto">
              {codeLines.map((l, i) => (
                <div key={i} style={{ paddingLeft: l.indent * 16 }}>
                  {l.line}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Proofs */}
        <div className="p-8 md:p-10 flex flex-col gap-8">
          <header className="flex flex-col">
            <h3 className="tracking-tight font-[900] font-title uppercase text-3xl md:text-4xl">
              No trust required.
            </h3>
            <p className="tracking-tight font-[900] font-title uppercase text-3xl md:text-4xl text-violet-400">
              Verify.
            </p>
          </header>
          <div className="flex flex-col gap-6 text-xs font-mono">
            {proofs.map((p, i) => (
              <div
                key={p.n}
                className={`flex gap-6 ${i < proofs.length - 1 ? "border-b border-border/40 pb-6" : ""}`}
              >
                <span className="text-primary tabular-nums">{p.n}</span>
                <div className="flex flex-col gap-2">
                  <p className="text-foreground font-semibold uppercase tracking-widest text-[11px]">{p.title}</p>
                  <p className="text-muted-foreground leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border/40 pt-6 mt-2 flex flex-col gap-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-primary">// bottom line</p>
            <p className="text-sm font-mono text-muted-foreground leading-relaxed">
              The price you read is the price PriceStr signed. Not the price our server returned, not the price our CDN cached, not the price our database happened to hold. The signature collapses every intermediate trust hop into one local check.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Verify;
