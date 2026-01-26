import { PoolClient } from 'pg';
interface DatabaseHealth {
    isHealthy: boolean;
    latency?: number;
    error?: string;
    timestamp: Date;
}
declare class DatabaseManager {
    private pool;
    private healthStatus;
    constructor();
    private setupEventHandlers;
    private startHealthChecks;
    private performHealthCheck;
    query(text: string, params?: any[]): Promise<any>;
    getClient(): Promise<PoolClient>;
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    getHealthStatus(): DatabaseHealth;
    getPoolStats(): Promise<{
        totalCount: number;
        idleCount: number;
        waitingCount: number;
    }>;
    close(): Promise<void>;
}
declare const dbManager: DatabaseManager;
export declare const query: (text: string, params?: any[]) => Promise<any>;
export declare const getClient: () => Promise<PoolClient>;
export declare const transaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>;
export declare const getDatabaseHealth: () => DatabaseHealth;
export declare const getDatabaseStats: () => Promise<{
    totalCount: number;
    idleCount: number;
    waitingCount: number;
}>;
export declare const closeDatabaseConnection: () => Promise<void>;
export default dbManager;
//# sourceMappingURL=db.d.ts.map