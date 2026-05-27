
import { Link } from "react-router-dom";
import { usePostHog } from "@posthog/react";
import { BookOpen, Zap, ShieldCheck, Network, Code2, Webhook, KeyRound, Radio, ChartBar, Puzzle, Loader2, Calendar, TriangleIcon, TriangleAlertIcon, ArrowRight, Trash2, Copy, PlayIcon, Square } from "lucide-react";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { nip98, NostrEvent, Relay } from "nostr-tools";
import { useRelay } from "@/hooks/use-relay";
import { hexToBytes } from "nostr-tools/utils";
import { bech32 } from "bech32";
import { Subscription } from "nostr-tools/abstract-relay";

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SubscribeProModal from "@/components/SubscribeProModal";
import { copy, npubToPubkey, shortenString } from "@/lib/utils";
import { Code } from "@/components/Code";

const endpoint = import.meta.env.DEV ? 'http://localhost:7777' : 'https://relay.pricestr.xyz'

const snippetUsage = `import { Relay } from 'nostr-tools';
const relay = await Relay.connect('wss://relay.pricestr.xyz');
relay.onauth = (e) => window.nostr.signEvent(e)

const subscribe = () => {
  relay.subscribe([{
    kinds: [30078],
    "#t": ['pricestr/pro'],
    limit: 1
  }], {
    onevent: console.log,
    onclose: (reason) => {
      if (reason.startsWith('auth-required')) {
        // retry AFTER short delay to allow AUTH to complete
        setTimeout(subscribe, 500);
      }
    }
  });
};

subscribe();`

const isValidNpub = (s: string) => /^npub1[0-9a-z]{20,}$/i.test(s.trim());

const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

function isExpiringSoon(subscription) {
  const timeLeft = subscription.expiresAt - Date.now();
  return timeLeft > 0 && timeLeft <= TEN_DAYS_MS;
}

