import { ArrowRight, Check, Copy, Github } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const GITHUB_URL = "https://github.com/hexquarter/pricestr";
const RELAY_URL = "wss://relay.pricestr.xyz";

const FinalCTA = () => {
  const [copied, setCopied] = useState(false);

  const copyRelay = () => {
    navigator.clipboard.writeText(RELAY_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.info("Relay URL copied", { description: "Point any Nostr client at it." });
  };

  return (
    <section className="relative overflow-hidden">
      {/* subtle background grid, echoes the hero */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="border border-violet-400/30 bg-violet-400/5 px-8 py-16 md:px-16 flex flex-col items-center gap-8 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-primary">
            // get started
          </p>
          <h2 className="text-4xl md:text-6xl tracking-tight font-[900] font-title uppercase leading-[0.95]">
            One relay URL. <br />
            <span className="text-violet-400">One signature.</span> Zero trust required.
          </h2>
          <p className="max-w-xl text-sm font-mono text-muted-foreground leading-relaxed">
            No API key, no sign-up, no backend. Point any Nostr client at the relay and start
            consuming a verifiable BTC price feed in under a minute.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={copyRelay} className="font-mono uppercase tracking-widest text-xs h-11 px-6">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              Copy relay URL
            </Button>
            <Button asChild variant="outline" className="font-mono uppercase tracking-widest text-xs h-11 px-6">
              <Link to="/docs">
                Read the docs<ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="font-mono uppercase tracking-widest text-xs h-11 px-6"
            >
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                <Github className="h-4 w-4 mr-2" /> Star on GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
