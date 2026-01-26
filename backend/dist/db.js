"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabaseConnection = exports.getDatabaseStats = exports.getDatabaseHealth = exports.transaction = exports.getClient = exports.query = void 0;
const pg_1 = require("pg");
const config_1 = __importDefault(require("./config"));
class DatabaseManager {
    constructor() {
        this.healthStatus = {
            isHealthy: false,
            timestamp: new Date()
        };
        const poolConfig = {
            connectionString: config_1.default.database.url,
            min: config_1.default.database.pool.min,
            max: config_1.default.database.pool.max,
            idleTimeoutMillis: config_1.default.database.pool.idleTimeoutMillis,
            connectionTimeoutMillis: config_1.default.database.pool.connectionTimeoutMillis,
            ssl: config_1.default.database.ssl,
        };
        this.pool = new pg_1.Pool(poolConfig);
        this.setupEventHandlers();
        this.startHealthChecks();
    }
    setupEventHandlers() {
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
    startHealthChecks() {
        // Initial health check
        this.performHealthCheck();
        // Periodic health checks
        setInterval(() => {
            this.performHealthCheck();
        }, config_1.default.monitoring.healthCheck.intervalMs);
    }
    async performHealthCheck() {
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
            }
            finally {
                client.release();
            }
        }
        catch (error) {
            this.healthStatus = {
                isHealthy: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
            console.error('💔 Database health check failed:', error);
        }
    }
    async query(text, params) {
        const startTime = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - startTime;
            if (config_1.default.logging.level === 'debug') {
                console.log(`🔍 Query executed in ${duration}ms:`, text.substring(0, 100));
            }
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ Query failed after ${duration}ms:`, {
                query: text.substring(0, 100),
                error: error instanceof Error ? error.message : 'Unknown error',
                params: params ? '[REDACTED]' : undefined
            });
            throw error;
        }
    }
    async getClient() {
        return this.pool.connect();
    }
    async transaction(callback) {
        const client = await this.pool.connect();
        const startTime = Date.now();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            const duration = Date.now() - startTime;
            if (config_1.default.logging.level === 'debug') {
                console.log(`✅ Transaction completed in ${duration}ms`);
            }
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            const duration = Date.now() - startTime;
            console.error(`🔄 Transaction rolled back after ${duration}ms:`, error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    getHealthStatus() {
        return { ...this.healthStatus };
    }
    async getPoolStats() {
        return {
            totalCount: this.pool.totalCount,
            idleCount: this.pool.idleCount,
            waitingCount: this.pool.waitingCount,
        };
    }
    async close() {
        console.log('🔌 Closing database connection pool...');
        await this.pool.end();
        console.log('✅ Database connection pool closed');
    }
}
// Create singleton instance
const dbManager = new DatabaseManager();
// Export convenience functions
const query = (text, params) => dbManager.query(text, params);
exports.query = query;
const getClient = () => dbManager.getClient();
exports.getClient = getClient;
const transaction = (callback) => dbManager.transaction(callback);
exports.transaction = transaction;
// Export manager for health checks and stats
const getDatabaseHealth = () => dbManager.getHealthStatus();
exports.getDatabaseHealth = getDatabaseHealth;
const getDatabaseStats = () => dbManager.getPoolStats();
exports.getDatabaseStats = getDatabaseStats;
const closeDatabaseConnection = () => dbManager.close();
exports.closeDatabaseConnection = closeDatabaseConnection;
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
exports.default = dbManager;
//# sourceMappingURL=db.js.map