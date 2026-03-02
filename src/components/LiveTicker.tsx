import { useEffect, useState } from "react";
import { Check } from "lucide-react";

const PUBKEY = "npub1sigr4te...x8q2k";

const LiveTicker = () => {
  const [btcUsd, setBtcUsd] = useState(97432.18);
  const [btcEur, setBtcEur] = useState(89215.44);

  useEffect(() => {
    const interval = setInterval(() => {
      setBtcUsd((prev) => prev + (Math.random() - 0.5) * 80);
      setBtcEur((prev) => prev + (Math.random() - 0.5) * 60);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="border-y border-border bg-navy-surface">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <PricePair label="BTC / USD" price={btcUsd} />
          <div className="hidden md:block w-px h-10 bg-border" />
          <PricePair label="BTC / EUR" price={btcEur} />
        </div>
        <div className="text-center mt-4">
          <span className="font-mono text-xs text-muted-foreground">{PUBKEY}</span>
        </div>
      </div>
    </section>
  );
};

const PricePair = ({ label, price }: { label: string; price: number }) => (
  <div className="flex items-center gap-4">
    <span className="text-xs text-muted-foreground uppercase tracking-widest">{label}</span>
    <span className="font-mono text-2xl md:text-3xl font-semibold text-foreground">
      {price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
    <span className="inline-flex items-center gap-1 text-xs text-verified badge-pulse">
      <Check className="w-3 h-3" />
      verified
    </span>
  </div>
);

export default LiveTicker;
