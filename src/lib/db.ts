import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.env.DATA_DIR || process.cwd(), 'data', 'family-planner.db');

const DEFAULT_PASSCODE = process.env.FAMILY_PASSCODE || 'family123';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    seedData();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS passcode (
      id INTEGER PRIMARY KEY DEFAULT 1,
      code TEXT NOT NULL DEFAULT 'family123'
    );

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#3B82F6',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS board_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      content TEXT NOT NULL,
      member_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_member_date ON plans(member_id, date);
    CREATE INDEX IF NOT EXISTS idx_board_items_date ON board_items(date);
  `);
}

function seedData() {
  const passcodeExists = db.prepare('SELECT id FROM passcode WHERE id = 1').get();
  if (!passcodeExists) {
    db.prepare('INSERT INTO passcode (id, code) VALUES (1, ?)').run(DEFAULT_PASSCODE);
  }
}

export function verifyPasscode(code: string): boolean {
  const d = getDb();
  const row = d.prepare('SELECT code FROM passcode WHERE id = 1').get() as { code: string } | undefined;
  return row?.code === code;
}

export function updatePasscode(code: string): void {
  const d = getDb();
  d.prepare('UPDATE passcode SET code = ? WHERE id = 1').run(code);
}
