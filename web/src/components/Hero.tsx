import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const Hero = () => {
  const [showWave, setShowWave] = useState(false);

  useEffect(() => {
    setShowWave(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="flex justify-between max-w-7xl mx-auto px-6">
        <div className="w-1/2 relative z-10 flex flex-col gap-5 ">
        <span className="text-lg">Signed <span className="text-primary">Bitcoin</span> price feed for Nostr</span>
          <h1 className="text-6xl md:text-8xl tracking-tight mb-6 font-[900] font-title uppercase">
            <span className="text-white">Price<span className="text-violet-500">Str</span></span>
          </h1>
          <div className="border-l border-primary pl-5 flex flex-col gap-1 font-mono uppercase tracking-tight text-left text-xs">
            <p>Cryptographically signed</p>
            <p>Relay-distributed</p>
            <p>Publicly auditable</p>
          </div>
          <div className="flex gap-5 mt-10">
            <Button className="bg-white">View pubkey</Button>
            <Button variant="outline">Read the docs</Button>
          </div>
        </div>

        <div className="flex w-1/2 flex-col font-mono uppercase text-xs">
          <div className="border border-white/10 flex justify-between p-3 ">
            <span>Price signal</span>
            <span className="text-primary flex items-center gap-2">
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex size-3 rounded-full bg-primary"></span>
              </span>
              Live
            </span>
            <span>10s interval</span>
          </div>
          <div className="border border-t-0 border-white/10 ">
            <canvas height={251} width={899}></canvas>
          </div>
          <div className="border border-t-0 border-white/10 flex justify-between">
            <div className="flex-1 flex flex-col p-5 gap-2 border-r border-white/10">
              <div className="flex justify-between ">
                <span className="">BTC / USD</span>
                <span className="text-red-500">0.04</span>
              </div>
              <p className="font-title text-3xl font-bold">97,573.32</p>
            </div>
            <div className="flex-1 flex flex-col p-5 gap-2">
              <div className="flex justify-between">
                <span className="">BTC / USD</span>
                <span className="text-red-500">0.04</span>
              </div>
              <p className="font-title text-3xl font-bold">97,573.32</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
