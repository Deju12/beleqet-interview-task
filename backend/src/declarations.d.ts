// Type declarations for modules without @types
declare module 'express';
declare module 'uuid';
declare module 'bcryptjs';
declare module 'passport-jwt';
declare module 'nodemailer';
declare module 'bull';
declare module 'passport-local';
declare module '@nestjs/bull';
declare module 'ioredis';
declare module 'helmet';

// Complete Bull/BullMQ type declarations
declare namespace Bull {
    interface Job<T = any> {
        data: T;
        id: string;
        name: string;
        queue: Queue;
        opts: {
            attempts: number;
            delay: number;
            backoff: any;
            timeout: number;
            lifo: boolean;
            priority: number;
        };
        progress: (value: number) => Promise<void>;
        log: (message: string) => Promise<void>;
        remove: () => Promise<void>;
        retry: () => Promise<void>;
        update: (data: any) => Promise<void>;
        attemptsMade: number;
        failedReason: string;
        finish: (err?: Error) => Promise<void>;
        isFailed: () => boolean;
        isCompleted: () => boolean;
        isDelayed: () => boolean;
        isActive: () => boolean;
        isWaiting: () => boolean;
    }

    interface Queue<T = any> {
        add: (name: string, data: T, opts?: any) => Promise<Job<T>>;
        process: (concurrency: number, handler: (job: Job<T>) => Promise<any>) => void;
        remove: () => Promise<void>;
        close: () => Promise<void>;
        pause: () => Promise<void>;
        resume: () => Promise<void>;
        getJob: (id: string) => Promise<Job<T>>;
        getJobs: (types: string[], start: number, end: number) => Promise<Job<T>[]>;
        getJobCounts: () => Promise<{ [key: string]: number }>;
        getWaitingCount: () => Promise<number>;
        getActiveCount: () => Promise<number>;
        getCompletedCount: () => Promise<number>;
        getFailedCount: () => Promise<number>;
        getDelayedCount: () => Promise<number>;
        clean: (grace: number, limit: number, type: string) => Promise<any>;
        on: (event: string, handler: (...args: any[]) => void) => void;
    }
}

// BullJob alias for Bull.Job
type BullJob<T = any> = Bull.Job<T>;

// Express namespace for request
declare namespace Express {
    interface Request {
        user?: {
            userId: string;
            email: string;
            role: string;
        };
    }
}
