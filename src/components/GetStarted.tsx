import { useEffect, useState } from "react";
import { Copy, Check, Terminal, PlayIcon } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { SectionHeader } from "./SectionHeader";
import { useRelay } from "@/hooks/use-relay";
import { Relay } from "nostr-tools";

const GetStarted = () => {

  const { relay } = useRelay()
  const [relayPub, setRelayPub] = useState("")
  const [runResult, setRunResult] = useState("")

  useEffect(() => {
    if (!relay) return
    relay.info().then(info => {
      setRelayPub(info.pubkey)
    })
  }, [relay])

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value);
    toast.info('Copied into your clipboard')
  };

  const handleRun = async () => {
    if (!relayPub) return
    const relay = await Relay.connect(import.meta.env.DEV ? 'ws://localhost:7777' : 'wss://relay.pricestr.xyz');
    relay.subscribe([
      {
        kinds: [30078],
        "#t": ['pricestr/free']
      }], {
      onevent(event) {
        setRunResult(event.content)
      }
    })
  }

  return (
    <section className="pb-40" id="get-started">
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-10">
        <SectionHeader title="Integration" />
        <header className="flex justify-between items-center gap-5">
          <h2 className="text-7xl tracking-tight mb-6 font-[900] font-title uppercase">
            Subscribe via Nostr
          </h2>
        </header>
        <div className="flex flex-col gap-10">
          <div className="border border-border/10 flex flex-col gap-5 lg:w-1/2">
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground/80 uppercase font-mono text-xs ">Public key</p>
              <div className="flex flex-col md:flex-row">
                <p className="text-xs flex-1 p-2 border flex items-center bg-white/5 break-all">
                  {relayPub}
                </p>
                <Button variant='outline' className="flex px-5 py-2 text-xs" onClick={() => handleCopy(relayPub)}>Copy</Button>
              </div>
              <p className="text-muted-foreground text-sm mt-2">Add this pubkey to your relay subscriptions. <br />Every signed price event will appear in your feed. <br />Use <span className="text-white">wss://relay.pricestr.xyz</span> for free</p>
            </div>
          </div>

          <span className="font-mono tracking-widest text-primary text-xs font-bold uppercase">Code snippet</span>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
              <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
            </div>

            <div className="p-8">
              <div className="mb-6 flex items-center gap-3 text-sm text-white/40">
                <Terminal className="h-4 w-4" />
                price.ts
              </div>

              <pre className="overflow-x-auto text-xs leading-[2] text-white/80">
                <code>{`import { Relay } from 'nostr-tools';

const relay = await Relay.connect('wss://relay.pricestr.xyz');
relay.subscribe([{
  kinds: [30078],
  "#t": ['pricestr/free']
}], {
  onevent(event) {
    console.log(event.content;
  }
});`}</code>
              </pre>
            </div>
            <div className="flex items-center">
              <Button onClick={handleRun}>Run <PlayIcon /></Button>
              <p className={`${runResult ? 'inline-block' : 'hidden'} bg-white/10 align-middle p-3 text-xs w-full`}>{runResult}</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default GetStarted;