const Dashboard = () => {
  const [npubInput, setNpubInput] = useState("")
  const [errorNpub, setErrorNpub] = useState("")
  const [npub, setNpub] = useState("");
  const [loading, setLoading] = useState(false);
  const [webhook, setWebhook] = useState<string>("")
  const [webhookInput, setWebhookInput] = useState("")
  const [webhookLoading, setWebhookLoading] = useState(false)
  const [relayPub, setRelayPub] = useState("")
  const [runResult, setRunResult] = useState<NostrEvent[]>([])

  const { relay } = useRelay()
  const posthog = usePostHog()
  const [subscription, setSubscription] = useState<{ active: boolean, expiresAt: number } | undefined>(undefined)
  const [stream, setStream] = useState<undefined | Subscription>(undefined)
  const [renewOpen, setRenewOpen] = useState(false);
  const [billingHistory, setBillingHistory] = useState<{ date: Date, period: [Date, Date], invoice: string, status: "active" | "expired" }[]>([])

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
      posthog?.identify(npub, { npub });
      posthog?.capture("dashboard_connected_extension");
    } catch {
      toast.error("Extension connection rejected");
    }
  };

  useEffect(() => {
    const npubSubscribed = sessionStorage.getItem('subscription')
    if (npubSubscribed && isValidNpub(npubSubscribed)) {
      setNpub(npubSubscribed)
    }
  }, [])

  useEffect(() => {
    if (!relay || !npub) return

    relay.getSubscription(npubToPubkey(npub)).then((sub) => {
      if (!sub) {
        sessionStorage.removeItem('subscription')
        setSubscription(undefined)
        toast.error("There is not active subscription for your public key")
        return
      }
      sessionStorage.setItem('subscription', npub)
      setSubscription({ active: true, expiresAt: sub.expiresAt })
      if (sub.webhookUrl) {
        setWebhook(sub.webhookUrl)
      }

      relay.getBillingHistory(npubToPubkey(npub)).then(history => {
        setBillingHistory(history.map(h => {
          return {
            date: new Date(h.from * 1000),
            period: [
              new Date(h.from * 1000),
              new Date(h.to * 1000)
            ],
            invoice: h.invoice,
            status: Date.now() < h.to * 1000 ? 'active' : 'expired'
          }
        }))
      })
    })
      .catch(() => {
        toast.error("We cannot retrieve subscription data. Please to retry later. If the problem persist, you can contact pricestr@hexquarter.com");
      })
  }, [relay, npub])

  const registerWebhook = async () => {
    const url = webhookInput.trim()
    if (!url) return
    try { new URL(url) } catch { toast.error("Invalid URL"); return }
    if (!/^https?:\/\//.test(url)) { toast.error("URL must start with http(s)://"); return }
    setWebhookLoading(true)

    try {
      if (!window.nostr) {
        toast.error("No NIP-07 extension found (Alby, nos2x…)");
        return;
      }
      const authToken = await nip98.getToken(`${endpoint}/webhook`, 'POST', async (e: any) => {
        const signed = await window.nostr.signEvent(e);
        return signed;
      }, true, { url })

      const r = await fetch(`${endpoint}/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authToken
        },
        body: JSON.stringify({ url }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setWebhook(url)
      setWebhookInput("")
      posthog?.capture("webhook_registered", { webhook_url: url });
      toast.success("Webhook registered")
    } catch (e) {
      const err = e as Error
      toast.error(`Failed to register webhook: ${err.message}`)
    } finally {
      setWebhookLoading(false)
    }
  }

  const removeWebhook = async () => {
    try {
      const authToken = await nip98.getToken(`${endpoint}/webhook`, 'DELETE', async (e: any) => {
        const signed = await window.nostr.signEvent(e);
        return signed;
      }, true)

      const r = await fetch(`${endpoint}/webhook`, {
        method: "DELETE",
        headers: {
          "Authorization": authToken
        }
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      posthog?.capture("webhook_removed");
      toast.success("Webhook removed")
      setWebhook("")
    } catch (e) {
      const err = e as Error
      toast.error(`Failed to remove: ${err.message}`)
    }
  }

  const handleRun = async () => {
    posthog?.capture("live_stream_started");
    const relay = await Relay.connect(import.meta.env.DEV ? 'ws://localhost:7777' : 'wss://relay.pricestr.xyz');
    relay.onauth = (e) => window.nostr.signEvent(e)
    const sub = () => relay.subscribe([{
      kinds: [30078],
      "#t": [`pricestr/pro`],
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


  const daysLeft = useMemo(() => {
    if (!subscription) return 0
    const expires = new Date(subscription.expiresAt * 1000);
    const daysLeft = Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 86_400_000));
    return daysLeft
  }, [subscription])

  const streaming = !!stream;
  const stopStream = () => {
    if (stream) { stream.close(); setStream(undefined); posthog?.capture("live_stream_stopped"); }
  };

  const disconnect = () => {
    sessionStorage.removeItem('subscription')
    location.reload()
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-title uppercase text-base font-[900] tracking-widest">
            Price<span className="text-violet-400">str</span>
          </Link>
        </div>
      </header>

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* <div className="inline-flex items-center gap-2 self-start text-[10px] font-mono uppercase tracking-widest text-muted-foreground border border-border/60 rounded-full px-3 py-1">
            <ChartBar className="h-3 w-3" /> Pro Dashboard
          </div> */}
          <div className="flex justify-between lg:flex-row flex-col lg:items-center gap-5">
            <h1 className="text-5xl  tracking-tight font-[900] font-title uppercase leading-[0.9]">
              dashboard
            </h1>
            {subscription && <div className="flex lg:flex-row flex-col">
              <div className="bg-black/10 p-2 border text-muted-foreground text-xs flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="">{shortenString(npub)}</span>
              </div>
              <Button className="text-xs" variant="outline" onClick={() => disconnect()}>Disconnect</Button>
            </div>}
          </div>

          {!subscription &&
            <div className="md:w-1/2 mt-20 mx-auto">
              <div className="flex justify-between text-[10px] text-primary uppercase font-mono tracking-widest border-b border-t border-border/40 py-2">
                <span className="">// Authentication</span>
              </div>
              <Tabs defaultValue="npub" className="mt-10">
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
            </div>
          }

          {subscription &&
            <div className="flex flex-col gap-5 mt-10">
              <div className="flex justify-between text-[10px] text-primary uppercase font-mono tracking-widest border-b border-t border-border/40 py-2">
                <span className="">// Subscription</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center text-sm gap-2">
                  <span className="font-mono text-muted-foreground flex items-center gap-2"> <ShieldCheck className="h-3 w-3" />Status: </span>
                  <span className="font-mono">{subscription.active ? <span className="">Active</span> : <span>Inactive</span>}</span>
                </div>
                <div className="flex items-center text-sm gap-2">
                  <span className="font-mono text-muted-foreground flex gap-2 items-center"><Calendar className="h-3 w-3" /> Period: </span>
                  <span className="font-mono">{daysLeft}d remaining</span>
                </div>
                {isExpiringSoon(subscription) &&
                  <div className="p-4 border bg-black/10 border-primary/20 flex flex-col text-xs gap-1 mt-5">
                    <span className="font-mono text-muted-foreground flex items-center gap-2 uppercase"> Next renewal </span>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">{new Date(subscription.expiresAt * 1000).toLocaleDateString()}</span>
                      <Button onClick={() => { posthog?.capture("subscription_renewal_opened"); setRenewOpen(true); }}>Renew</Button>
                      <SubscribeProModal renew={true} open={renewOpen} onOpenChange={setRenewOpen} npub={npub} />
                    </div>
                    <span className="flex items-center gap-2 text-muted-foreground text-xs"><TriangleAlertIcon className="h-3 w-3" />Expiring soon — renew now to avoid interruption</span>
                  </div>
                }
              </div>
              <div className="flex justify-between text-[10px] text-primary uppercase font-mono tracking-widest border-b border-t border-border/40 py-2  mt-10">
                <span className="">// Billing history</span>
              </div>
              <BillingTable payments={billingHistory} />
              <div className="flex justify-between text-[10px] text-primary uppercase font-mono tracking-widest border-b border-t border-border/40 py-2  mt-10">
                <span className="">// Webhook</span>
              </div>
              <p className="text-muted-foreground">Relay POSTs every signed price event to these endpoints.</p>
              {!webhook && <div className="flex gap-2">
                <Input
                  value={webhookInput}
                  onChange={(e) => setWebhookInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") registerWebhook() }}
                  placeholder="https://your-app.com/hooks/pricestr"
                  className="font-mono text-xs"
                  disabled={webhookLoading}
                />
                <Button
                  onClick={registerWebhook}
                  disabled={webhookLoading || !webhookInput.trim()}
                  variant="outline"
                  className="font-mono uppercase text-[10px] shrink-0"
                >
                  {webhookLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <>Register</>}
                </Button>
              </div>}
              {webhook && (
                <div className="border border-white/10 bg-[#07070C] divide-y divide-white/5">
                  <div className="flex items-center justify-between gap-2 px-3 py-2 text-[11px] font-mono">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                      <code className="truncate text-white/80">{webhook}</code>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => copy(webhook, "URL")}
                        className="text-muted-foreground hover:text-violet-400 p-1"
                        aria-label="Copy URL"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeWebhook()}
                        className="text-muted-foreground hover:text-primary p-1"
                        aria-label="Remove webhook"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-between text-[10px] text-primary uppercase font-mono tracking-widest border-b border-t border-border/40 py-2 mt-10">
                <span className="">// Live stream</span>
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

              <div className="border border-white/10 bg-black/10 divide-y divide-white/5 min-h-[120px]">
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

              <div className="flex justify-between text-[10px] text-primary uppercase font-mono tracking-widest border-b border-t border-border/40 py-2 mt-10">
                <span className="">// Integration snippet</span>
                <button
                  onClick={() => copy(snippetUsage, "Snippet")}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/50 hover:text-violet-400"
                >
                  <Copy className="h-3 w-3" /> copy
                </button>
              </div>

              <Code lang="subscribe.ts">{`import { Relay } from 'nostr-tools';

const relay = await Relay.connect('wss://relay.pricestr.xyz');
relay.onauth = (e) => window.nostr.signEvent(e);

const subscribe = () => {
  relay.subscribe([{
    kinds: [30078],
    "#t": ['pricestr/pro'],
    limit: 1
  }], {
    onevent: console.log,
    onclose: (reason) => {
      if (reason.startsWith('auth-required')) {
        // retry after AUTH completes
        setTimeout(subscribe, 500);
      }
    }
  });
};

subscribe();`}</Code>
            </div>
          }

        </div>
      </div>

      <Footer />
    </main>
  )
}

export default Dashboard;

type Payment = {
  date: Date
  period: [Date, Date]
  invoice: string
  status: 'active' | 'expired'
}

const billingColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return row.original.date.toLocaleDateString()
    },
  },
  {
    accessorKey: "period",
    header: "Period",
    cell: ({ row }) => {
      return <span>
        {row.original.period[0].toLocaleDateString()} - {row.original.period[1].toLocaleDateString()}
      </span>
    },
  },
  {
    accessorKey: "invoice",
    header: "Invoice",
    cell: ({ row }) => {
      return <div className="truncate flex items-center gap-2">
        {shortenString(row.original.invoice)}
        <button
          onClick={() => copy(row.original.invoice, "Invoice")}
          className="text-muted-foreground hover:text-violet-400 p-1"
          aria-label="Copy invoice"
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>
    },
  }
]

const BillingTable = ({ payments }: { payments: Payment[] }) => {
  const table = useReactTable({
    data: payments,
    columns: billingColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table className="border bg-black/10 text-muted-foreground">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={billingColumns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}