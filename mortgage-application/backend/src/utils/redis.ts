import { createClient, RedisClientType } from 'redis';

class RedisConnection {
  private client: RedisClientType;
  private static instance: RedisConnection;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });

    this.client.on('disconnect', () => {
      console.log('Disconnected from Redis');
    });
  }

  public static getInstance(): RedisConnection {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new RedisConnection();
    }
    return RedisConnection.instance;
  }

  public async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.disconnect();
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }

  // Cache operations
  public async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.connect();
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await this.client.setEx(key, ttl, stringValue);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  public async get<T = any>(key: string): Promise<T | null> {
    await this.connect();
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  public async del(key: string): Promise<void> {
    await this.connect();
    await this.client.del(key);
  }

  public async exists(key: string): Promise<boolean> {
    await this.connect();
    const result = await this.client.exists(key);
    return result === 1;
  }

  // Session operations
  public async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<void> {
    await this.set(`session:${sessionId}`, data, ttl);
  }

  public async getSession(sessionId: string): Promise<any> {
    return await this.get(`session:${sessionId}`);
  }

  public async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // Rate limiting
  public async incrementRateLimit(key: string, windowMs: number): Promise<number> {
    await this.connect();
    const pipeline = this.client.multi();
    pipeline.incr(key);
    pipeline.expire(key, Math.ceil(windowMs / 1000));
    const results = await pipeline.exec();
    if (results && results[0] && typeof results[0] === 'number') {
      return results[0];
    }
    return 0;
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      await this.connect();
      await this.client.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}

export const redis = RedisConnection.getInstance();
export default redis;
