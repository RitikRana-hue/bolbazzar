import fs from 'fs';
import path from 'path';
import { query } from '../db';

async function runMigrations(): Promise<void> {
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));

    for (const file of files.sort()) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');

        console.log(`Running migration: ${file}`);
        await query(sql);
        console.log(`✓ ${file} completed`);
    }

    console.log('All migrations completed');
    process.exit(0);
}

runMigrations().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});
