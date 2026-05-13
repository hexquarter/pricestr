import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const links = [
  { label: "Protocol", href: "#how-it-works" },
  { label: "Verify", href: "#verify" },
  { label: "Pipeline", href: "#pipeline" },
  { label: "Pricing", href: "#pricing" },
  { label: "Integrate", href: "#get-started" },
];

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-background/70 border-b border-border/40"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-title uppercase text-base font-[900] tracking-widest">
          Price<span className="text-violet-400">str</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#get-started"
            className="hidden sm:inline-flex text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </a>
          <Button asChild size="sm" variant="outline" className="font-mono uppercase text-[11px] tracking-widest">
            <a href="#pricing">Subscribe</a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
