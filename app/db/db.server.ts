import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database(process.env.DATABASE_URL || './local.db');
export const db = drizzle(sqlite, { schema });

// Ensure tables exist (matches schema.ts)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    raw_input TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    next_node TEXT,
    prev_node TEXT,
    timestamp INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS attributes (
    id TEXT PRIMARY KEY,
    node_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
  );
`);

// Clear one-sided chain links so every remaining link is mutual. Older
// versions could leave a node pointing at a neighbor that no longer pointed
// back (e.g. after inserting an idea mid-chain), which hid it from the layout.
sqlite.exec(`
  UPDATE nodes SET next_node = NULL
  WHERE next_node IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM nodes t WHERE t.id = nodes.next_node AND t.prev_node = nodes.id);

  UPDATE nodes SET prev_node = NULL
  WHERE prev_node IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM nodes s WHERE s.id = nodes.prev_node AND s.next_node = nodes.id);
`);
