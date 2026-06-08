import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

type Section = {
  id: string;
  label: string;
};

const toc: Section[] = [
  { id: "intro", label: "Introduction" },
  { id: "the-service", label: "The Service" },
  { id: "no-financial-advice", label: "No Financial Advice" },
  { id: "subscription-payment", label: "Subscription and Payment" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "analytics-tracking", label: "Analytics and Tracking" },
  { id: "relay-availability", label: "Relay and Data Availability" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "limitation", label: "Limitation of Liability" },
  { id: "disclaimer", label: "Disclaimer of Warranties" },
  { id: "modifications", label: "Modifications to the Service" },
  { id: "governing-law", label: "Governing Law" },
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

const TermsOfUse = () => (
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
                Terms of Use
              </h1>
            </header>

            <Block id="introduction" title="1. Introduction">
              <p>
                Welcome to PriceStr ("we," "our," or "us"). PriceStr is a signed Bitcoin price feed for the Nostr protocol, developed and operated by HexQuarter.
              </p>
              <p>
                By accessing or using PriceStr (the "Service"), you agree to be bound by these Terms of Use ("Terms"). If you do not agree, please do not use the Service.
              </p>
            </Block>

            <Block id="the-service" title="2. The Service">
              <p>
                PriceStr provides:
              </p>
              <ul className="list-disc flex flex-col gap-3">
                <li>A free, publicly accessible Bitcoin price feed delivered via Nostr events</li>
                <li>Paid subscription tiers (Pro, Enterprise) with additional features</li>
                <li>Cryptographic signatures for price verification</li>
                <li>Relay infrastructure for event distribution</li>
              </ul>
              <p>PriceStr is a tool for developers and applications. It is not a financial advisor, trading platform, or investment vehicle.</p>
            </Block>

            <Block id="no-financial-advice" title="3. No Financial Advice">
              <p>All price data provided by PriceStr is for <strong>informational purposes only</strong>. We do not provide financial, investment, or trading advice.</p>
              <ul className="list-disc flex flex-col gap-3">
                <li>Cryptocurrency markets are volatile and unpredictable.</li>
                <li>PriceStr aggregates data from third-party exchanges. We do not guarantee the accuracy, completeness, or timeliness of any price.</li>
                <li>You assume all risks associated with using price data for trading, investing, or any financial decision.</li>
              </ul>
            </Block>

            <Block id="subscription-payment" title="4.  Subscription and Payment">
              <div className="flex flex-col gap-2">
                <SubBlock id='' title="4.1 Free Tier">
                  <p>The free tier requires no payment and provides basic access to BTC/USD price data.</p>
                </SubBlock>
                <SubBlock id='' title="4.2 Pro Tier">
                  <p>Pro tier subscriptions are paid via Stripe. Payments are non-refundable.</p>
                  <ul className="list-disc flex flex-col gap-3">
                    <li>Subscriptions grant access to dedicated relays, faster update intervals, additional currency pairs, and webhook delivery.</li>
                    <li>Access is granted for a 30-day period from payment confirmation.</li>
                  </ul>
                </SubBlock>
                <SubBlock id='' title="4.3 Enterprise Tier">
                  <p>Enterprise subscriptions are custom-priced and governed by separate agreements.</p>
                </SubBlock>
                <SubBlock id='' title="4.4 Cancellation">
                  <p>You may cancel your subscription at any time. No refunds are provided for partial months.</p>
                </SubBlock>
              </div>
            </Block>

            <Block id="acceptable-use" title="5. Acceptable Use">
              <p>You agree not to:</p>
              <ul className="list-disc flex flex-col gap-3">
                <li>Use the Service for any illegal activity</li>
                <li>Attempt to bypass authentication or access Pro/Enterprise features without payment</li>
                <li>Overload or attack our relays (e.g., DDoS, excessive requests)</li>
                <li>Reverse engineer, decompile, or attempt to extract source code (except where open source)</li>
                <li>Use PriceStr data for market manipulation or deceptive trading strategies</li>
              </ul>
              <p>Violation may result in immediate termination of access without refund.</p>
            </Block>

            <Block id="analytics-tracking" title="6. Analytics and Tracking">
              <p>PriceStr uses PostHog to collect anonymous product usage events and analytics. This helps us understand how users interact with our platform, track feature adoption, and improve our service. Analytics data is collected to provide insights into user behavior and service optimization.</p>
              <p>You can manage your privacy preferences through your browser settings or contact us if you have concerns about data collection.</p>
            </Block>

            <Block id="relay-availability" title="7. Relay and Data Availability">
              <p>PriceStr publishes events to Nostr relays. While we strive for high availability:</p>
              <ul className="list-disc flex flex-col gap-3">
                <li>We do not guarantee 100% uptime</li>
                <li>Free tier relies on third-party public relays over which we have no control</li>
                <li>Pro tier uses dedicated PriceStr relays, but occasional downtime may occur due to maintenance or unforeseen issues</li>
                <li>You are responsible for implementing appropriate retry and failover logic in your application</li>
              </ul>
            </Block>

            <Block id="intellectual-property" title="8. Intellectual Property">
              <ul className="list-disc flex flex-col gap-3">
                <li>The PriceStr name, logo, and branding are property of HexQuarter.</li>
                <li>Price events (the data) are public domain or licensed for free use.</li>
                <li>Frontend appliciation is released under the MIT License.</li>
              </ul>
              <p>You may freely use verified price events in your applications without restriction.</p>
            </Block>

            <Block id="limitation" title="9. Limitation of Liability">
              <p>To the maximum extent permitted by law:</p>
              <ul className="list-disc flex flex-col gap-3">
                <li>PriceStr and HexQuarter are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the Service.</li>
                <li>This includes trading losses, business interruption, or data loss.</li>
                <li>Our total liability shall not exceed the amount you paid us in the preceding 12 months.</li>
              </ul>
            </Block>

            <Block id="disclaimer" title="10. Disclaimer of Warranties">
              <p>The Service is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or secure.</p>
            </Block>

            <Block id="modifications" title="11. Modifications to the Service">
              <p>We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice. This includes pricing changes for new subscribers (existing subscribers will be notified before price changes apply to renewals).</p>
            </Block>

            <Block id="governing-law" title="12. Governing Law">
              <p>These Terms shall be governed by the laws of France (or the jurisdiction where HexQuarter is registered), without regard to conflict of law principles.</p>
            </Block>

            <Block id="contact" title="13. Contact">
              <p>For questions about these Terms, contact us at: <a href="mailto:pricestr@hexquarter.com" className="text-white hover:underline">pricestr@hexquarter.com</a></p>
            </Block>
          </article>
        </div>
      </div>
    </div>

    <Footer />
  </main>
);

export default TermsOfUse;
