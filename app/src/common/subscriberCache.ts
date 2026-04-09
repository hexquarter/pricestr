import { queryActiveSubscribers, queryAddSubscriber, queryHasFastSubscribers } from '../common/db.js';

// In-memory cache on top of SQLite for hot path checks (NIP-42 policy runs per event/filter)
const cache = new Map(); // pubkey → { tier, expiresAt }

function fromCache(pubkey: String) {
  const entry = cache.get(pubkey);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(pubkey); return null; }
  return entry;
}

export const hasFastSubscribers = queryHasFastSubscribers;

export const addSubscriber = (pubkey: string, tier: string, expiresAt: number) => {
  queryAddSubscriber(pubkey, tier, expiresAt);
  cache.set(pubkey, { tier, expiresAt });
}

export const tierSubscriber = (pubkey: string) => {
  const cached = fromCache(pubkey);
  if (cached) return cached.tier;
  return null;
}

export const isActiveSubscriber = (pubkey: string) => {
  return tierSubscriber(pubkey) !== null;
}

export const isFastSubscriber = (pubkey: string) => {
  return tierSubscriber(pubkey) === 'fast';
}

export const evictExpiredSubscribers = () => {
  cache.forEach((entry, pubkey) => {
    if (Date.now() > entry.expiresAt) {
      cache.delete(pubkey);
    }
  });
}

export const warmCache = () => {
  for (const row of queryActiveSubscribers()) {
    cache.set(row.pubkey, { tier: row.tier, expiresAt: row.expires_at * 1000 });
  }
}