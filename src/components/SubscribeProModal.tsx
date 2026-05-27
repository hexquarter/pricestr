import { useEffect, useState } from "react";
import { usePostHog } from "@posthog/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Copy, Loader2, Zap, KeyRound, Puzzle, Check, PlayIcon, Terminal, Radio, Square, Calendar, Activity, ShieldCheck, Webhook, Trash2, Plus } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { hexToBytes } from "nostr-tools/utils";
import { bech32 } from "bech32";
import { useRelay } from "@/hooks/use-relay";
import { EventTemplate, nip98, NostrEvent, Relay, VerifiedEvent } from "nostr-tools";
import { Subscription } from "nostr-tools/abstract-relay";
import { useNavigate } from "react-router-dom";
import { npubToPubkey } from "@/lib/utils";

declare global {
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>;
      signEvent(event: EventTemplate): Promise<VerifiedEvent>
    };
  }
}

type InvoiceDetails = {
  id: string,
  paymentHash: string,
  invoice: string
}

type SubscriptionPayment = {
  id: string;
  invoice: string;
  invoiceExpirationDate: Date;
  subscriptionExpirationDate: Date;
  amountSats: number;
};

const parseLightningInvoiceAmount = (invoice: string): number | undefined => {
  // Parse BOLT11 invoice to extract amount in BTC
  // Format: lnbc<amount><multiplier>...
  // Multipliers: m=milli, u=micro, n=nano, p=pico (default: satoshis)
  try {
    const match = invoice.match(/^lnbc(\d+)([munp]?)/);
    if (!match) return undefined;

    const amount = parseInt(match[1], 10);
    const sats = match[2] === 'm' ? amount * 100_000 :
      match[2] === 'u' ? amount * 100 :
        match[2] === 'n' ? amount / 10 :
          match[2] === 'p' ? amount / 100 :
            amount / 100_000_000;
    return sats
  } catch (error) {
    console.error('Failed to parse lightning invoice amount:', error);
    return undefined;
  }
}

// Attempt to negotiate an L402 challenge against the Pro endpoint.
// The endpoint should respond with HTTP 402 and:
//   WWW-Authenticate: L402 macaroon="...", invoice="lnbc..."
async function fetchInvoice(npub: string): Promise<SubscriptionPayment> {
  try {
    const endpoint = import.meta.env.DEV ? `http://localhost:7777/subscribe/${npub}` : `https://relay.pricestr.xyz/subscribe/${npub}`
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const { invoiceDetails, expireInvoiceAt, subExpiresAt } = await res.json()
    const { id, invoice } = invoiceDetails

    const amountSats = parseLightningInvoiceAmount(invoice)

    return {
      id,
      invoice,
      amountSats,
      invoiceExpirationDate: new Date(expireInvoiceAt * 1000),
      subscriptionExpirationDate: new Date(subExpiresAt * 1000)
    };
  } catch (e) {
    throw e
  }
}

const isValidNpub = (s: string) => /^npub1[0-9a-z]{20,}$/i.test(s.trim());

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renew?: boolean
  npub?: string
}

