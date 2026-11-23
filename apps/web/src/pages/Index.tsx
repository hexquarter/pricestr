import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Verify from "@/components/Verify";
import Quickstart from "@/components/Quickstart";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import BuiltFor from "@/components/BuiltFor";
import Compare from "@/components/Compare";
import FAQ from "@/components/faq";
import Community from "@/components/Community";
import FinalCTA from "@/components/FinalCTA";

const Index = () => (
  <main className="min-h-screen bg-background text-foreground">
    <NavBar />
    <Hero />
    <div className="flex flex-col gap-32 md:gap-40 pb-32">
      <HowItWorks />
      <Quickstart />
      <Verify />
      <BuiltFor />
      <Compare />
      <Community />
      <FAQ />
      <FinalCTA />
    </div>
    <Footer />
  </main>
);

export default Index;
