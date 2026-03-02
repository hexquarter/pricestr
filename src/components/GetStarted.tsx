import { useState } from "react";
import { Copy, Check } from "lucide-react";

const PUBKEY = "npub1sigr4te7f8wq3kx8ahj29vm5ndcl4pz6y20fw0ghst7e5j8mplqx8q2k";
const NPM_CMD = "npm install @sigrate/sdk";

const GetStarted = () => (
  <section id="get-started" className="py-24 md:py-32">
    <div className="max-w-4xl mx-auto px-6">
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-16 text-center">
        Get started
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-lg border border-border bg-card p-8">
          <h3 className="text-sm font-semibold mb-1">Subscribe via Nostr</h3>
          <p className="text-xs text-muted-foreground mb-5">Follow the Sigrate pubkey on any Nostr client.</p>
          <CopyField value={PUBKEY} />
        </div>
        <div className="rounded-lg border border-border bg-card p-8">
          <h3 className="text-sm font-semibold mb-1">Use the SDK</h3>
          <p className="text-xs text-muted-foreground mb-5">Install the JavaScript SDK and start querying.</p>
          <CopyField value={NPM_CMD} />
        </div>
      </div>
    </div>
  </section>
);

const CopyField = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 rounded-md bg-code-bg border border-border px-4 py-3">
      <code className="font-mono text-xs text-foreground flex-1 overflow-x-auto whitespace-nowrap">
        {value}
      </code>
      <button
        onClick={handleCopy}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Copy to clipboard"
      >
        {copied ? <Check className="w-4 h-4 text-verified" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default GetStarted;
