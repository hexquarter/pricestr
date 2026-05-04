import { Activity, AppWindow, Lock, Network, Shrink } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const SignalChain = () => (
    <section className="">
        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-10">
            <SectionHeader title="Data pipeline" />
            <header className="flex justify-between items-center gap-5">
                <h2 className="text-7xl tracking-tight mb-6 font-[900] font-title uppercase">
                    Signal <br /><span className="text-violet-400">Chain</span>
                </h2>
            </header>
            <div className="grid md:grid-cols-5 relative z-10">
                <div className="border border-border/10 p-5 flex flex-col gap-5">
                    <div className="flex justify-between items-center">
                        <Activity className="text-primary" />
                        <p className="text-4xl tracking-tight font-[900] font-title uppercase text-white/10">01</p>
                    </div>
                    <h3 className="tracking-tight font-[900] font-title uppercase text-4xl">Exchange APIs</h3>
                    <p className="leading-5 text-xs font-mono text-muted-foreground">Binance <br /> Kraken<br /> Coinbase</p>
                </div>
                <div className="border border-border/10 border-l-0 p-5 flex flex-col gap-5">
                    <div className="flex justify-between items-center">
                        <Shrink className="text-primary" />
                        <p className="text-4xl tracking-tight font-[900] font-title uppercase text-white/10">02</p>
                    </div>
                    <h3 className="tracking-tight font-[900] font-title uppercase text-4xl">Aggregation</h3>
                    <p className="leading-5 text-xs font-mono text-muted-foreground">Median filter <br />Open‑source logic <br />Isolated signer</p>
                </div>
                <div className="border border-border/10 border-l-0 p-5 flex flex-col gap-5">
                    <div className="flex justify-between items-center">
                        <Lock className="text-primary" />
                        <p className="text-4xl tracking-tight font-[900] font-title uppercase text-white/10">03</p>
                    </div>
                    <h3 className="tracking-tight font-[900] font-title uppercase text-4xl flex items-center"> Signed Event</h3>
                    <p className="leading-5 text-xs font-mono text-muted-foreground">Nostr event  <br />Immutable ID <br />Tamper‑proof</p>
                </div>
                <div className="border border-border/10 p-5 border-l-0 flex flex-col gap-5">
                    <div className="flex justify-between items-center">
                        <Network className="text-primary" />
                        <p className="text-4xl tracking-tight font-[900] font-title uppercase text-white/10">04</p>
                    </div>
                    <h3 className="tracking-tight font-[900] font-title uppercase text-4xl">Relay</h3>
                    <p className="leading-5 text-xs font-mono text-muted-foreground">wss://pricestr.xyz <br />Any public relay <br />Dedicated for Pro+</p>
                </div>
                <div className="border border-border/10 p-5 border-l-0 flex flex-col gap-5">
                    <div className="flex justify-between items-center">
                        <AppWindow className="text-primary" />
                        <p className="text-4xl tracking-tight font-[900] font-title uppercase text-white/10">05</p>
                    </div>
                    <h3 className="tracking-tight font-[900] font-title uppercase text-4xl">Your app</h3>
                    <p className="leading-5 text-xs font-mono text-muted-foreground">Query any relay <br />Verify signature <br />Use price</p>
                </div>
            </div>
        </div>
    </section>
);

export default SignalChain;
