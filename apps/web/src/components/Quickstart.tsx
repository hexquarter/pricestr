import { useEffect, useState } from "react";
import { PlayIcon } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { SectionHead } from "./SectionHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CodeBlock } from "./CodeBlock";
import { useRelay } from "@/hooks/use-relay";
import { NostrEvent, Relay } from "nostr-tools";
import { usePostHog } from "@posthog/react";

const RELAY_URL = "wss://relay.pricestr.xyz";

const tsSnippet = `// npm install nostr-tools
import { Relay } from 'nostr-tools';

const relay = await Relay.connect('${RELAY_URL}');

relay.subscribe([{
  "#t": ['pricestr']
}], {
  onevent(event) {
    console.log(event.content);
  }
});`;

const pythonSnippet = `# pip install websocket-client
import json, websocket

ws = websocket.create_connection("${RELAY_URL}")
ws.send(json.dumps(["REQ", "prices", {
    "kinds": [30078],
    "#t": ["pricestr"],
    "limit": 1,
}]))

while True:
    msg = json.loads(ws.recv())
    if msg[0] == "EVENT":
        print(json.loads(msg[2]["content"]))`;

const cliSnippet = `# websocat "wss://relay.pricestr.xyz"
# then send this one-line request:

["REQ","prices",{"kinds":[30078],"#t":["pricestr"],"limit":1}]

# EVENT messages arrive every 10 seconds.
# Works with any NIP-01 client, in any language.`;

const Quickstart = () => {
  const { relay } = useRelay();
  const [relayPub, setRelayPub] = useState("");
  const [runResult, setRunResult] = useState("");
  const posthog = usePostHog();

  useEffect(() => {
    if (!relay) return;
    relay.info().then((info) => setRelayPub(info.pubkey)).catch(() => setRelayPub("unavailable — relay offline"));
  }, [relay]);

  const handleRun = async () => {
    posthog?.capture("get_started_snippet_run");
    try {
      const r = await Relay.connect(import.meta.env.DEV ? "ws://localhost:7777" : RELAY_URL);
      r.subscribe([{ "#t": ["pricestr"] }], {
        onevent(event: NostrEvent) {
          const eventData = JSON.parse(event.content);
          eventData.timestamp = new Date(event.created_at * 1000).toISOString();
          setRunResult(JSON.stringify(eventData, null, 2));
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section id="get-started" className="scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
        <SectionHead
          eyebrow="Quickstart"
          title={
            <>
              URL → verified price <br />
              in <span className="text-violet-400">60 seconds</span>
            </>
          }
          lead="Two pieces of information are all you ever need: the relay URL and the signer's public key. Pick your language below — no API key, no account, no backend."
        />

        <div className="grid lg:grid-cols-12 gap-px bg-border/40 border border-border/40">
          {/* Left: connection details */}
          <div className="lg:col-span-5 bg-background p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Relay endpoint
              </p>
              <div className="flex items-center justify-between border border-border/60 bg-card/40 px-4 py-3">
                <code className="text-xs font-mono">{RELAY_URL}</code>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Signer public key
              </p>
              <div className="flex items-start justify-between gap-3 border border-border/60 bg-card/40 px-4 py-3">
                <code className="text-xs font-mono break-all leading-relaxed">
                  {relayPub || "loading…"}
                </code>
              </div>
            </div>

            <div className="border-t border-border/40 pt-5 flex flex-col gap-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-primary">// integration notes</p>
              <ul className="flex flex-col gap-2 text-xs font-mono text-muted-foreground leading-relaxed">
                <li>· Events are <span className="text-foreground">kind 30078</span> replaceable events tagged <span className="text-foreground">pricestr</span>, every 10 seconds.</li>
                <li>· Verify <span className="text-foreground">event.pubkey</span> matches the signer key above before trusting any price.</li>
                <li>· Any NIP-01 relay client works — the protocol is the API.</li>
              </ul>
            </div>
          </div>

          {/* Right: language tabs */}
          <div className="lg:col-span-7 flex flex-col">
            <Tabs defaultValue="ts" className="w-full flex flex-col">
              <div className="border border-b-0 border-border/40 bg-card/30 px-3 pt-2">
                <TabsList className="bg-transparent h-auto p-0 gap-1 justify-start">
                  {[
                    { value: "ts", label: "TypeScript" },
                    { value: "python", label: "Python" },
                    { value: "cli", label: "Any client" },
                  ].map((t) => (
                    <TabsTrigger
                      key={t.value}
                      value={t.value}
                      className="font-mono uppercase tracking-widest text-[10px] px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-400 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground"
                    >
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="ts" className="mt-0 flex flex-col">
                <CodeBlock
                  title="price.ts"
                  code={tsSnippet}
                  lang="ts"
                  footer={
                    <div className="border-t border-white/10 flex flex-col items-stretch">
                      <Button
                        onClick={handleRun}
                        variant="ghost"
                        className="rounded-none font-mono uppercase tracking-widest text-[11px] text-primary hover:text-primary hover:bg-primary/10 h-11 px-5 justify-start"
                      >
                        <PlayIcon className="h-3 w-3 mr-2" /> Run live in your browser
                      </Button>
                      <div className={`p-4 text-[11px] font-mono text-white/60 truncate ${runResult ? "" : "opacity-50"}`}>
                        {runResult ? <pre>{runResult}</pre> : "// output will appear here every 10s"}
                      </div>
                    </div>
                  }
                />
              </TabsContent>

              <TabsContent value="python" className="mt-0">
                <CodeBlock title="price.py" code={pythonSnippet} lang="python" />
              </TabsContent>

              <TabsContent value="cli" className="mt-0">
                <CodeBlock title="terminal" code={cliSnippet} lang="bash" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Quickstart;
