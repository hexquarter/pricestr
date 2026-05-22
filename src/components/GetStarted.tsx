import { useEffect, useState } from "react";
import { Copy, Terminal, PlayIcon, Check } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { SectionHead } from "./SectionHead";
import { useRelay } from "@/hooks/use-relay";
import { Relay } from "nostr-tools";

const snippet = `import { Relay } from 'nostr-tools';

const relay = await Relay.connect('wss://relay.pricestr.xyz');

relay.subscribe([{
  kinds: [30078],
  "#t": ['pricestr/free']
}], {
  onevent(event) {
    console.log(event.content);
  }
});`;

const GetStarted = () => {
  const { relay } = useRelay();
  const [relayPub, setRelayPub] = useState("");
  const [runResult, setRunResult] = useState("");
  const [copied, setCopied] = useState<string>("");

  useEffect(() => {
    if (!relay) return;
    relay.info().then((info) => setRelayPub(info.pubkey));
  }, [relay]);

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
    toast.info("Copied to clipboard");
  };

  const handleRun = async () => {
    if (!relayPub) return;
    const r = await Relay.connect(import.meta.env.DEV ? "ws://localhost:7777" : "wss://relay.pricestr.xyz");
    r.subscribe([{ kinds: [30078], "#t": ["pricestr/free"] }], {
      onevent(event) {
        setRunResult(event.content);
      },
    });
  };

  return (
    <section id="get-started" className="scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
        <SectionHead
          eyebrow="Integration"
          title={
            <>
              Subscribe via <br />
              <span className="text-violet-400">Nostr</span>
            </>
          }
          lead="Two pieces of information are all you ever need: the relay URL and the signer's public key. Drop them into any Nostr client, in any language, and you have a live, verifiable Bitcoin price feed in production in under a minute."
        />

        <div className="grid lg:grid-cols-12 gap-px bg-border/40 border border-border/40">
          {/* Left: Pubkey + endpoint */}
          <div className="lg:col-span-5 bg-background p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Relay endpoint
              </p>
              <div className="flex items-center justify-between border border-border/60 bg-card/40 px-4 py-3">
                <code className="text-xs font-mono">wss://relay.pricestr.xyz</code>
                <button
                  onClick={() => handleCopy("wss://relay.pricestr.xyz", "endpoint")}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Copy endpoint"
                >
                  {copied === "endpoint" ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Signer public key
              </p>
              <div className="flex items-start justify-between gap-3 border border-border/60 bg-card/40 px-4 py-3">
                <code className="text-xs font-mono break-all leading-relaxed">
                  {relayPub || "loading…"}
                </code>
                <button
                  onClick={() => handleCopy(relayPub, "pubkey")}
                  className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
                  aria-label="Copy pubkey"
                >
                  {copied === "pubkey" ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Add this pubkey to your relay subscriptions. Every signed price event will appear in
              your feed. The signature is the truth — not the relay.
            </p>

            <div className="border-t border-border/40 pt-5 flex flex-col gap-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-primary">// integration notes</p>
              <ul className="flex flex-col gap-2 text-xs font-mono text-muted-foreground leading-relaxed">
                <li>· Works with <span className="text-foreground">nostr-tools</span> and any Nostr client.</li>
                <li>· Verify <span className="text-foreground">event.pubkey</span> matches the signer key above before trusting any price.</li>
              </ul>
            </div>
          </div>

          {/* Right: code */}
          <div className="lg:col-span-7 bg-[#0A0A0A] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div className="flex items-center gap-3 text-[11px] text-white/50 font-mono">
                <Terminal className="h-3.5 w-3.5" />
                price.ts
              </div>
              <button
                onClick={() => handleCopy(snippet, "snippet")}
                className="text-white/40 hover:text-white text-[11px] font-mono uppercase tracking-widest flex items-center gap-1.5"
              >
                {copied === "snippet" ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                copy
              </button>
            </div>

            <pre className="flex-1 p-6 md:p-8 overflow-x-auto text-xs leading-[1.8] text-white/80 font-mono">
              <code>{snippet}</code>
            </pre>

            <div className="border-t border-white/10 flex items-stretch">
              <Button
                onClick={handleRun}
                variant="ghost"
                className="rounded-none font-mono uppercase tracking-widest text-[11px] text-primary hover:text-primary hover:bg-primary/10 h-11 px-5"
              >
                <PlayIcon className="h-3 w-3 mr-2" /> Run live
              </Button>
              <div className={`flex-1 px-4 flex items-center text-[11px] font-mono text-white/60 truncate ${runResult ? "" : "opacity-50"}`}>
                {runResult || "// output will appear here each 60s"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetStarted;
