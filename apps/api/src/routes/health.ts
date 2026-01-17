import { Router, Request, Response } from 'express';
import { getDatabaseHealth, getDatabaseStats } from '../db';
import config from '../config';

const router = Router();

interface HealthCheckResult {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    uptime: number;
    version: string;
    environment: string;
    services: {
        database: {
            status: 'healthy' | 'unhealthy';
            latency?: number;
            error?: string;
            pool?: {
                totalCount: number;
                idleCount: number;
                waitingCount: number;
            };
        };
        redis?: {
            status: 'healthy' | 'unhealthy';
            latency?: number;
            error?: string;
        };
    };
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    cpu: {
        usage: number;
    };
}

// Simple health check
router.get('/', async (req: Request, res: Response) => {
    try {
        const dbHealth = getDatabaseHealth();
        const dbStats = await getDatabaseStats();

        const memoryUsage = process.memoryUsage();
        const totalMemory = memoryUsage.heapTotal + memoryUsage.external;
        const usedMemory = memoryUsage.heapUsed;

        const healthResult: HealthCheckResult = {
            status: dbHealth.isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            environment: config.nodeEnv,
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
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// Detailed health check
router.get('/detailed', async (req: Request, res: Response) => {
    try {
        const dbHealth = getDatabaseHealth();
        const dbStats = await getDatabaseStats();

        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();

        const detailedHealth = {
            status: dbHealth.isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            environment: config.nodeEnv,
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
                            min: config.database.pool.min,
                            max: config.database.pool.max,
                            idleTimeoutMs: config.database.pool.idleTimeoutMillis,
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
                nodeEnv: config.nodeEnv,
                port: config.server.port,
                logLevel: config.logging.level,
                rateLimiting: config.security.rateLimiting,
            },
        };

        const statusCode = detailedHealth.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(detailedHealth);
    } catch (error) {
        console.error('Detailed health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req: Request, res: Response) => {
    try {
        const dbHealth = getDatabaseHealth();

        if (dbHealth.isHealthy) {
            res.status(200).json({
                status: 'ready',
                timestamp: new Date().toISOString(),
            });
        } else {
            res.status(503).json({
                status: 'not ready',
                timestamp: new Date().toISOString(),
                reason: 'Database not healthy',
            });
        }
    } catch (error) {
        res.status(503).json({
            status: 'not ready',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// Liveness probe (for Kubernetes)
router.get('/live', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

export default router;