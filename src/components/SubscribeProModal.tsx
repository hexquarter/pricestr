import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Copy, Loader2, Zap, KeyRound, Puzzle, Check, PlayIcon, Terminal } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { hexToBytes } from "nostr-tools/utils";
import { bech32 } from "bech32";
import { useRelay } from "@/hooks/use-relay";
import { EventTemplate, NostrEvent, Relay, VerifiedEvent } from "nostr-tools";
import { Subscription } from "nostr-tools/abstract-relay";

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
  invoice: string;
  invoiceDetails: InvoiceDetails;
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

    if (res.status === 402) {
      const auth = res.headers.get("WWW-Authenticate") || "";
      // const macaroon = auth.match(/macaroon="([^"]+)"/)?.[1] ?? "";
      const invoice = auth.match(/invoice="([^"]+)"/)?.[1] ?? "";
      if (invoice) {

        const body = await res.json() as {
          macaroon: string,
          invoice: InvoiceDetails,
          amountSats: number
        }

        const amountSats = parseLightningInvoiceAmount(invoice)
        return {
          invoice,
          amountSats,
          invoiceDetails: body.invoice
        };
      }
    }

    if (res.status == 200) {
      return
    }

    throw new Error("Expected L402 endpoint");
  } catch (e) {
    throw e
  }
}

const isValidNpub = (s: string) => /^npub1[0-9a-z]{20,}$/i.test(s.trim());

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubscribeProModal = ({ open, onOpenChange }: Props) => {
  const [npubInput, setNpubInput] = useState("")
  const [errorNpub, setErrorNpub] = useState("")
  const [npub, setNpub] = useState("");
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<SubscriptionPayment | null>(null);
  const [paid, setPaid] = useState(false);
  const [subscription, setSubscription] = useState<{ active: false, expiresAt: 0 } | undefined>(undefined)
  const [stream, setStream] = useState<undefined | Subscription>(undefined)

  const { relay } = useRelay()
  const [relayPub, setRelayPub] = useState("")
  const [runResult, setRunResult] = useState<NostrEvent[]>([])

  useEffect(() => {
    if (!relay) return
    relay.info().then(info => {
      setRelayPub(info.pubkey)
    })
  }, [relay])


  const endpoint = import.meta.env.DEV ? 'http://localhost:7777' : 'https://relay.pricestr.xyz'

  const snippetUsage = `import { Relay } from 'nostr-tools';

const relay = await Relay.connect('wss://relay.pricestr.xyz');
relay.onauth = (e) => window.nostr.signEvent(e)

const subscribe = () => {
  relay.subscribe([{
    kinds: [30078],
    "#t": ['pricestr/premium'],
    limit: 1
  }], {
    onevent: console.log,
    onclose: (reason) => {
      if (reason.startsWith('auth-required')) {
        setTimeout(subscribe, 1000);
      }
    }
  });
};

subscribe();`

  useEffect(() => {
    if (!npub) return

    fetch(`${endpoint}/subscription/${npub}`)
      .then(async (r) => {
        if (!r.ok) {
          setSubscription({ active: false, expiresAt: 0 })
        }
        const { active, expiresAt } = await r.json()
        setSubscription({ active, expiresAt })
      })
  }, [npub])

  useEffect(() => {
    if (payment) {
      const es = new EventSource(`${endpoint}/invoice/${payment.invoiceDetails.id}/stream`);

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

  const reset = () => {
    setNpub("");
    setPayment(null);
    setPaid(false);
    setLoading(false);
    setRunResult([])
    setErrorNpub("")
    setSubscription(undefined)
    if (stream) {
      stream.close()
      setStream(undefined)
    }
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
    } finally {
      setLoading(false);
    }
  };

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

  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    toast.success(`${label} copied`);
  };

  useEffect(() => {
    if (npub && subscription && !subscription.active) {
      try {
        requestInvoice(npub);
      }
      catch (e) {
        const error = e as Error
        toast.error(`Cannot generation invoice: ${error.message}`);
      }
    }

  }, [subscription, npub])

  const handleRun = async () => {
    const relay = await Relay.connect(import.meta.env.DEV ? 'ws://localhost:7777' : 'wss://relay.pricestr.xyz');
    relay.onauth = (e) => window.nostr.signEvent(e)
    const sub = () => relay.subscribe([{
      kinds: [30078],
      "#t": [`pricestr/premium`],
      limit: 1
    }], {
      onclose(e) {
        if (e.startsWith('auth-required')) {
          // retry AFTER short delay to allow AUTH to complete
          setTimeout(() => {
            const s = sub()
            setStream(s)
          }, 500);
        }
      },
      onevent(event) {
        setRunResult((prev) => [event, ...prev].slice(0, 3))
      }
    });

    sub()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl border-violet-400/30 bg-[#0A0A14] font-mono max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="font-title text-3xl uppercase tracking-tight">
            Subscribe · <span className="text-violet-400">Pro</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {subscription && subscription.active ? 'You already have a current subscription' : 'Bind a Nostr identity, pay the Lightnig invoice, get access.'}
          </DialogDescription>
        </DialogHeader>
        {!subscription?.active &&
          <>
            {!payment ? (
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
            ) : (
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
            )}
          </>
        }
        {subscription?.active &&
          <>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="text-violet-400">Active until: {new Date(subscription.expiresAt).toLocaleDateString()}</span>
            </div>

            <p>Usage</p>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] uppercase text-muted-foreground text-xs">
                <button
                  onClick={() => copy(snippetUsage, "Snippet")}
                  className="flex items-center gap-1 hover:text-violet-400"
                >
                  <Copy className="h-3 w-3" /> copy
                </button>
              </div>
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
                <div className="p-4">
                  <pre className="overflow-x-auto text-xs leading-[2] text-white/80">
                    <code>{snippetUsage}</code>
                  </pre>
                </div>
                <div className="flex items-center">
                  {runResult.length == 0 && <Button onClick={handleRun}>Stream prices <PlayIcon /></Button>}
                </div>
                {runResult.map((r, i) => <div key={i} className={`flex flex-col bg-white/10 align-middle p-3 text-xs w-full border-b border-border`}>
                  <p><span className=" text-primary">Content:</span> {r.content}</p>
                  <p><span className=" text-primary">Issued at:</span> {new Date(r.created_at * 1000).toLocaleTimeString()} - Next in 10s</p>

                </div>)}
              </div>
            </div>
          </>

        }
      </DialogContent>
    </Dialog>
  );
};

export default SubscribeProModal;
