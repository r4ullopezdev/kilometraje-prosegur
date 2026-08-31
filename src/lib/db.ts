import path from 'path';
import fs from 'fs';

// Database file lives at /var/db/km.db in production, or ./.data/km.db in dev
const DB_DIR = process.env.KM_DB_DIR ?? path.join(process.cwd(), '.data');
const DB_PATH = path.join(DB_DIR, 'km.db');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;

export function getDb() {
  if (_db) return _db;
  fs.mkdirSync(DB_DIR, { recursive: true });
  // node:sqlite is built-in since Node 22 — no native compilation needed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DatabaseSync } = require('node:sqlite');
  _db = new DatabaseSync(DB_PATH);
  _db.exec(`
    CREATE TABLE IF NOT EXISTS store (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  return _db;
}

export function kvGet<T>(key: string): T | null {
  const db = getDb();
  const row = db.prepare('SELECT value FROM store WHERE key = ?').get(key);
  return row ? JSON.parse((row as { value: string }).value) : null;
}

export function kvSet(key: string, value: unknown): void {
  const db = getDb();
  db.prepare('INSERT INTO store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(key, JSON.stringify(value));
}
