import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';

mkdirSync('./data', { recursive: true });

const db = new Database('./data/pricestr.db');
export { db }

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Subscriber cache
  CREATE TABLE IF NOT EXISTS subscribers (
    pubkey     TEXT PRIMARY KEY,
    tier       TEXT NOT NULL,  -- 'slow' | 'fast'
    expires_at INTEGER NOT NULL
  );

  -- Payment invoices
  CREATE TABLE IF NOT EXISTS invoices (
    invoice   TEXT PRIMARY KEY,
    pubkey         TEXT NOT NULL,
    amount_sat     INTEGER NOT NULL,
    status         TEXT NOT NULL DEFAULT 'pending',
    inv_expires_at INTEGER NOT NULL,
    created_at     INTEGER NOT NULL,
    FOREIGN KEY (pubkey) REFERENCES subscribers(pubkey)
  );

  CREATE INDEX IF NOT EXISTS idx_invoices_pubkey ON invoices(pubkey);
`);

type Subscriber = {
    pubkey: string;
    tier: string;
    expires_at: number;
}

type Invoice = {
    invoice: string;
    pubkey: string;
    amount_sat: number;
    status: string;
    inv_expires_at: number;
    created_at: number;
}

export const queryHasFastSubscribers = () => {
    const now = Math.floor(Date.now() / 1000);
    return !!db.prepare(
        "SELECT 1 FROM subscribers WHERE tier = 'fast' AND expires_at > ? LIMIT 1"
    ).get(now);
}

export const queryAddSubscriber = (pubkey: string, tier: string, expiresAt: number) => {
    db.prepare(`
      INSERT INTO subscribers (pubkey, tier, expires_at)
      VALUES (@pubkey, @tier, @expires_at)
      ON CONFLICT(pubkey) DO UPDATE SET tier = @tier, expires_at = @expires_at
    `).run({ pubkey, tier, expires_at: Math.floor(expiresAt / 1000) });
}

export const queryGetSubscriber = (pubkey: string): Subscriber | null => {
    const now = Math.floor(Date.now() / 1000);
    return db.prepare(
        'SELECT * FROM subscribers WHERE pubkey = ? AND expires_at > ?'
    ).get(pubkey, now) as Subscriber | null;
}

export const evictExpiredSubscribers = () => {
    const now = Math.floor(Date.now() / 1000);
    db.prepare('DELETE FROM subscribers WHERE expires_at < ?').run(now);
}

export const queryAddInvoice = (invoice: string, pubkey: string, amountSat: number, invExpiresAt: number) => {
    db.prepare(`
      INSERT INTO invoices (invoice, pubkey, amount_sat, inv_expires_at, created_at)
      VALUES (@invoice, @pubkey, @amount_sat, @inv_expires_at, @created_at)
    `).run({
        invoice,
        pubkey,
        amount_sat: amountSat,
        inv_expires_at: Math.floor(invExpiresAt / 1000),
        created_at: Math.floor(Date.now() / 1000),
    });
}

export const queryGetInvoice = (invoice: string): Invoice | null => {
    return db.prepare('SELECT * FROM invoices WHERE invoice = ?').get(invoice) as Invoice | null;
}

export const queryMarkInvoicePaid = (invoice: string) => {
    db.prepare("UPDATE invoices SET status = 'paid' WHERE invoice = ?").run(invoice);
}

export const evictExpiredInvoices = () => {
    const now = Math.floor(Date.now() / 1000);
    db.prepare(`
      UPDATE invoices SET status = 'expired'
      WHERE status = 'pending' AND inv_expires_at < ?
    `).run(now);
}

export const queryActiveSubscribers = (): Subscriber[] => {
    const now = Math.floor(Date.now() / 1000);
    const rows = db?.prepare(
        'SELECT * FROM subscribers WHERE expires_at > ?'
    ).all(now) ?? [];
    return rows as Subscriber[];
}