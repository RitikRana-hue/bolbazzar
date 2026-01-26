import { Router } from 'express';
import { queueManager } from '../queues';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All queue endpoints require admin access
router.use(authenticateToken);
// TODO: Add requireRole(['admin']) middleware when RBAC is implemented

// Get queue statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await queueManager.getQueueStats();
        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error: unknown) {
        console.error('Error getting queue stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get queue statistics'
        });
    }
});

// Get detailed queue information
router.get('/:queueName', async (req, res) => {
    try {
        const { queueName } = req.params;
        const queue = queueManager.getQueue(queueName);

        if (!queue) {
            return res.status(404).json({
                success: false,
                error: 'Queue not found'
            });
        }

        const [waiting, active, completed, failed, delayed] = await Promise.all([
            queue.getWaiting(),
            queue.getActive(),
            queue.getCompleted(0, 10), // Last 10 completed
            queue.getFailed(0, 10), // Last 10 failed
            queue.getDelayed()
        ]);

        res.json({
            success: true,
            data: {
                name: queueName,
                counts: {
                    waiting: waiting.length,
                    active: active.length,
                    completed: completed.length,
                    failed: failed.length,
                    delayed: delayed.length
                },
                jobs: {
                    waiting: waiting.slice(0, 5).map(job => ({
                        id: job.id,
                        data: job.data,
                        opts: job.opts,
                        timestamp: job.timestamp
                    })),
                    active: active.slice(0, 5).map(job => ({
                        id: job.id,
                        data: job.data,
                        processedOn: job.processedOn,
                        progress: job.progress()
                    })),
                    completed: completed.slice(0, 5).map(job => ({
                        id: job.id,
                        data: job.data,
                        finishedOn: job.finishedOn,
                        returnvalue: job.returnvalue
                    })),
                    failed: failed.slice(0, 5).map(job => ({
                        id: job.id,
                        data: job.data,
                        failedReason: job.failedReason,
                        finishedOn: job.finishedOn,
                        attemptsMade: job.attemptsMade
                    })),
                    delayed: delayed.slice(0, 5).map(job => ({
                        id: job.id,
                        data: job.data,
                        delay: job.opts.delay,
                        timestamp: job.timestamp
                    }))
                }
            }
        });
    } catch (error: unknown) {
        console.error(`Error getting queue ${req.params.queueName}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to get queue information'
        });
    }
});

// Pause a queue
router.post('/:queueName/pause', async (req, res) => {
    try {
        const { queueName } = req.params;
        await queueManager.pauseQueue(queueName);

        res.json({
            success: true,
            message: `Queue ${queueName} paused successfully`
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to pause queue';
        console.error(`Error pausing queue ${req.params.queueName}:`, error);
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
});

// Resume a queue
router.post('/:queueName/resume', async (req, res) => {
    try {
        const { queueName } = req.params;
        await queueManager.resumeQueue(queueName);

        res.json({
            success: true,
            message: `Queue ${queueName} resumed successfully`
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to resume queue';
        console.error(`Error resuming queue ${req.params.queueName}:`, error);
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
});

// Clean failed jobs
router.post('/clean/failed', async (req, res) => {
    try {
        const { queueName } = req.body;
        await queueManager.cleanFailedJobs(queueName);

        res.json({
            success: true,
            message: queueName
                ? `Cleaned failed jobs from queue ${queueName}`
                : 'Cleaned failed jobs from all queues'
        });
    } catch (error: unknown) {
        console.error('Error cleaning failed jobs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clean failed jobs'
        });
    }
});

// Retry a specific failed job
router.post('/:queueName/jobs/:jobId/retry', async (req, res) => {
    try {
        const { queueName, jobId } = req.params;
        const queue = queueManager.getQueue(queueName);

        if (!queue) {
            return res.status(404).json({
                success: false,
                error: 'Queue not found'
            });
        }

        const job = await queue.getJob(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        await job.retry();

        res.json({
            success: true,
            message: `Job ${jobId} retried successfully`
        });
    } catch (error: unknown) {
        console.error(`Error retrying job ${req.params.jobId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to retry job'
        });
    }
});

// Remove a specific job
router.delete('/:queueName/jobs/:jobId', async (req, res) => {
    try {
        const { queueName, jobId } = req.params;
        const queue = queueManager.getQueue(queueName);

        if (!queue) {
            return res.status(404).json({
                success: false,
                error: 'Queue not found'
            });
        }

        const job = await queue.getJob(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        await job.remove();

        res.json({
            success: true,
            message: `Job ${jobId} removed successfully`
        });
    } catch (error: unknown) {
        console.error(`Error removing job ${req.params.jobId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove job'
        });
    }
});

// Manual cleanup trigger
router.post('/cleanup/trigger', async (req, res) => {
    try {
        const { taskType, emergency = false } = req.body;

        if (emergency) {
            const { scheduleEmergencyCleanup } = await import('../queues/processors/cleanupTasks');
            await scheduleEmergencyCleanup();

            res.json({
                success: true,
                message: 'Emergency cleanup scheduled successfully'
            });
        } else if (taskType) {
            const { scheduleCleanupTask } = await import('../queues/processors/cleanupTasks');
            await scheduleCleanupTask(taskType, { priority: 2 });

            res.json({
                success: true,
                message: `Cleanup task ${taskType} scheduled successfully`
            });
        } else {
            const { scheduleDailyCleanup } = await import('../queues/processors/cleanupTasks');
            await scheduleDailyCleanup();

            res.json({
                success: true,
                message: 'Daily cleanup scheduled successfully'
            });
        }
    } catch (error: unknown) {
        console.error('Error triggering cleanup:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to trigger cleanup'
        });
    }
});

// Health check for queue system
router.get('/health', async (req, res) => {
    try {
        const isInitialized = queueManager.initialized;
        const stats = await queueManager.getQueueStats();

        // Check if any queue has too many failed jobs
        const hasIssues = Object.values(stats).some((queueStats: any) =>
            queueStats.failed > 100 || queueStats.error
        );

        res.json({
            success: true,
            data: {
                initialized: isInitialized,
                healthy: isInitialized && !hasIssues,
                stats,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error: unknown) {
        console.error('Error checking queue health:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check queue health'
        });
    }
});

export default router;