import { SectionHead } from "./SectionHead";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

const faqs = [
  {
    q: "How is this different from a regular HTTP price API?",
    a: "A regular API is a trusted endpoint behind a key. You trust the operator, the CDN, the database and the TLS chain. PriceStr ships a Schnorr signature over the price payload itself — your application verifies it locally in microseconds. The relay becomes pure transport. No key can be revoked, no quota can throttle you mid-trade, no admin can quietly rewrite a historical print.",
  },
  {
    q: "Why does a Bitcoin-native team need an oracle at all?",
    a: "The moment your product touches fiat — quoting, hedging, margin, settlement, compliance, even a balance label in the UI — you need an external price. Today that dependency is usually a centralized SaaS. PriceStr lets the price feed match the rest of your stack: decentralized, verifiable, paid in sats.",
  },
  {
    q: "What happens if PriceStr disappears tomorrow?",
    a: "Every historical price is a signed Nostr event with a permanent ID, mirrored across public relays. Your past audit trail keeps verifying forever. Going forward, the spec is open: any team can spin up a compatible signer and your application keeps working by switching one pubkey.",
  },
  {
    q: "Why $10/month?",
    a: "It's the price of a coffee a week, and it's what production-grade decentralized infrastructure should cost a small fintech team. Free tier covers builders, dashboards, and hobby projects. Pro covers anything you'd actually quote a customer against. Enterprise covers anyone who needs a contractual SLA.",
  },
  {
    q: "Do I need to know Nostr to integrate?",
    a: "No. If you've used any WebSocket library, you can integrate PriceStr in ~10 lines. The relay URL and signer pubkey are the only two values you need. We provide TypeScript, Rust, Go and Python snippets in the docs.",
  },
  {
    q: "How do you pay? Stripe? Crypto?",
    a: "Lightning, in sats. The Pro subscription is paid via a BOLT11 invoice, bound to your Nostr pubkey (npub). No credit card, no Stripe, no chargebacks, no KYC. Don't want to renew? Don't pay the next invoice — the relay stops granting access at expiry.",
  },
];

const FAQ = () => (
  <section id="faq" className="scroll-mt-24">
    <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
      <SectionHead
        eyebrow="FAQ"
        title={
          <>
            Questions, <br />
            <span className="text-violet-400">answered.</span>
          </>
        }
        lead="The same questions every Bitcoin or Nostr-native team asks us before they integrate. If yours isn't here, ping us on Nostr."
      />

      <div className="border border-border/40">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`item-${i}`}
              className={`px-6 ${i === faqs.length - 1 ? "border-b-0" : "border-border/40"}`}
            >
              <AccordionTrigger className="text-left font-title uppercase tracking-tight text-lg md:text-xl hover:no-underline py-6">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm font-mono text-muted-foreground leading-relaxed pb-6 pr-8">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
);

export default FAQ;
