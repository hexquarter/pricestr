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
  sparkMnemonic: string;
  fastTierSats: number;
  subDurationDays: number;
  slowPollMs: number;
  fastPollMs: number;
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
  sparkMnemonic: required('SPARK_MNEMONIC'),
  fastTierSats: parseInt(optional('FAST_TIER_SATS', '1000')),
  subDurationDays: parseInt(optional('SUB_DURATION_DAYS', '30')),
  slowPollMs: parseInt(optional('PRICE_POLL_SLOW_MS', '30000')),
  fastPollMs: parseInt(optional('PRICE_POLL_FAST_MS', '10000')),
}
