import { useEffect, useState } from "react";

const Hero = () => {
  const [showWave, setShowWave] = useState(false);

  useEffect(() => {
    setShowWave(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background signal waves */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-[600px] h-[600px] rounded-full border border-primary/10 signal-wave transition-opacity duration-1000 ${showWave ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute w-[800px] h-[800px] rounded-full border border-primary/5 signal-wave transition-opacity duration-1000 delay-300 ${showWave ? "opacity-100" : "opacity-0"}`}
          style={{ animationDelay: "1s" }}
        />
        <div
          className={`absolute w-[1000px] h-[1000px] rounded-full border border-primary/[0.03] signal-wave transition-opacity duration-1000 delay-500 ${showWave ? "opacity-100" : "opacity-0"}`}
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 font-mono">
          Sigrate
        </h1>
        <p className="text-xl md:text-2xl font-light mb-3">
          <span className="text-primary">The signed Bitcoin price feed</span>{" "}
          <span className="text-foreground">for Nostr</span>
        </p>
        <p className="text-muted-foreground text-sm md:text-base mb-12 tracking-wide">
          Cryptographically verified. Relay-distributed. Publicly auditable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#get-started"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 glow-orange"
          >
            View the pubkey
          </a>
          <a
            href="#docs"
            className="inline-flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-border hover:decoration-primary"
          >
            Read the docs →
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
