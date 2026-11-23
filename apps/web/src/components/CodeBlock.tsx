import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { toast } from "sonner";

export type CodeLang = "ts" | "python" | "bash" | "json";

type Token = { text: string; cls?: string };

const TS_KEYWORDS = new Set([
  "import", "from", "export", "const", "let", "var", "await", "async", "new",
  "return", "function", "while", "for", "if", "else", "true", "false", "null", "undefined",
]);
const TS_BUILTINS = new Set([
  "Relay", "SimplePool", "verifyEvent", "NostrEvent", "console", "log", "JSON", "parse",
  "stringify", "Date", "Math", "Number", "String", "Promise",
]);
const PY_KEYWORDS = new Set([
  "import", "from", "def", "class", "while", "for", "if", "elif", "else", "in",
  "True", "False", "None", "print", "return", "and", "or", "not",
]);
const PY_BUILTINS = new Set(["json", "websocket", "loads", "dumps", "create_connection", "recv", "send"]);
const BASH_KEYWORDS = new Set(["npm", "pip", "yarn", "curl", "websocat", "docker", "run", "install", "cargo"]);

const C = {
  comment: "text-white/30 italic",
  keyword: "text-violet-300",
  builtin: "text-sky-300",
  string: "text-amber-200/90",
  number: "text-emerald-300/90",
  key: "text-violet-300/80",
};

function tokenizeGeneric(line: string, lang: Exclude<CodeLang, "json">): Token[] {
  const trimmed = line.trimStart();
  const commentPrefix = lang === "ts" ? "//" : "#";
  if (trimmed.startsWith(commentPrefix)) return [{ text: line, cls: C.comment }];

  const tokens: Token[] = [];
  let rest = line;

  if (lang === "bash") {
    const m = rest.match(/^(\s*)([a-z][a-z-]*)\b/);
    if (m && BASH_KEYWORDS.has(m[2])) {
      tokens.push({ text: m[1] }, { text: m[2], cls: C.keyword });
      rest = rest.slice(m[0].length);
    }
  }

  const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(`(?:[^`\\]|\\.)*`)|(-?\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z0-9_]*)/g;
  let last = 0;
  for (const m of rest.matchAll(re)) {
    if (m.index! > last) tokens.push({ text: rest.slice(last, m.index) });
    if (m[1] || m[2]) tokens.push({ text: m[1] ?? m[2]!, cls: C.string });
    else if (m[3]) tokens.push({ text: m[3], cls: C.number });
    else {
      const word = m[4]!;
      const keywords = lang === "ts" ? TS_KEYWORDS : lang === "python" ? PY_KEYWORDS : BASH_KEYWORDS;
      const builtins = lang === "ts" ? TS_BUILTINS : PY_BUILTINS;
      if (keywords.has(word)) tokens.push({ text: word, cls: C.keyword });
      else if (builtins.has(word)) tokens.push({ text: word, cls: C.builtin });
      else tokens.push({ text: word });
    }
    last = m.index! + m[0].length;
  }
  if (last < rest.length) tokens.push({ text: rest.slice(last) });
  return tokens;
}

function tokenizeJson(line: string): Token[] {
  const tokens: Token[] = [];
  const re = /("(?:[^"\\]|\\.)*")(\s*:)|("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?)|\b(true|false|null)\b/g;
  let last = 0;
  for (const m of line.matchAll(re)) {
    if (m.index! > last) tokens.push({ text: line.slice(last, m.index) });
    if (m[1]) tokens.push({ text: m[1], cls: C.key }, { text: m[2]! });
    else if (m[3]) tokens.push({ text: m[3], cls: C.string });
    else if (m[4]) tokens.push({ text: m[4], cls: C.number });
    else tokens.push({ text: m[5]!, cls: C.keyword });
    last = m.index! + m[0].length;
  }
  if (last < line.length) tokens.push({ text: line.slice(last) });
  return tokens;
}

interface CodeBlockProps {
  title: string;
  code: string;
  lang?: CodeLang;
  footer?: React.ReactNode;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ title, code, lang = "ts", footer, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const lines = code.split("\n").map((line) =>
    lang === "json" ? tokenizeJson(line) : tokenizeGeneric(line, lang)
  );

  return (
    <div className={`border border-border/40 bg-[#0A0A0A] flex flex-col ${className}`}>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-3 text-[11px] text-white/50 font-mono">
          <Terminal className="h-3.5 w-3.5" />
          {title}
          <span className="text-white/25 uppercase">{lang}</span>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
            toast.info("Copied to clipboard");
          }}
          className="text-white/40 hover:text-white text-[11px] font-mono uppercase tracking-widest flex items-center gap-1.5"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          copy
        </button>
      </div>
      <pre className="flex-1 p-5 md:p-6 overflow-x-auto text-xs leading-[1.8] text-white/80 font-mono">
        <code>
          {lines.map((tokens, i) => (
            <div key={i}>
              {tokens.map((t, j) =>
                t.cls ? (
                  <span key={j} className={t.cls}>{t.text}</span>
                ) : (
                  <span key={j}>{t.text}</span>
                )
              )}
            </div>
          ))}
        </code>
      </pre>
      {footer}
    </div>
  );
};

export default CodeBlock;
