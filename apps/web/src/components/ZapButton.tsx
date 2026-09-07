import { useState } from "react";
import { Zap, Check, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export const LIGHTNING_ADDRESS = "pricestr@getalby.com";

interface ZapButtonProps {
  label?: string;
  amountSats?: number;
  variant?: "default" | "outline";
  className?: string;
}

/** NIP-57 style support button — opens the lightning address in the user's wallet. */
export const ZapButton: React.FC<ZapButtonProps> = ({
  label = "Zap us",
  amountSats,
  variant = "default",
  className = "",
}) => {
  const handleZap = () => {
    const uri = `lightning:${LIGHTNING_ADDRESS}${amountSats ? `?amount=${amountSats}` : ""}`;
    window.location.href = uri;
    toast.info("Opening your Lightning wallet…", {
      description: `Or send manually to ${LIGHTNING_ADDRESS}`,
    });
  };

  return (
    <Button
      onClick={handleZap}
      variant={variant}
      className={`font-mono uppercase tracking-widest text-[11px] h-11 px-8 ${
        variant === "default" ? "bg-violet-400 hover:bg-violet-300 text-background" : ""
      } ${className}`}>
      <Zap className="h-3.5 w-3.5 mr-2" />
      {label}
    </Button>
  );
};

export const LightningAddressCopy = () => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 border border-border/60 bg-card/40 p-4">
      <div className="bg-white p-2 shrink-0" aria-label={`Lightning QR code for ${LIGHTNING_ADDRESS}`}>
        <QRCodeSVG value={`lightning:${LIGHTNING_ADDRESS}`} size={128} level="M" />
      </div>
      <div className="flex flex-col justify-center gap-3 min-w-0 w-full">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Scan to send
        </p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(LIGHTNING_ADDRESS);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex items-center justify-between gap-4 border border-border/60 bg-card/40 px-4 py-3 w-full text-left hover:bg-card/70 transition-colors"
        >
          <code className="text-xs font-mono break-all">{LIGHTNING_ADDRESS}</code>
          {copied ? (
            <Check className="h-3.5 w-3.5 text-primary shrink-0" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ZapButton;
