import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { SectionHeader } from "./SectionHeader";
import { relayInfo } from "@/lib/nostr";

const NPM_CMD = "npm install @pricestr/sdk";

// export default GetStarted;
const GetStarted = () => {

  const [relayPub, setRelayPub] = useState("")

  useEffect(() => {
    relayInfo().then(info => {
      console.log(info)
      setRelayPub(info.pubkey)
    })
  }, [])

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value);
    toast.info('Copied into your clipboard')
  };

  return (
    <section className="pb-40" id="get-started">
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-10">
        <SectionHeader title="Integration" />
        <header className="flex justify-between items-center gap-5">
          <h2 className="text-7xl tracking-tight mb-6 font-[900] font-title uppercase">
            Two lines<br /><span className="text-violet-400">to go</span>
          </h2>
        </header>
        <div className="flex flex-col md:flex-row gap-10">
          <div className="border border-border/10 flex flex-col gap-5 lg:w-1/2">
            <span className="font-mono tracking-widest text-primary text-xs font-bold uppercase">Option a</span>
            <h3 className="tracking-tight font-[900] font-title uppercase text-4xl">Subscribe via Nostr</h3>
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
          <div className="border border-l-0 border-border/10 flex flex-col gap-5 lg:w-1/2">
            <span className="font-mono tracking-widest text-primary text-xs font-bold uppercase">Option b</span>
            <h3 className="tracking-tight font-[900] font-title uppercase text-4xl">Use the SDK</h3>
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground/80 uppercase font-mono text-xs ">Install</p>
              <div className="flex flex-col md:flex-row">
                <p className="text-xs flex-1 p-2 border flex items-center bg-white/5">{NPM_CMD}</p>
                <Button variant='outline' className="px-5 py-2 text-xs" onClick={() => handleCopy(NPM_CMD)}>Copy</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GetStarted;
