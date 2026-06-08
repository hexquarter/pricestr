import { useEffect, useState } from "react";
import { usePostHog } from "@posthog/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Copy, Loader2, KeyRound, Puzzle, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { hexToBytes } from "nostr-tools/utils";
import { bech32 } from "bech32";
import { useRelay } from "@/hooks/use-relay";
import { EventTemplate, generateSecretKey, getPublicKey, nip19, VerifiedEvent } from "nostr-tools";
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

const PAYMENT_LINK = import.meta.env.DEV ? 'https://buy.stripe.com/test_7sY28q49k67W5A11RrfMA00' : 'https://buy.stripe.com/4gM14meNYeEs9Qh53DfMA02'

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
  const navigate = useNavigate()
  const posthog = usePostHog()
  const [active, setActive] = useState(false)

  const [identityNsec, setIdentityNsec] = useState("")
  const endpoint = import.meta.env.DEV ? 'http://localhost:7777' : 'https://relay.pricestr.xyz'

  const reset = () => {
    if (!renew) {
      setNpub("");
      setNpubInput("")
    }
    setActive(false)
    setLoading(false);
    setErrorNpub("")
  };

  const handleClose = (v: boolean) => {
    if (!v) setTimeout(reset, 200);
    onOpenChange(v);
  };

  const handleChangeNpub = async (npub: string) => {
    setErrorNpub("")
    setNpubInput(npub)
    setTimeout(() => {
      if (npub != '' && !isValidNpub(npub)) {
        setErrorNpub("Enter a valid npub");
        return;
      }

      posthog?.identify(npub, { npub });
      posthog?.capture("subscription_payment_started", {
        npub,
        mode: 'input',
      });

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

      posthog?.identify(npub, { npub });
      posthog?.capture("subscription_payment_started", {
        npub,
        mode: 'extension',
      });

      setNpub(npub);
    } catch {
      toast.error("Extension connection rejected");
    }
  };

  useEffect(() => {
    if (!npub) return
    fetch(`${endpoint}/subscription/${npub}`)
      .then(async (r) => {
        if (!r.ok) {
          return
        }
        const { active } = await r.json()
        setActive(active)
      })
      .catch(console.error)
  }, [npub])

  const genIdentity = () => {
    const sk = generateSecretKey()
    const pk = getPublicKey(sk)

    let nsec = nip19.nsecEncode(sk)
    let npub = nip19.npubEncode(pk)

    setIdentityNsec(nsec)
    setNpubInput(npub)
    setNpub(npub)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl border-violet-400/30 bg-[#0A0A14] font-mono max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="font-title text-3xl uppercase tracking-tight">
            Subscribe · <span className="text-violet-400">Pro</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            <span>Bind a Nostr identity, pay the invoice, get access.</span>
          </DialogDescription>
        </DialogHeader>
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

            {!identityNsec && <p className="text-xs text-center mt-5">Don't have a Nostr identity ?, <a className='text-primary hover:underline cursor-pointer' onClick={() => genIdentity()}>you can create one instantly.</a></p>}
            {identityNsec && <p className="text-xs text-center mt-5 text-muted-foreground">Here your nsec: <span className="text-white">{identityNsec}</span>, please keep it secure, as it is your identity.</p>}

          </TabsContent>


          <TabsContent value="ext" className="flex flex-col gap-3 pt-4">

            {!npub &&
              <>
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
              </>
            }
            {npub &&
              <p className="text-xs text-muted-foreground text-center p-2 border border-border">Subscribe for: {npub}</p>
            }
          </TabsContent>
        </Tabs>

        {active && <p className="text-xs">Your account is already an active subscription. <a href='/dashboard' className="text-primary hover:underline">Access your dashboard direclty</a></p>}
        {!active && <Button onClick={() => window.open(`${PAYMENT_LINK}?client_reference_id=${npub}`)} disabled={!npub || loading}>Pay</Button>}
      </DialogContent>
    </Dialog>
  );
};

export default SubscribeProModal;
