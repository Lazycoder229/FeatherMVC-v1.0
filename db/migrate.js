import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function getConn() {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true
  });
}

async function ensureTable(conn) {
  await conn.execute(`CREATE TABLE IF NOT EXISTS _migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
}

async function appliedSet(conn) {
  const [rows] = await conn.execute('SELECT name FROM _migrations ORDER BY id');
  return new Set(rows.map(r => r.name));
}

async function up() {
  const files = readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  const conn = await getConn();
  try {
    await ensureTable(conn);
    const done = await appliedSet(conn);
    for (const f of files) {
      if (done.has(f)) continue;
      const sql = readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8');
      console.log('> applying', f);
      await conn.query(sql);
      await conn.execute('INSERT INTO _migrations (name) VALUES (?)', [f]);
    }
    console.log('Migrations up-to-date.');
  } finally {
    await conn.end();
  }
}

if (process.argv[2] === 'up') up();
else up(); // default: up
