import { Pool } from 'pg';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function runMigrations(pool?: Pool) {
  const db = pool ?? new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS migrations (id text PRIMARY KEY)`);
    const migrationsDir = path.resolve('migrations');
    const files = (await readdir(migrationsDir)).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      const { rows } = await db.query('SELECT 1 FROM migrations WHERE id = $1', [file]);
      if (rows.length) continue;
      const sql = await readFile(path.join(migrationsDir, file), 'utf8');
      await db.query('BEGIN');
      try {
        await db.query(sql);
        await db.query('INSERT INTO migrations(id) VALUES($1)', [file]);
        await db.query('COMMIT');
        console.log(`applied ${file}`);
      } catch (err) {
        await db.query('ROLLBACK');
        throw err;
      }
    }
  } finally {
    if (!pool) {
      await db.end();
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
