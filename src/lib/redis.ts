import Redis, { type RedisOptions, type RedisValue } from "ioredis";

export type RedisClient = Redis;

let client: RedisClient | null = null;

function parseOptionalInt(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function shouldUseTls(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "tls";
}

function createRedisClient(): RedisClient {
  const {
    REDIS_URL,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_USERNAME,
    REDIS_PASSWORD,
    REDIS_DB,
    REDIS_TLS,
  } = process.env;

  const baseOptions: RedisOptions = {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
  };

  let instance: RedisClient;

  if (REDIS_URL) {
    instance = new Redis(REDIS_URL, baseOptions);
  } else if (REDIS_HOST) {
    const options: RedisOptions = {
      ...baseOptions,
      host: REDIS_HOST,
      port: parseOptionalInt(REDIS_PORT) ?? 6379,
      username: REDIS_USERNAME,
      password: REDIS_PASSWORD,
      db: parseOptionalInt(REDIS_DB),
    };

    if (shouldUseTls(REDIS_TLS)) {
      options.tls = {};
    }

    instance = new Redis(options);
  } else {
    throw new Error(
      "[redis] Configure REDIS_URL ou REDIS_HOST/REDIS_PORT para habilitar o cache/filas"
    );
  }

  instance.on("error", (error) => {
    console.error("[redis] Erro de conexão", error);
  });

  return instance;
}

export function getRedisClient(): RedisClient {
  if (!client) {
    client = createRedisClient();
  }

  return client;
}

function ensureRedisClient(): RedisClient {
  return getRedisClient();
}

export async function enqueue(
  queue: string,
  value: RedisValue
): Promise<number> {
  const redis = ensureRedisClient();
  return redis.rpush(queue, value);
}

export async function dequeue(queue: string): Promise<string | null> {
  const redis = ensureRedisClient();
  return redis.lpop(queue);
}

export async function peekQueue(queue: string): Promise<string | null> {
  const redis = ensureRedisClient();
  return redis.lindex(queue, 0);
}

export async function setCache(
  key: string,
  value: RedisValue,
  ttlSeconds?: number
): Promise<"OK" | null> {
  const redis = ensureRedisClient();

  if (typeof ttlSeconds === "number" && Number.isFinite(ttlSeconds)) {
    const ttl = Math.max(0, Math.floor(ttlSeconds));

    if (ttl > 0) {
      return redis.set(key, value, "EX", ttl);
    }
  }

  return redis.set(key, value);
}

export async function getCache(key: string): Promise<string | null> {
  const redis = ensureRedisClient();
  return redis.get(key);
}

export async function deleteCache(key: string): Promise<number> {
  const redis = ensureRedisClient();
  return redis.del(key);
}
