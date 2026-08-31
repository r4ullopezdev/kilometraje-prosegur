import path from 'path';
import fs from 'fs';

// Database file lives at /var/db/kilometraje.db in production, or ./.data/km.db in dev
const DB_DIR = process.env.KM_DB_DIR ?? path.join(process.cwd(), '.data');
const DB_PATH = path.join(DB_DIR, 'km.db');

let _db: ReturnType<typeof import('better-sqlite3')> | null = null;

export function getDb() {
  if (_db) return _db;
  fs.mkdirSync(DB_DIR, { recursive: true });
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require('better-sqlite3');
  _db = new Database(DB_PATH) as ReturnType<typeof import('better-sqlite3')>;
  (_db as any).exec(`
    CREATE TABLE IF NOT EXISTS store (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  return _db;
}

export function kvGet<T>(key: string): T | null {
  const db = getDb();
  const row = (db as any).prepare('SELECT value FROM store WHERE key = ?').get(key);
  return row ? JSON.parse(row.value) : null;
}

export function kvSet(key: string, value: unknown): void {
  const db = getDb();
  (db as any)
    .prepare('INSERT INTO store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(key, JSON.stringify(value));
}
