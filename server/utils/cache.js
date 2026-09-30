import { createClient } from 'redis';

let client = null;

export const connectRedis = async () => {
  try {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: false   // don't retry — avoids terminal spam
      }
    });
    client.on('error', (err) => {
      console.log('Redis unavailable (non-fatal) — caching disabled:', err.code || err.message);
      client = null;
    });
    await client.connect();
    console.log('✅ Redis connected — caching enabled');
  } catch (err) {
    console.log('⚠️  Redis not running — skipping cache (app works normally without it)');
    client = null;
  }
};

export const getCached = async (key) => {
  if (!client) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
};

export const setCache = async (key, value, ttlSeconds = 3600) => {
  if (!client) return;
  try {
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Cache fail is non-fatal
  }
};

export const generateCacheKey = (code) => {
  // Simple hash of code string
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `review:${Math.abs(hash)}`;
};
