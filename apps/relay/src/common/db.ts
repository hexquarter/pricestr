import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';

mkdirSync('./data', { recursive: true });

const db = new Database('./data/pricestr.db');
export { db }

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

