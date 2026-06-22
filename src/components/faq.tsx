import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { SectionHead } from "./SectionHead";

const items = [
  {
    q: "Why is this only $10/month?",
    a: "Because the relay is the only thing we operate. You pay for cadence, webhooks, authenticated relay access. ",
  },
  {
    q: "Why Nostr instead of a REST API?",
    a: "Because a REST API is an opaque request to a server you can't audit. For secure communication, it might triggers security issues (CORS policy). A Nostr event is signed by a pubkey, addressable on any relay, and verifiable offline by your client. Same data, completely different trust model.",
  },
  {
    q: "What happens if your relay goes down?",
    a: "Every event is mirrored to public relays. Pro events are also delivered to any relay you self-host or any URL you register as a webhook. The signature is what matters — the transport is interchangeable.",
  },
  {
    q: "How do I verify a price in my app?",
    a: "Import nostr-tools, fetch the latest kind 30078 event tagged 'pricestr/pro', and call verifyEvent. If the signature matches our published pubkey, the price is authentic. Eight lines, no SDK lock-in. You have the capability to verify the mediam as well as the sources are included in the data.",
  },
  {
    q: "Do you take a position on the price?",
    a: "No. The aggregation logic is open-source and runs deterministically over 6 venues. We sign the median — we don't choose it.",
  }
];

const FAQ = () => (
  <section id="faq" className="scroll-mt-24">
    <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
      <SectionHead
        eyebrow="FAQ"
        title={
          <>
            Questions we get
          </>
        }
      />
      <Accordion type="single" collapsible className="border border-border/40 divide-y divide-border/40">
        {items.map((it, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-b-0">
            <AccordionTrigger className="px-6 py-5 text-left font-mono uppercase tracking-wider text-xs hover:no-underline">
              {it.q}
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5 text-xs font-mono text-muted-foreground leading-relaxed">
              {it.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQ;