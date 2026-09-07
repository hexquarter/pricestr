import { Link } from "react-router-dom";
import { Zap, Handshake, ArrowRight, Github, Share2 } from "lucide-react";
import { SectionHead } from "./SectionHead";
import { LightningAddressCopy, ZapButton } from "./ZapButton";
import { Button } from "./ui/button";
import { toast } from "sonner";

const GITHUB_URL = "https://github.com/hexquarter/pricestr";

const handleShare = async () => {
  const url = "https://pricestr.xyz";
  if (navigator.share) {
    try {
      await navigator.share({ title: "PriceStr", url });
      return;
    } catch {
      /* user cancelled */
    }
  }
  navigator.clipboard.writeText(url);
  toast.info("Link copied — share it with a builder");
};

const StaysFree = () => (
  <section id="stays-free" className="scroll-mt-24">
    <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
      <SectionHead
        eyebrow="Funding"
        title={
          <>
            How PriceStr stays free <br />
            — and <span className="text-violet-400">always will</span>
          </>
        }
        lead="PriceStr is 100% free to use. We fund the service through two transparent channels."
      />

      <div className="grid md:grid-cols-2 gap-px bg-border/40 border border-border/40">
        <div className="bg-background p-8 flex flex-col gap-5">
          <Zap className="h-5 w-5 text-violet-400" />
          <h3 className="font-title uppercase tracking-tight text-3xl font-[900] leading-tight">
            Community support
          </h3>
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            If PriceStr saves you time or makes your dApp better, consider sending a zap. Every
            satoshi helps cover our server costs.
          </p>
          <div className="pt-1">
            <div className="flex flex-col justify-between gap-5">
              <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                No paywall, no gated tier, no upsell. <br />If the feed is useful to you, the best thing you
                can do is zap it, star it, or send it to someone building on Nostr.
              </p>
              <LightningAddressCopy />
              <div className="grid lg:grid-cols-3 gap-2">
                <ZapButton label="Support" amountSats={1000} />
                <Button
                  asChild
                  variant="outline"
                  className="font-mono uppercase tracking-widest text-[11px] h-11 px-6"
                >
                  <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                    <Github className="h-3.5 w-3.5 mr-2" /> Star on GitHub
                  </a>
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="font-mono uppercase tracking-widest text-[11px] h-11 px-6"
                >
                  <Share2 className="h-3.5 w-3.5 mr-2" /> Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background p-8 flex flex-col gap-5">
          <Handshake className="h-5 w-5 text-violet-400" />
          <h3 className="font-title uppercase tracking-tight text-3xl font-[900] leading-tight">
            Affiliate recommendations
          </h3>
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">Coming soon...</p>
          {/* <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            We only recommend tools we genuinely use and trust. When you sign up through our links,
            we may earn a small commission at no extra cost to you. This helps keep the lights on.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {["Lovable", "Alby", "Cloudflare"].map((p) => (
              <span
                key={p}
                className="py-1.5 px-3 text-[10px] font-mono uppercase tracking-widest rounded-full border border-border/60 text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  </section>
);

export default StaysFree;