const SubscribeProModal = (props: Props) => {
  const { open, onOpenChange, renew = false } = props

  const [npubInput, setNpubInput] = useState("")
  const [errorNpub, setErrorNpub] = useState("")
  const [npub, setNpub] = useState(props.npub || '');
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<SubscriptionPayment | null>(null);
  const [paid, setPaid] = useState(false);
  const navigate = useNavigate()
  const { relay } = useRelay()
  const posthog = usePostHog()

  const endpoint = import.meta.env.DEV ? 'http://localhost:7777' : 'https://relay.pricestr.xyz'

  useEffect(() => {
    if (payment) {
      const es = new EventSource(`${endpoint}/invoice/${payment.id}/stream`);

      es.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.status === "paid") {
          setPaid(true)
          es.close();
        }
      };

      return () => es.close()
    }
  }, [payment])

  useEffect(() => {
    if (paid) {
      posthog?.identify(npub, { npub });
      posthog?.capture("subscription_payment_completed", {
        npub,
        amount_sats: payment?.amountSats,
        renew,
      });
      reset()
      sessionStorage.setItem('subscription', npub)
      navigate('/dashboard')
    }
  }, [paid])

  const reset = () => {
    if (!renew) setNpub("");
    setPayment(null);
    setPaid(false);
    setLoading(false);
    setErrorNpub("")
  };

  const handleClose = (v: boolean) => {
    if (!v) setTimeout(reset, 200);
    onOpenChange(v);
  };

  const requestInvoice = async (key: string) => {
    setLoading(true);
    try {
      const c = await fetchInvoice(key);
      setPayment(c);
      posthog?.capture("subscription_invoice_requested", {
        npub: key,
        amount_sats: c.amountSats,
        renew: renew,
      });
    } finally {
      setLoading(false);
    }
  };

  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    toast.success(`${label} copied`);
  };

  useEffect(() => {
    if (relay && open && npub) {
      setLoading(true)

      relay.getSubscription(npubToPubkey(npub)).then(async (sub) => {
        if (!renew) {
          if (sub) {
            sessionStorage.setItem('subscription', npub)
            setLoading(false)
            navigate('/dashboard')
            return
          }

          sessionStorage.removeItem('subscription')
        }
        try {
          await requestInvoice(npub);
          (false)
        }
        catch (e) {
          const error = e as Error
          toast.error(`Cannot generation invoice: ${error.message}`);
        }
        finally {
          setLoading
        }
      })
        .catch((e) => {
          setLoading(false)
          const error = e as Error
          toast.error(`Cannot check subscription: ${error.message}`);
        })
    }

  }, [open, npub, relay])

  const handleChangeNpub = async (npub: string) => {
    setErrorNpub("")
    setNpubInput(npub)
    setTimeout(() => {
      if (npub != '' && !isValidNpub(npub)) {
        setErrorNpub("Enter a valid npub");
        return;
      }
      setNpub(npub)
    }, 500)
  };

  const handleExtensionConnect = async () => {
    if (!window.nostr) {
      toast.error("No NIP-07 extension found (Alby, nos2x…)");
      return;
    }
    try {
      const pubkey = await window.nostr.getPublicKey();
      const pkBytes = hexToBytes(pubkey);
      const npub = bech32.encode('npub', bech32.toWords(pkBytes));
      setNpub(npub);
    } catch {
      toast.error("Extension connection rejected");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl border-violet-400/30 bg-[#0A0A14] font-mono max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="font-title text-3xl uppercase tracking-tight">
            {renew ? 'Renew' : <span>Subscribe · <span className="text-violet-400">Pro</span></span>}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {renew ?
              <p className="flex flex-col">
                <span>Renew your subscription.</span>
                {payment && <span>Subscription will be active until: <span className="text-primary">{payment.subscriptionExpirationDate.toLocaleString()}</span></span>}
              </p> : <p>
                <span>Bind a Nostr identity, pay the Lightnig invoice, get access.</span>
                {payment && <span>Subscription will be active until: <span className="text-primary">{payment.subscriptionExpirationDate.toLocaleDateString()}</span></span>}
              </p>}
          </DialogDescription>
        </DialogHeader>
        {loading && <span>Loading...</span>}
        {!loading && !payment &&
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
                value={npubInput}
                onChange={(e) => handleChangeNpub(e.target.value)}
                placeholder="npub1…"
                className="font-mono text-xs"
              />
              {errorNpub && <span className="text-xs text-primary">{errorNpub}</span>}
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
        }
        {!loading && payment &&
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="text-violet-400">Amount: {payment.amountSats.toLocaleString()} sats</span>
            </div>

            <div className="flex justify-center rounded-md bg-white p-4">
              <QRCodeSVG value={payment.invoice.toUpperCase()} size={200} level="M" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>bolt11 invoice</span>
                <button
                  onClick={() => copy(payment.invoice, "Invoice")}
                  className="flex items-center gap-1 hover:text-violet-400"
                >
                  <Copy className="h-3 w-3" /> copy
                </button>
              </div>
              <p className="break-all rounded border border-white/10 bg-white/5 p-2 text-[10px] leading-relaxed">
                {payment.invoice}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Payment expiration date: {payment.invoiceExpirationDate.toLocaleString()}</p>
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
            </div>
          </div>
        }
      </DialogContent>
    </Dialog>
  );
};

export default SubscribeProModal;
