import { bech32 } from '@scure/base';
import 'dotenv/config';
import { getPublicKey } from 'nostr-tools';

function required(key: string) {
  const val = process.env[key];
  if (!val) throw new Error(`Required env var ${key} is not set`);
  return val;
}

function optional(key: string, fallback: string) {
  return process.env[key] || fallback;
}

type Config = {
  port: number;
  relayNsec: string;
  relayName: string;
  relayDesc: string;
  relayPrivkey: Uint8Array;
  relayPubkey: string;
  pollMs: number;
}

const nsec = required('RELAY_NSEC');
const { bytes: privKey } = bech32.decodeToBytes(nsec);
const pubkey = getPublicKey(privKey);

export const config: Config = {
  port: parseInt(optional('PORT', '7777')),
  relayNsec: required('RELAY_NSEC'),
  relayName: optional('RELAY_NAME', 'Pricestr'),
  relayDesc: optional('RELAY_DESC', 'Bitcoin price oracle relay'),
  relayPrivkey: privKey,
  relayPubkey: pubkey,
  pollMs: parseInt(optional('PRICE_POLL_MS', '10000'))
}
