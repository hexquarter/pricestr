import { SectionHeader } from "./SectionHeader";

const Verify = () => (
  <section className="">
    <div className="max-w-7xl mx-auto px-6 flex flex-col gap-10">
      <SectionHeader title="Self-sovereign" />
      <header className="flex justify-between items-center gap-5">
        <h2 className="text-7xl tracking-tight mb-6 font-[900] font-title uppercase">
          Verify<br /><span className="text-violet-400">everything</span>
        </h2>
      </header>
      <div className="flex flex-col lg:flex-row">
        <div className="border border-white/10 p-10 flex flex-col gap-5 lg:w-1/2">
          <span className="font-mono tracking-widest text-[10px] uppercase border-b border-white/10 pb-5">JSON / Nostr Event</span>
          <div className="flex flex-col font-mono text-xs gap-1 text-white">
            <span className="t">{`{`}</span>
            <p className="pl-5"><span className="text-gray-400">"kind"</span>: <span className="text-primary">31890</span>,</p>
            <p className="pl-5"><span className="text-gray-400">"pubkey"</span>: <span className="text-primary">"7f9da3c2...1b"</span>,</p>
            <p className="pl-5"><span className="text-gray-400">"created_at"</span>: <span className="text-primary">1714823944</span>,</p>
            <p className="pl-5"><span className="text-gray-400">"tags"</span>: {'['},</p>
            <p className="pl-10">{'['}<span className="text-primary">"sources"</span>, <span className="text-primary">"kraken,binance,coinbase"</span>{']'},</p>
            <p className="pl-10">{'['}<span className="text-primary">"method"</span>, <span className="text-primary">"median"</span>{']'},</p>
            <p className="pl-10">{'['}<span className="text-primary">"currency"</span>, <span className="text-primary">"USD"</span>{']'},</p>
            <p className="pl-10">{'['}<span className="text-primary">"tier"</span>, <span className="text-primary">"free"</span>{']'}</p>
             <p className="pl-10">{'['}<span className="text-primary">"d"</span>, <span className="text-primary">"pricestr/free/1714823944`"</span>{']'},</p>
            <p className="pl-10">{'['}<span className="text-primary">"t"</span>, <span className="text-primary">"pricestr/free`"</span>{']'},</p>
            <p className="pl-5">{']'},</p>
            <p className="pl-5"><span className="text-gray-400">"content"</span>: <span className="text-primary">"{JSON.stringify({ aggregate: 70.040, sources: {binance: 70.040, coinbase: 70.050, kraken: 70.041, method: "median"}}, null, 2)}"</span>,</p>
            <p className="pl-5"><span className="text-gray-400">"sig"</span>: <span className="text-primary">"a8f31c9e...04"</span></p>
            <span className="">{`}`}</span>
          </div>
        </div>
        <div className="border border-l-0 border-white/10 p-10 flex flex-col gap-5 lg:w-1/2">
          <header className="flex flex-col">
            <h3 className="tracking-tight font-[900] font-title uppercase text-4xl">No trust <br />required.</h3>
            <p className="tracking-tight font-[900] font-title uppercase text-4xl text-violet-400">Verify.</p>
          </header>
          <div className="flex flex-col gap-5 text-xs font-mono">
            <div className="flex gap-10 border-b border-white/10 pb-5">
              <span className="text-primary">01</span>
              <div className="flex flex-col gap-2">
                <p className="text-white font-semibold">Relay-agnostic truth</p>
                <p className="text-muted-foreground leading-5">The cryptographic signature binds the price to PriceStr’s public key. Any relay delivering that event is verifiable; none can censor or alter it without breaking the signature.</p>
              </div>
            </div>
            <div className="flex gap-10 border-b border-white/10 pb-5">
              <span className="text-primary">02</span>
              <div className="flex flex-col gap-2">
                <p className="text-white font-semibold">Permanent history</p>
                <p className="text-muted-foreground leading-5">Every event is permanently addressable by its ID. Relays store a full, queryable price history. No database required – Nostr is your database.</p>
              </div>
            </div>
            <div className="flex gap-10">
              <span className="text-primary">03</span>
              <div className="flex flex-col gap-2">
                <p className="text-white font-semibold">One function call</p>
                <p className="text-muted-foreground leading-5">Any Nostr library exposes verify(). Pass the event and the public key. Boolean result. No API keys, no trust boundary, no vendor lock‑in.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Verify;
