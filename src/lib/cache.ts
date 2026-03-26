import { Redis } from '@upstash/redis';

export const redis = new Redis({
    url: process.env.KV_REST_API_URL || 'https://mock-redis.upstash.io',
    token: process.env.KV_REST_API_TOKEN || 'mock-token',
});

export async function getCache<T>(key: string): Promise<T | null> {
    try {
        return await redis.get<T>(key);
    } catch {
        return null;
    }
}

export async function setCache(key: string, value: any, ttlSeconds: number = 60) {
    try {
        await redis.set(key, value, { ex: ttlSeconds });
    } catch (e) {
        // silent fail if redis is down
    }
}
