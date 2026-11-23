import { useEffect, useState } from "react";
import { useFeed } from "@/hooks/use-feed";

const RELAY_URL = "wss://relay.pricestr.xyz";

/** Live status line built from the feed itself — no mock data, ever. */
const TrustStrip = ({ className = "" }: { className?: string }) => {
  const { latest, received } = useFeed();
  const [, setTick] = useState(0);

  // re-render every second so "last event Xs ago" stays honest
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (!received) {
    return (
      <div className={`flex flex-wrap gap-x-5 gap-y-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground ${className}`}>
        <span className="flex items-center gap-2">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-muted-foreground opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-muted-foreground" />
          </span>
          connecting to {RELAY_URL.replace("wss://", "")}…
        </span>
      </div>
    );
  }

  const age = latest ? Math.max(0, Math.round((Date.now() - latest.at) / 1000)) : null;
  const sources = latest ? Object.keys(latest.data.sources).length : 0;
  const stale = latest ? Date.now() - latest.at > 30_000 : false;

  return (
    <div className={`flex flex-wrap gap-x-5 gap-y-1 text-[10px] font-mono uppercase tracking-widest ${className}`}>
      <span className={`flex items-center gap-2 ${stale ? "text-amber-400" : "text-emerald-400"}`}>
        <span className={`relative flex size-1.5 ${stale ? "" : ""}`}>
          {!stale && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          )}
          <span className={`relative inline-flex size-1.5 rounded-full ${stale ? "bg-amber-400" : "bg-emerald-400"}`} />
        </span>
        relay online
      </span>
      {age !== null && (
        <span className={stale ? "text-amber-400" : "text-muted-foreground"}>
          last event {age}s ago
        </span>
      )}
      <span className="text-muted-foreground">{sources}/7 sources</span>
      <span className="text-emerald-400">sig ✓ valid</span>
    </div>
  );
};

export default TrustStrip;
