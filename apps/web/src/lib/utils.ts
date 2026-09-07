import { bech32 } from "bech32";
import { clsx, type ClassValue } from "clsx";
import { bytesToHex } from "nostr-tools/utils";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function npubToPubkey(npub: string): string {
  const decoded = bech32.decode(npub);
  const w = bech32.fromWords(decoded.words)
  return bytesToHex(Uint8Array.from(w));
}

export function copy (val: string, label: string) {
  navigator.clipboard.writeText(val);
  toast.success(`${label} copied`);
};

export function shortenString(val: string) {
  return `${val.slice(0, 6)}...${val.slice(val.length-6)}`
}