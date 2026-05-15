const links = [
  { label: "Docs", href: "/docs" },
  { label: "GitHub", href: "https://github.com" },
  { label: "Pubkey", href: "/#get-started" },
];

const Footer = () => (
  <footer className="border-t border-border/40 mt-12">
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-title uppercase text-xl font-[900] tracking-widest">
            Price<span className="text-violet-400">str</span>
          </span>
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            The signed Bitcoin price feed for Nostr
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-6">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="border-t border-border/40 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
          Built for the Nostr ecosystem
        </p>
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
          © {new Date().getFullYear()} By <a href="https://hexquarter.com" target="_blank" className="underline">HexQuarter</a>. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
