"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const config_1 = __importDefault(require("../config"));
const router = (0, express_1.Router)();
// Simple health check
router.get('/', async (req, res) => {
    try {
        const dbHealth = (0, db_1.getDatabaseHealth)();
        const dbStats = await (0, db_1.getDatabaseStats)();
        const memoryUsage = process.memoryUsage();
        const totalMemory = memoryUsage.heapTotal + memoryUsage.external;
        const usedMemory = memoryUsage.heapUsed;
        const healthResult = {
            status: dbHealth.isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            environment: config_1.default.nodeEnv,
            services: {
                database: {
                    status: dbHealth.isHealthy ? 'healthy' : 'unhealthy',
                    latency: dbHealth.latency,
                    error: dbHealth.error,
                    pool: dbStats,
                },
            },
            memory: {
                used: usedMemory,
                total: totalMemory,
                percentage: Math.round((usedMemory / totalMemory) * 100),
            },
            cpu: {
                usage: process.cpuUsage().user / 1000000, // Convert to seconds
            },
        };
        const statusCode = healthResult.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(healthResult);
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Detailed health check
router.get('/detailed', async (req, res) => {
    try {
        const dbHealth = (0, db_1.getDatabaseHealth)();
        const dbStats = await (0, db_1.getDatabaseStats)();
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        const detailedHealth = {
            status: dbHealth.isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            environment: config_1.default.nodeEnv,
            node: {
                version: process.version,
                platform: process.platform,
                arch: process.arch,
            },
            services: {
                database: {
                    status: dbHealth.isHealthy ? 'healthy' : 'unhealthy',
                    latency: dbHealth.latency,
                    error: dbHealth.error,
                    lastCheck: dbHealth.timestamp,
                    pool: {
                        ...dbStats,
                        config: {
                            min: config_1.default.database.pool.min,
                            max: config_1.default.database.pool.max,
                            idleTimeoutMs: config_1.default.database.pool.idleTimeoutMillis,
                        },
                    },
                },
            },
            memory: {
                rss: memoryUsage.rss,
                heapTotal: memoryUsage.heapTotal,
                heapUsed: memoryUsage.heapUsed,
                external: memoryUsage.external,
                arrayBuffers: memoryUsage.arrayBuffers,
                percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
            },
            cpu: {
                user: cpuUsage.user / 1000000, // Convert to seconds
                system: cpuUsage.system / 1000000,
            },
            config: {
                nodeEnv: config_1.default.nodeEnv,
                port: config_1.default.server.port,
                logLevel: config_1.default.logging.level,
                rateLimiting: config_1.default.security.rateLimiting,
            },
        };
        const statusCode = detailedHealth.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(detailedHealth);
    }
    catch (error) {
        console.error('Detailed health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Readiness probe (for Kubernetes)
router.get('/ready', async (req, res) => {
    try {
        const dbHealth = (0, db_1.getDatabaseHealth)();
        if (dbHealth.isHealthy) {
            res.status(200).json({
                status: 'ready',
                timestamp: new Date().toISOString(),
            });
        }
        else {
            res.status(503).json({
                status: 'not ready',
                timestamp: new Date().toISOString(),
                reason: 'Database not healthy',
            });
        }
    }
    catch (error) {
        res.status(503).json({
            status: 'not ready',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Liveness probe (for Kubernetes)
router.get('/live', (req, res) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
exports.default = router;
//# sourceMappingURL=health.js.map