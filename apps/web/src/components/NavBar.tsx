import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Docs", href: "/docs" },
  { label: "Protocol", href: "/#how-it-works" },
  { label: "Built for", href: "/#built-for" },
  { label: "Compare", href: "/#compare" },
  { label: "FAQ", href: "/#faq" }
];

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || open
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
          <Button asChild size="sm" className="hidden md:inline-flex font-mono uppercase text-[11px] tracking-widest">
            <a href="/#get-started">Get started</a>
          </Button>
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md">
          <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors border-b border-border/20 last:border-b-0"
              >
                {l.label}
              </a>
            ))}
            <Button asChild size="sm" className="mt-3 font-mono uppercase text-[11px] tracking-widest">
              <a href="/#get-started" onClick={() => setOpen(false)}>Get started</a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default NavBar;
