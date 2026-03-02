const WhySigrate = () => (
  <section className="py-24 md:py-32 bg-navy-surface border-y border-border">
    <div className="max-w-5xl mx-auto px-6">
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-16 text-center">
        Why Sigrate
      </h2>
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Code block */}
        <div className="rounded-lg bg-code-bg border border-border p-6 overflow-x-auto">
          <pre className="font-mono text-sm leading-relaxed">
            <span className="text-code-bracket">{"{"}</span>
            {"\n"}
            <span className="text-code-key">  "kind"</span>
            <span className="text-muted-foreground">: </span>
            <span className="text-code-value">31890</span>
            <span className="text-muted-foreground">,</span>
            {"\n"}
            <span className="text-code-key">  "pubkey"</span>
            <span className="text-muted-foreground">: </span>
            <span className="text-code-value">"a1b2c3...x8q2k"</span>
            <span className="text-muted-foreground">,</span>
            {"\n"}
            <span className="text-code-key">  "tags"</span>
            <span className="text-muted-foreground">: </span>
            <span className="text-code-bracket">[</span>
            {"\n"}
            <span className="text-code-bracket">    [</span>
            <span className="text-code-value">"pair"</span>
            <span className="text-muted-foreground">, </span>
            <span className="text-code-value">"BTC/USD"</span>
            <span className="text-code-bracket">]</span>
            <span className="text-muted-foreground">,</span>
            {"\n"}
            <span className="text-code-bracket">    [</span>
            <span className="text-code-value">"price"</span>
            <span className="text-muted-foreground">, </span>
            <span className="text-code-value">"97432.18"</span>
            <span className="text-code-bracket">]</span>
            <span className="text-muted-foreground">,</span>
            {"\n"}
            <span className="text-code-bracket">    [</span>
            <span className="text-code-value">"t"</span>
            <span className="text-muted-foreground">, </span>
            <span className="text-code-value">"1709312400"</span>
            <span className="text-code-bracket">]</span>
            {"\n"}
            <span className="text-code-bracket">  ]</span>
            <span className="text-muted-foreground">,</span>
            {"\n"}
            <span className="text-code-key">  "sig"</span>
            <span className="text-muted-foreground">: </span>
            <span className="text-code-value">"e4f8a2...9c1d"</span>
            {"\n"}
            <span className="text-code-bracket">{"}"}</span>
          </pre>
        </div>

        {/* Bullet points */}
        <div className="flex flex-col justify-center gap-8 py-4">
          <BulletPoint
            title="No trust in any relay"
            description="Signature verification happens client-side. Relays are transport, not authority."
          />
          <BulletPoint
            title="Full history on-chain"
            description="Every price tick is a permanent, queryable Nostr event. Build your own index."
          />
          <BulletPoint
            title="Verifiable by anyone with the pubkey"
            description="One key, one feed, one source of truth. No API tokens required."
          />
        </div>
      </div>
    </div>
  </section>
);

const BulletPoint = ({ title, description }: { title: string; description: string }) => (
  <div className="flex gap-4">
    <div className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
    <div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

export default WhySigrate;
