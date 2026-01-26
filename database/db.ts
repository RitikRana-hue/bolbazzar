import { Pool, PoolClient, PoolConfig } from 'pg';
import config from './config';

interface DatabaseHealth {
    isHealthy: boolean;
    latency?: number;
    error?: string;
    timestamp: Date;
}

class DatabaseManager {
    private pool: Pool;
    private healthStatus: DatabaseHealth = {
        isHealthy: false,
        timestamp: new Date()
    };

    constructor() {
        const poolConfig: PoolConfig = {
            connectionString: config.database.url,
            min: config.database.pool.min,
            max: config.database.pool.max,
            idleTimeoutMillis: config.database.pool.idleTimeoutMillis,
            connectionTimeoutMillis: config.database.pool.connectionTimeoutMillis,
            ssl: config.database.ssl,
        };

        this.pool = new Pool(poolConfig);
        this.setupEventHandlers();
        this.startHealthChecks();
    }

    private setupEventHandlers(): void {
        this.pool.on('connect', (client) => {
            console.log('✅ New database client connected');
            this.healthStatus = {
                isHealthy: true,
                timestamp: new Date()
            };
        });

        this.pool.on('error', (err, client) => {
            console.error('❌ Database pool error:', err);
            this.healthStatus = {
                isHealthy: false,
                error: err.message,
                timestamp: new Date()
            };
        });

        this.pool.on('acquire', () => {
            console.log('🔄 Database client acquired from pool');
        });

        this.pool.on('remove', () => {
            console.log('🗑️ Database client removed from pool');
        });
    }

    private startHealthChecks(): void {
        // Initial health check
        this.performHealthCheck();

        // Periodic health checks
        setInterval(() => {
            this.performHealthCheck();
        }, config.monitoring.healthCheck.intervalMs);
    }

    private async performHealthCheck(): Promise<void> {
        const startTime = Date.now();

        try {
            const client = await this.pool.connect();
            try {
                await client.query('SELECT 1');
                const latency = Date.now() - startTime;

                this.healthStatus = {
                    isHealthy: true,
                    latency,
                    timestamp: new Date()
                };

                console.log(`💚 Database health check passed (${latency}ms)`);
            } finally {
                client.release();
            }
        } catch (error) {
            this.healthStatus = {
                isHealthy: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };

            console.error('💔 Database health check failed:', error);
        }
    }

    public async query(text: string, params?: any[]): Promise<any> {
        const startTime = Date.now();

        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - startTime;

            if (config.logging.level === 'debug') {
                console.log(`🔍 Query executed in ${duration}ms:`, text.substring(0, 100));
            }

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ Query failed after ${duration}ms:`, {
                query: text.substring(0, 100),
                error: error instanceof Error ? error.message : 'Unknown error',
                params: params ? '[REDACTED]' : undefined
            });
            throw error;
        }
    }

    public async getClient(): Promise<PoolClient> {
        return this.pool.connect();
    }

    public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();
        const startTime = Date.now();

        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');

            const duration = Date.now() - startTime;
            if (config.logging.level === 'debug') {
                console.log(`✅ Transaction completed in ${duration}ms`);
            }

            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            const duration = Date.now() - startTime;
            console.error(`🔄 Transaction rolled back after ${duration}ms:`, error);
            throw error;
        } finally {
            client.release();
        }
    }

    public getHealthStatus(): DatabaseHealth {
        return { ...this.healthStatus };
    }

    public async getPoolStats(): Promise<{
        totalCount: number;
        idleCount: number;
        waitingCount: number;
    }> {
        return {
            totalCount: this.pool.totalCount,
            idleCount: this.pool.idleCount,
            waitingCount: this.pool.waitingCount,
        };
    }

    public async close(): Promise<void> {
        console.log('🔌 Closing database connection pool...');
        await this.pool.end();
        console.log('✅ Database connection pool closed');
    }
}

// Create singleton instance
const dbManager = new DatabaseManager();

// Export convenience functions
export const query = (text: string, params?: any[]) => dbManager.query(text, params);
export const getClient = () => dbManager.getClient();
export const transaction = <T>(callback: (client: PoolClient) => Promise<T>) =>
    dbManager.transaction(callback);

// Export manager for health checks and stats
export const getDatabaseHealth = () => dbManager.getHealthStatus();
export const getDatabaseStats = () => dbManager.getPoolStats();
export const closeDatabaseConnection = () => dbManager.close();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, closing database connections...');
    await dbManager.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, closing database connections...');
    await dbManager.close();
    process.exit(0);
});

export default dbManager;