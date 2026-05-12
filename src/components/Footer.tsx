const links = [
  { label: "Docs", href: "#docs" },
  { label: "GitHub", href: "#github" },
  { label: "Nostr pubkey", href: "#get-started" },
  { label: "Status", href: "#status" },
];

const Footer = () => (
  <footer className="border-t border-border py-12">
    <div className="max-w-5xl mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="font-title uppercase text-lg font-bold tracking-widest font-[900]">Price<span className="text-violet-400">str</span></span>
        <nav className="flex items-center gap-6">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
      <p className="text-xs text-muted-foreground/80 text-center mt-8 font-mono uppercase">
        Built for the Nostr ecosystem.
      </p>
    </div>
  </footer>
);

export default Footer;
