import Hero from "@/components/Hero";
import LiveTicker from "@/components/LiveTicker";
import HowItWorks from "@/components/HowItWorks";
import WhySigrate from "@/components/WhySigrate";
import ProofModel from "@/components/ProofModel";
import PricingTiers from "@/components/PricingTiers";
import GetStarted from "@/components/GetStarted";
import Footer from "@/components/Footer";

const Index = () => (
  <main className="min-h-screen bg-background">
    <Hero />
    <LiveTicker />
    <HowItWorks />
    <WhySigrate />
    <ProofModel />
    <PricingTiers />
    <GetStarted />
    <Footer />
  </main>
);

export default Index;
