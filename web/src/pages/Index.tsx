import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Verify from "@/components/Verify";
import PricingTiers from "@/components/PricingTiers";
import GetStarted from "@/components/GetStarted";
import Footer from "@/components/Footer";
import SignalChain from "@/components/SignalChain";

const Index = () => (
  <main className="min-h-screen flex flex-col gap-20 bg-black/50">
    <Hero />
    <HowItWorks />
    <Verify />
    <SignalChain />
    <PricingTiers />
    <GetStarted />
    <Footer />
  </main>
);

export default Index;
