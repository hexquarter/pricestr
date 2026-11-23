import { useMemo, useState } from "react";
import { ShieldCheck, ShieldX, FlaskConical } from "lucide-react";
import { verifyEvent, getEventHash } from "nostr-tools";
import type { NostrEvent } from "nostr-tools";
import { useFeed } from "@/hooks/use-feed";
import CodeBlock from "./CodeBlock";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

const RELAY_URL = "wss://relay.pricestr.xyz";

const short = (s: string) => `${s.slice(0, 12)}…${s.slice(-4)}`;

/** Interactive signature verifier running on the live feed — includes a tamper test. */
const Verifier = () => {
  const { latest } = useFeed();
  const [tamper, setTamper] = useState(false);
  const [checked, setChecked] = useState(false);

  const target: NostrEvent | null = useMemo(() => {
    if (!latest) return null;
    if (!tamper) return latest.event;
    try {
      const content = JSON.parse(latest.event.content);
      content.median = content.median + 1; // flip a single satoshi
      return { ...latest.event, content: JSON.stringify(content) };
    } catch {
      return latest.event;
    }
  }, [latest, tamper]);

  // A correct check is two-fold: the signature must verify AND the event id
  // must match a hash of the actual payload (nostr-tools' verifyEvent alone
  // trusts the event's claimed id).
  const valid = target ? verifyEvent(target) && getEventHash(target) === target.id : null;

  const view = useMemo(() => {
    if (!target) return null;
    let prettyContent = target.content;
    try {
      prettyContent = JSON.stringify(JSON.parse(target.content));
    } catch { /* keep raw */ }
    return {
      id: short(target.id),
      pubkey: short(target.pubkey),
      kind: target.kind,
      created_at: new Date(target.created_at * 1000).toISOString(),
      content: prettyContent,
      sig: short(target.sig),
    };
  }, [target]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {latest
            ? tamper
              ? "// one satoshi was added to the payload"
              : "// streaming the latest signed event"
            : "// awaiting first signal from the relay"}
        </p>
        <div className="flex items-center gap-3">
          <FlaskConical className="h-3.5 w-3.5 text-muted-foreground" />
          <Label htmlFor="tamper-toggle" className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground cursor-pointer">
            Tamper test
          </Label>
          <Switch
            id="tamper-toggle"
            checked={tamper}
            onCheckedChange={(v) => { setTamper(v); setChecked(true); }}
            disabled={!latest}
          />
        </div>
      </div>

      {view && (
        <CodeBlock
          title="event.json — live"
          lang="json"
          code={JSON.stringify(view, null, 2)}
        />
      )}

      <div className="border border-border/40 bg-card/20 px-5 py-4 flex flex-col gap-3">
        {valid === null ? (
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/60 animate-pulse">
            · waiting for the feed ·
          </span>
        ) : (
          <div
            className={`flex items-center gap-3 text-sm font-mono ${valid ? "text-emerald-400" : "text-red-400"}`}
          >
            {valid ? <ShieldCheck className="h-5 w-5 shrink-0" /> : <ShieldX className="h-5 w-5 shrink-0" />}
            <span>
              {valid
                ? `VALID — signed by ${short(target!.pubkey)}`
                : "INVALID — signature does not match the payload"}
            </span>
          </div>
        )}
        <p className="text-xs font-mono text-muted-foreground leading-relaxed">
          {valid
            ? `verifyEvent(event) ran locally in your browser — no network call, no trust in ${RELAY_URL.replace("wss://", "")}. Flip the tamper switch: a single changed satoshi breaks the signature.`
            : "The Schnorr signature binds every byte of the payload to the signer's public key. This is what a tampered event looks like."}
        </p>
        {!checked && valid === true && (
          <p className="text-[10px] font-mono uppercase tracking-widest text-primary">
            // try the tamper test →
          </p>
        )}
      </div>
    </div>
  );
};

export default Verifier;
