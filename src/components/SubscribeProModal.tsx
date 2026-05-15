import { useEffect, useState } from "react";
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
  const [webhooks, setWebhooks] = useState<{ id: string; url: string; createdAt?: number }[]>([])
  const [webhookInput, setWebhookInput] = useState("")
  const [webhookLoading, setWebhookLoading] = useState(false)

  const loadWebhooks = async (key: string) => {
    try {
      const r = await fetch(`${endpoint}/webhooks/${key}`)
      if (!r.ok) return
      const data = await r.json()
      setWebhooks(Array.isArray(data) ? data : (data.webhooks ?? []))
    } catch { /* ignore */ }
  }

  const registerWebhook = async () => {
    const url = webhookInput.trim()
    if (!url) return
    try { new URL(url) } catch { toast.error("Invalid URL"); return }
    if (!/^https?:\/\//.test(url)) { toast.error("URL must start with http(s)://"); return }
    setWebhookLoading(true)
    try {
      const r = await fetch(`${endpoint}/webhooks/${npub}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const created = await r.json().catch(() => ({ id: crypto.randomUUID(), url }))
      setWebhooks((prev) => [...prev, { id: created.id ?? crypto.randomUUID(), url: created.url ?? url, createdAt: Date.now() }])
      setWebhookInput("")
      toast.success("Webhook registered")
    } catch (e) {
      const err = e as Error
      toast.error(`Failed to register webhook: ${err.message}`)
    } finally {
      setWebhookLoading(false)
    }
  }

  const removeWebhook = async (id: string) => {
    const prev = webhooks
    setWebhooks((w) => w.filter((x) => x.id !== id))
    try {
      const r = await fetch(`${endpoint}/webhooks/${npub}/${id}`, { method: "DELETE" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      toast.success("Webhook removed")
    } catch (e) {
      setWebhooks(prev)
      const err = e as Error
      toast.error(`Failed to remove: ${err.message}`)
    }
  }

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
    setWebhooks([])
    setWebhookInput("")
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
          (() => {
            const expires = new Date(subscription.expiresAt);
            const daysLeft = Math.max(0, Math.ceil((subscription.expiresAt - Date.now()) / 86_400_000));
            const streaming = !!stream;
            const stopStream = () => {
              if (stream) { stream.close(); setStream(undefined); }
            };
            return (
              <div className="flex flex-col gap-5 pt-2">
                {/* Status header */}
                <div className="grid grid-cols-3 gap-px bg-white/5 border border-white/10">
                  <div className="bg-[#0A0A14] p-3 flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Status
                    </span>
                    <span className="flex items-center gap-2 text-xs text-violet-400">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inset-0 rounded-full bg-violet-400 animate-ping opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
                      </span>
                      Active
                    </span>
                  </div>
                  <div className="bg-[#0A0A14] p-3 flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Expires
                    </span>
                    <span className="text-xs text-white/90">{expires.toLocaleDateString()}</span>
                    <span className="text-[10px] text-muted-foreground">{daysLeft}d remaining</span>
                  </div>
                  <div className="bg-[#0A0A14] p-3 flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Activity className="h-3 w-3" /> Events
                    </span>
                    <span className="text-xs text-white/90">{runResult.length}</span>
                    <span className="text-[10px] text-muted-foreground">{streaming ? "streaming…" : "idle"}</span>
                  </div>
                </div>

                {/* Identity */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Identity</span>
                  <div className="flex items-center justify-between gap-2 border border-white/10 bg-white/5 px-3 py-2">
                    <code className="truncate text-[11px] text-white/80">{npub}</code>
                    <button
                      onClick={() => copy(npub, "npub")}
                      className="text-muted-foreground hover:text-violet-400 shrink-0"
                      aria-label="Copy npub"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Snippet */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Usage · Premium feed</span>
                  <div className="overflow-hidden rounded-md border border-white/10 bg-[#07070C]">
                    <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                      <span className="flex items-center gap-2 text-[10px] font-mono text-white/50">
                        <Terminal className="h-3 w-3" /> subscribe.ts
                      </span>
                      <button
                        onClick={() => copy(snippetUsage, "Snippet")}
                        className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/50 hover:text-violet-400"
                      >
                        <Copy className="h-3 w-3" /> copy
                      </button>
                    </div>
                    <pre className="overflow-x-auto p-4 text-[11px] leading-[1.7] text-white/80">
                      <code>{snippetUsage}</code>
                    </pre>
                  </div>
                </div>

                {/* Live stream */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Radio className="h-3 w-3" /> Live stream
                    </span>
                    {streaming ? (
                      <button
                        onClick={stopStream}
                        className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary"
                      >
                        <Square className="h-3 w-3" /> stop
                      </button>
                    ) : (
                      <button
                        onClick={handleRun}
                        className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-violet-400 hover:text-violet-300"
                      >
                        <PlayIcon className="h-3 w-3" /> stream prices
                      </button>
                    )}
                  </div>

                  <div className="border border-white/10 bg-[#07070C] divide-y divide-white/5 min-h-[120px]">
                    {runResult.length === 0 ? (
                      <div className="flex items-center justify-center p-8 text-[11px] font-mono text-muted-foreground">
                        {streaming ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" /> waiting for next signed event…
                          </span>
                        ) : (
                          <span>// press "stream prices" to start</span>
                        )}
                      </div>
                    ) : (
                      runResult.map((r, i) => {
                        let parsed: any = null;
                        try { parsed = JSON.parse(r.content); } catch { /* keep raw */ }
                        return (
                          <div key={r.id || i} className="flex items-start gap-3 p-3 text-[11px] font-mono hover:bg-white/[0.02]">
                            <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${i === 0 ? "bg-violet-400 animate-pulse" : "bg-white/20"}`} />
                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                                <span>{new Date(r.created_at * 1000).toLocaleTimeString()}</span>
                                <span className="text-white/30">next in 10s</span>
                              </div>
                              {parsed && typeof parsed === "object" ? (
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/85">
                                  {Object.entries(parsed).slice(0, 6).map(([k, v]) => (
                                    <span key={k}>
                                      <span className="text-violet-400/80">{k}:</span>{" "}
                                      <span className="text-white/90">
                                        {Array.isArray(v)
                                          ? v.join(", ")
                                          : typeof v === "object" && v !== null
                                            ? Object.entries(v)
                                              .map(([key, val]) => `${key}: ${val}`)
                                              .join(", ")
                                            : String(v)}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-white/85 break-all">{r.content}</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        }
      </DialogContent>
    </Dialog>
  );
};

export default SubscribeProModal;
