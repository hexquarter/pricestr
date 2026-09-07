interface SectionHeadProps {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  align?: "left" | "center";
}

export const SectionHead: React.FC<SectionHeadProps> = ({ eyebrow, title, lead, align = "left" }) => (
  <div className="flex flex-col gap-6">
    <div className="flex justify-between text-[10px] text-primary uppercase font-mono tracking-widest border-b border-t border-border/40 py-2 items-center gap-5">
      <span>// {eyebrow}</span>
      <span className="text-muted-foreground/60">SIG · {String(Math.floor(Math.random() * 9000) + 1000)}</span>
    </div>
    <div className={`flex flex-col md:flex-row gap-8 md:items-end ${align === "center" ? "items-center text-center" : "justify-between"}`}>
      <h2 className="text-5xl md:text-7xl tracking-tight font-[900] font-title uppercase leading-[0.95]">
        {title}
      </h2>
      {lead && (
        <p className="md:max-w-md text-sm text-muted-foreground leading-relaxed font-mono">
          {lead}
        </p>
      )}
    </div>
  </div>
);
