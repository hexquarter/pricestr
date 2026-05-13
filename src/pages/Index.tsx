import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Verify from "@/components/Verify";
import PricingTiers from "@/components/PricingTiers";
import GetStarted from "@/components/GetStarted";
import Footer from "@/components/Footer";
import SignalChain from "@/components/SignalChain";
import NavBar from "@/components/NavBar";

const Index = () => (
  <main className="min-h-screen bg-background text-foreground">
    <NavBar />
    <Hero />
    <div className="flex flex-col gap-32 md:gap-40 pb-32">
      <HowItWorks />
      <Verify />
      <SignalChain />
      <PricingTiers />
      <GetStarted />
    </div>
    <Footer />
  </main>
);

export default Index;
