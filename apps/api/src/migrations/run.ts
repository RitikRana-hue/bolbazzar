import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { query, transaction } from '../db';

interface MigrationFile {
    filename: string;
    filepath: string;
    checksum: string;
    content: string;
}

async function initializeMigrationTracking(): Promise<void> {
    const trackerPath = path.join(__dirname, 'migration-tracker.sql');
    const trackerSql = fs.readFileSync(trackerPath, 'utf-8');
    await query(trackerSql);
}

async function getExecutedMigrations(): Promise<Set<string>> {
    try {
        const result = await query('SELECT filename FROM migration_history ORDER BY executed_at');
        return new Set(result.rows.map((row: any) => row.filename));
    } catch (error) {
        // Table doesn't exist yet
        return new Set();
    }
}

function calculateChecksum(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}

function getMigrationFiles(): MigrationFile[] {
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql') && f !== 'migration-tracker.sql')
        .sort();

    return files.map(filename => {
        const filepath = path.join(migrationsDir, filename);
        const content = fs.readFileSync(filepath, 'utf-8');
        const checksum = calculateChecksum(content);

        return { filename, filepath, checksum, content };
    });
}

async function executeMigration(migration: MigrationFile): Promise<void> {
    const startTime = Date.now();

    await transaction(async (client) => {
        // Execute the migration
        await client.query(migration.content);

        // Record the migration
        const executionTime = Date.now() - startTime;
        await client.query(`
            INSERT INTO migration_history (filename, checksum, execution_time_ms)
            VALUES ($1, $2, $3)
        `, [migration.filename, migration.checksum, executionTime]);
    });
}

async function validateMigrationIntegrity(): Promise<void> {
    const result = await query(`
        SELECT filename, checksum FROM migration_history ORDER BY executed_at
    `);

    const executedMigrations = new Map(
        result.rows.map((row: any) => [row.filename, row.checksum])
    );

    const migrationFiles = getMigrationFiles();

    for (const migration of migrationFiles) {
        const executedChecksum = executedMigrations.get(migration.filename);
        if (executedChecksum && executedChecksum !== migration.checksum) {
            throw new Error(
                `Migration integrity check failed for ${migration.filename}. ` +
                `File has been modified after execution. ` +
                `Expected: ${executedChecksum}, Got: ${migration.checksum}`
            );
        }
    }
}

async function runMigrations(): Promise<void> {
    console.log('🔄 Starting database migrations...');

    try {
        // Initialize migration tracking
        await initializeMigrationTracking();
        console.log('✓ Migration tracking initialized');

        // Validate integrity of executed migrations
        await validateMigrationIntegrity();
        console.log('✓ Migration integrity validated');

        // Get list of executed migrations
        const executedMigrations = await getExecutedMigrations();

        // Get all migration files
        const migrationFiles = getMigrationFiles();

        // Filter out already executed migrations
        const pendingMigrations = migrationFiles.filter(
            migration => !executedMigrations.has(migration.filename)
        );

        if (pendingMigrations.length === 0) {
            console.log('✓ No pending migrations');
            return;
        }

        console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
        pendingMigrations.forEach(m => console.log(`  - ${m.filename}`));

        // Execute pending migrations
        for (const migration of pendingMigrations) {
            console.log(`🔄 Executing migration: ${migration.filename}`);
            await executeMigration(migration);
            console.log(`✓ ${migration.filename} completed`);
        }

        console.log('🎉 All migrations completed successfully');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// CLI execution
if (require.main === module) {
    runMigrations()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

export { runMigrations };
