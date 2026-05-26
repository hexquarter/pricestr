import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Sub } from "@radix-ui/react-context-menu";

type Section = {
  id: string;
  label: string;
};

const toc: Section[] = [
  { id: "who-we-are", label: "Who we are" },
  { id: "information-collected", label: "Information We Collect" },
  { id: "information-usage", label: "How We Use Your Information" },
  { id: "data-retention", label: "Data Retention" },
  { id: "data-sharing", label: "Data Sharing" },
  { id: "rights", label: "Your Rights" },
  { id: "security", label: "Security" },
  { id: "modifications", label: "Modifications" },
  { id: "contact", label: "Contact" },
];


const Block: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({
  id,
  title,
  children,
}) => (
  <section id={id} className="scroll-mt-28 flex flex-col gap-5">
    <h2 className="text-3xl md:text-5xl tracking-tight font-[900] font-title uppercase leading-[0.95]">
      {title}
    </h2>
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground font-mono max-w-3xl">
      {children}
    </div>
  </section>
);

const SubBlock: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({
  id,
  title,
  children,
}) => (
  <section id={id} className="scroll-mt-28 flex flex-col gap-5">
    <h3 className="text-4xl tracking-tight font-[900] font-title uppercase leading-[0.95] text-white">
      {title}
    </h3>
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground font-mono max-w-3xl">
      {children}
    </div>
  </section>
);

const PrivacyPolicy = () => (
  <main className="min-h-screen bg-background text-foreground">
    <NavBar />

    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground mb-10"
        >
          <ArrowLeft className="h-3 w-3" /> Back to home
        </Link>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* TOC */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24 flex flex-col gap-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-3">
                // contents
              </p>
              <nav className="flex flex-col">
                {toc.map((t) => {
                  return (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className="group flex items-center gap-3 py-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t.label}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Body */}
          <article className="lg:col-span-9 flex flex-col gap-20">
            <header className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 self-start text-[10px] font-mono uppercase tracking-widest text-muted-foreground border border-border/60 rounded-full px-3 py-1">
                <BookOpen className="h-3 w-3" /> Last updated: May 2026
              </div>
              <h1 className="text-5xl md:text-7xl tracking-tight font-[900] font-title uppercase leading-[0.9]">
                Privacy Policy
              </h1>
            </header>

            <Block id="who-we-are" title="1. Who we are">
              <p>
                PriceStr is developed and operated by <strong><a href="https://hexquarter.com" target="_blank" className="hover:underline text-white">HexQuarter</a></strong>. This Privacy Policy explains how we collect, use, and protect information when you use our Service.
              </p>
            </Block>

            <Block id="information-collected" title="2. Information We Collect">
              <SubBlock id="" title="2.1 Information You Provide">
                <ul className="list-disc flex flex-col gap-3">
                  <li>Payment information: When you subscribe to Pro tier, we receive a Lightning invoice payment confirmation. We do not see or store your wallet private keys.</li>
                  <li>Nostr public key: If you subscribe, we may associate your Nostr pubkey with your subscription for access control.</li>
                </ul>
              </SubBlock>
              <SubBlock id="" title="2.2 Automatically Collected Information">
                <ul className="list-disc flex flex-col gap-3">
                  <li>IP addresses: Temporarily logged for rate limiting and abuse prevention. Not permanently stored.</li>
                  <li>Relay connection logs: Basic metadata (connection time, subscription requests) may be logged for operational purposes.</li>
                </ul>
              </SubBlock>
            </Block>

            <Block id="information-usage" title="3. How We Use Your Information">
              <ul className="list-disc flex flex-col gap-3">
                <li>To authenticate subscription access to Pro relays</li>
                <li>To provide and maintain the Service</li>
                <li>To communicate with you (e.g., subscription reminders, service updates)</li>
                <li>To prevent abuse and ensure fair usage</li>
                <li>To improve our infrastructure and features</li>
              </ul>
            </Block>

            <Block id="data-retention" title="4. Data Retention">
              <p>PriceStr publishes events to Nostr relays. While we strive for high availability:</p>
              <ul className="list-disc flex flex-col gap-3">
                <li>Subscription records: Retained for the duration of your subscription, after 30s, the subscription is removed.</li>
                <li>Payment records: Proof of payment are recorded on Nostr for transparency and auditability</li>
              </ul>
            </Block>

            <Block id="data-sharing" title="5. Data Sharing">
              <p>We do not sell or rent your personal data. We may share data only in these limited circumstances:</p>
              <ul className="list-disc flex flex-col gap-3">
                <li>Service providers: Hosting providers (Hetzner, OVH, etc.) who process data on our behalf under confidentiality agreements</li>
                <li>Legal compliance: If required by law or to protect our rights</li>
                <li>Nostr network: Your subscription status to the Nostr network; only proof of payment, subscription end date and and public key information is public</li>
              </ul>
            </Block>

            <Block id="rights" title="6. Your Rights (GDPR, CCPA, etc.)">
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc flex flex-col gap-3">
                <li>Request deletion of your data</li>
                <li>Correct inaccurate data</li>
                <li>Access the personal data we hold about you</li>
              </ul>
              <p>To exercise these rights, contact us at <a href="pricestr@hexquarter.com" className="hover:underline" target="_blank">pricestr@hexquarter.com</a></p>
            </Block>

            <Block id="security" title="7. Security">
              <p>We take reasonable measures to protect your data:</p>
              <ul className="list-disc flex flex-col gap-3">
                <li>Relay access uses authentication (NIP-42 or domain-bound tokens)</li>
                <li>Servers are regularly updated and monitored</li>
                <li>Access the personal data we hold about you</li>
              </ul>
              <p>Due to the nature of the Nostr decentralized network, your public information may be processed on servers located outside your country of residence.</p>
            </Block>

            <Block id="modifications" title="8. Changes to This Privacy Policy">
              <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. For material changes, we may provide additional notice (e.g., via Nostr announcement).</p>
            </Block>

            <Block id="contact" title="12. Contact Us">
              <p>For questions about this privacy policy, contact us at: <a href="mailto:pricestr@hexquarter.com" className="text-white hover:underline">pricestr@hexquarter.com</a></p>
            </Block>
          </article>
        </div>
      </div>
    </div>

    <Footer />
  </main>
);

export default PrivacyPolicy;
