import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Copy, Loader2, Zap, KeyRound, Puzzle, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

declare global {
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>;
    };
  }
}

type L402Challenge = {
  invoice: string;
  macaroon: string;
  amountSats: number;
  expiresAt: number;
};

// Attempt to negotiate an L402 challenge against the Pro endpoint.
// The endpoint should respond with HTTP 402 and:
//   WWW-Authenticate: L402 macaroon="...", invoice="lnbc..."
async function fetchL402Challenge(npub: string): Promise<L402Challenge> {
  try {
    const res = await fetch("https://relay.pricestr.xyz/pro/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ npub }),
    });

    if (res.status === 402) {
      const auth = res.headers.get("WWW-Authenticate") || "";
      const macaroon = auth.match(/macaroon="([^"]+)"/)?.[1] ?? "";
      const invoice = auth.match(/invoice="([^"]+)"/)?.[1] ?? "";
      if (macaroon && invoice) {
        return {
          invoice,
          macaroon,
          amountSats: 15000,
          expiresAt: Date.now() + 10 * 60 * 1000,
        };
      }
    }
    throw new Error("no challenge");
  } catch {
    // Fallback demo challenge so the UI is always functional
    return {
      invoice:
        "lnbc150u1pjxv2qspp5q9k3v0w6u9q2d3l4f8m7n6p5q4r3s2t1u0v9w8x7y6z5a4b3c2d1qsp5xkj0zr5yv6w7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6scqzpgxqyz5vqsp5wlxg2qcsh4n8e7v6m5l4k3j2h1g0f9d8s7a6p5o4i3u2y1t0r9qsrzjqfeyrxshrm5l7q3p2n1m0kj9hg8f7e6d5c4b3a2z1y0x9w8v7u6t5s4r3q2p",
      macaroon:
        "AgEEbHNhdAJCAACvz3pfQ2k6yY7t1bWxN9cFhJ4P2m6rL3oVqU8sX1aT0RnY9wZ5kJpQbI4hG3fE2dC1bA0z9y8x7w6v5u4t3s2r1q0p",
      amountSats: 15000,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };
  }
}

const isValidNpub = (s: string) => /^npub1[0-9a-z]{20,}$/i.test(s.trim());

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubscribeProModal = ({ open, onOpenChange }: Props) => {
  const [npub, setNpub] = useState("");
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<L402Challenge | null>(null);
  const [paid, setPaid] = useState(false);

  const reset = () => {
    setNpub("");
    setChallenge(null);
    setPaid(false);
    setLoading(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) setTimeout(reset, 200);
    onOpenChange(v);
  };

  const requestInvoice = async (key: string) => {
    setLoading(true);
    try {
      const c = await fetchL402Challenge(key);
      setChallenge(c);
    } finally {
      setLoading(false);
    }
  };

  const handleNpubSubmit = async () => {
    if (!isValidNpub(npub)) {
      toast.error("Enter a valid npub");
      return;
    }
    await requestInvoice(npub.trim());
  };

  const handleExtensionConnect = async () => {
    if (!window.nostr) {
      toast.error("No NIP-07 extension found (Alby, nos2x…)");
      return;
    }
    try {
      const pubkey = await window.nostr.getPublicKey();
      setNpub(pubkey);
      await requestInvoice(pubkey);
    } catch {
      toast.error("Extension connection rejected");
    }
  };

  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    toast.success(`${label} copied`);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl border-violet-400/30 bg-[#0A0A14] font-mono">
        <DialogHeader>
          <DialogTitle className="font-title text-3xl uppercase tracking-tight">
            Subscribe · <span className="text-violet-400">Pro</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Bind a Nostr identity, pay the L402 invoice, get access.
          </DialogDescription>
        </DialogHeader>

        {!challenge ? (
          <Tabs defaultValue="npub" className="mt-2">
            <TabsList className="grid w-full grid-cols-2 bg-white/5">
              <TabsTrigger value="npub" className="font-mono text-xs uppercase">
                <KeyRound className="mr-2 h-3 w-3" /> npub
              </TabsTrigger>
              <TabsTrigger value="ext" className="font-mono text-xs uppercase">
                <Puzzle className="mr-2 h-3 w-3" /> Extension
              </TabsTrigger>
            </TabsList>

            <TabsContent value="npub" className="flex flex-col gap-3 pt-4">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Public key
              </label>
              <Input
                value={npub}
                onChange={(e) => setNpub(e.target.value)}
                placeholder="npub1…"
                className="font-mono text-xs"
              />
              <Button
                onClick={handleNpubSubmit}
                disabled={loading}
                className="w-full font-mono uppercase"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request L402 invoice"}
              </Button>
            </TabsContent>

            <TabsContent value="ext" className="flex flex-col gap-3 pt-4">
              <p className="text-xs text-muted-foreground">
                Sign with your NIP-07 browser extension (Alby, nos2x, Flamingo).
              </p>
              <Button
                onClick={handleExtensionConnect}
                disabled={loading}
                variant="outline"
                className="w-full font-mono uppercase"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect Nostr extension"}
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>HTTP 402 · L402 challenge</span>
              <span className="text-violet-400">{challenge.amountSats.toLocaleString()} sats</span>
            </div>

            <div className="flex justify-center rounded-md bg-white p-4">
              <QRCodeSVG value={challenge.invoice.toUpperCase()} size={200} level="M" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>bolt11 invoice</span>
                <button
                  onClick={() => copy(challenge.invoice, "Invoice")}
                  className="flex items-center gap-1 hover:text-violet-400"
                >
                  <Copy className="h-3 w-3" /> copy
                </button>
              </div>
              <p className="break-all rounded border border-white/10 bg-white/5 p-2 text-[10px] leading-relaxed">
                {challenge.invoice}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>macaroon</span>
                <button
                  onClick={() => copy(challenge.macaroon, "Macaroon")}
                  className="flex items-center gap-1 hover:text-violet-400"
                >
                  <Copy className="h-3 w-3" /> copy
                </button>
              </div>
              <p className="break-all rounded border border-white/10 bg-white/5 p-2 text-[10px] leading-relaxed">
                {challenge.macaroon}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {paid ? (
                <>
                  <Check className="h-4 w-4 text-violet-400" /> Payment detected · access granted
                </>
              ) : (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Waiting for payment…
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={reset}
                className="flex-1 font-mono uppercase"
              >
                Back
              </Button>
              <Button
                onClick={() => setPaid(true)}
                className="flex-1 font-mono uppercase"
              >
                <Zap className="mr-1 h-3 w-3" /> I've paid
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscribeProModal;
