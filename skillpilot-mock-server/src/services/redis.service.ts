/**
 * Redis Service for managing temporary data storage
 * Used for storing invitation links with expiration
 */

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType | null = null;
  private isConnected = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      const redisHost = process.env.REDIS_HOST || 'localhost';
      const redisPort = parseInt(process.env.REDIS_PORT || '6379');

      this.client = createClient({
        socket: {
          host: redisHost,
          port: redisPort,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              this.logger.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        this.logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.logger.log('✅ Connecting to Redis...');
      });

      this.client.on('ready', () => {
        this.logger.log('✅ Redis client ready');
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        this.logger.log('🔄 Reconnecting to Redis...');
      });

      // Connect to Redis (non-blocking)
      this.client.connect().catch((error) => {
        this.logger.warn('Redis connection will be retried:', error.message);
        this.isConnected = false;
      });
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
      this.isConnected = false;
    }
  }

  /**
   * Store a key-value pair with expiration (in seconds)
   */
  async set(key: string, value: string, expirationSeconds: number = 3600): Promise<void> {
    if (!this.client) {
      // Try to reconnect if client exists but not connected
      if (!this.isConnected) {
        try {
          await this.client.connect();
          this.isConnected = true;
        } catch (error) {
          throw new Error('Redis client is not connected');
        }
      }
    }

    if (!this.isConnected) {
      throw new Error('Redis client is not connected');
    }

    try {
      await this.client.setEx(key, expirationSeconds, value);
      this.logger.log(`✅ Stored key: ${key} with expiration: ${expirationSeconds}s`);
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a value by key
   */
  async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client is not connected');
    }

    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a key
   */
  async delete(key: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client is not connected');
    }

    try {
      await this.client.del(key);
      this.logger.log(`✅ Deleted key: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   */
  async getTTL(key: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      return -1;
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error);
      return -1;
    }
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.logger.log('✅ Redis client disconnected');
    }
  }
}

