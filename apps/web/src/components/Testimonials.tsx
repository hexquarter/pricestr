import { Quote, ExternalLink } from "lucide-react";
import { SectionHead } from "./SectionHead";

import { BsLinkedin } from "react-icons/bs";

const testimonials = [
  {
    quote: "Integrating PriceStr into NotaryBTC was seamless; their signature-verified Nostr feed provides the absolute reliability our bitcoin infrastructure requires",
    name: 'Eriberto Ortiz - CEO & Founder',
    details: "NotaryBTC - Hardware-certified Bitcoin verification oracle",
    linkedin: "https://www.linkedin.com/in/eriberto-ortiz-ceo",
    product: "notarybtc.com",
    productLink: "https://notarybtc.com/"
  }
];

const Testimonials = () => (
  <section id="testimonials" className="scroll-mt-24">
    <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
      <SectionHead
        eyebrow="Technical proof"
        title={
          <>
            Verified by the Industry
          </>
        }
        lead=""
      />

      <div className="grid md:grid-cols-3 relative">
        {testimonials.map((t, i) => {
          return (
            <div
              key={i}
              className="border border-muted-foreground/20 bg-card p-6 lg:p-8 flex flex-col gap-5 hover:bg-white/5 transition duration-500"
            >
              <div className="flex justify-between items-start">
                <Quote className="h-6 w-6 text-primary/60" />
                <div className="flex gap-1">
                  <a className='text-xs text-muted-foreground flex items-center' href={t.productLink} target="_blank">{t.product}<ExternalLink className="h-3"/></a>
                </div>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">"{t.quote}"</p>
              <div className="mt-auto flex flex-col gap-1 border-t border-muted-foreground/10 pt-4">
                <p className="text-sm font-medium">{t.linkedin ? <a href={t.linkedin} target="_blank" className="flex items-center gap-2"><BsLinkedin />{t.name}</a> : t.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{t.details}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default Testimonials;
