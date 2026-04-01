import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { SectionHeader } from "./SectionHeader";

const PUBKEY = "npub1sigr4te7f8wq3kx8ahj29vm5ndcl4pz6y20fw0ghst7e5j8mplqx8q2k";
const NPM_CMD = "npm install @pricestr/sdk";

// export default GetStarted;
const GetStarted = () => {

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value);
    toast.info('Copied into your clipboard')
  };

  return (
    <section className="pb-40 ">
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-10">
        <SectionHeader title="Integration" />
        <header className="flex justify-between items-center gap-5">
          <h2 className="text-7xl tracking-tight mb-6 font-[900] font-title uppercase">
            Two lines<br /><span className="text-violet-400">to go</span>
          </h2>
        </header>
        <div className="flex">
          <div className="border border-border/10 p-10 flex flex-col gap-5 w-1/2">
            <span className="font-mono tracking-widest text-primary text-xs font-bold uppercase">Option a</span>
            <h3 className="tracking-tight font-[900] font-title uppercase text-4xl">Subscribe via Nostr</h3>
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground/80 uppercase font-mono text-xs ">Public key</p>
              <div className="flex">
                <p className="text-xs flex-1 p-2 border flex items-center bg-white/5">{PUBKEY}</p>
                <Button variant='outline' className="px-5 py-2 text-xs" onClick={() => handleCopy(PUBKEY)}>Copy</Button>
              </div>
            </div>
          </div>
          <div className="border border-l-0 border-border/10 p-10 flex flex-col gap-5 w-1/2">
            <span className="font-mono tracking-widest text-primary text-xs font-bold uppercase">Option b</span>
            <h3 className="tracking-tight font-[900] font-title uppercase text-4xl">Use the SDK</h3>
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground/80 uppercase font-mono text-xs ">Install</p>
              <div className="flex">
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
