import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Verify from "@/components/Verify";
import GetStarted from "@/components/GetStarted";
import Footer from "@/components/Footer";
import SignalChain from "@/components/SignalChain";
import NavBar from "@/components/NavBar";
import BuiltFor from "@/components/BuiltFor";
import Compare from "@/components/Compare";
import FAQ from "@/components/faq";
import Testimonials from "@/components/Testimonials";
import Funding from "@/components/Funding";
import Community from "@/components/Community";

const Index = () => (
  <main className="min-h-screen bg-background text-foreground">
    <NavBar />
    <Hero />
    <div className="flex flex-col gap-32 md:gap-40 pb-32">
      <BuiltFor />
      <HowItWorks />
      {/* <Testimonials /> */}
      <SignalChain />
      <Verify />
      <Compare />
      <Community />
      <Funding />
      <FAQ />
      <GetStarted />
    </div>
    <Footer />
  </main>
);

export default Index;
