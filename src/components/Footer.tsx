const links = [
  { label: "Docs", href: "#docs" },
  { label: "GitHub", href: "#github" },
  { label: "Nostr pubkey", href: "#get-started" },
  { label: "Status", href: "#status" },
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
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
          </span>
          All systems operational
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
