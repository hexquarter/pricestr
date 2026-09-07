export const Code: React.FC<{ children: React.ReactNode; lang?: string }> = ({ children, lang = "ts" }) => (
  <div className="border border-border/40 bg-[#0A0A0A] mt-2">
    <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
      <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">{lang}</span>
    </div>
    <pre className="p-5 overflow-x-auto text-xs leading-[1.7] text-white/80 font-mono">
      <code>{children}</code>
    </pre>
  </div>
);