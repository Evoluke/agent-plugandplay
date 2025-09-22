import Redis, { type RedisOptions } from 'ioredis';

type RedisSerializable =
  | string
  | number
  | boolean
  | Buffer
  | Date
  | Record<string, unknown>
  | Array<unknown>
  | null
  | undefined;

const redisConfigProvided = Boolean(
  process.env.REDIS_URL || process.env.REDIS_HOST
);

const globalForRedis = globalThis as unknown as {
  redisClient?: Redis;
};

function parsePort(portValue: string | undefined): number {
  if (!portValue) {
    return 6379;
  }

  const parsed = Number.parseInt(portValue, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `[Redis] Porta inválida informada em REDIS_PORT: ${portValue}`
    );
  }

  return parsed;
}

function createRedisClient(): Redis {
  const commonOptions: RedisOptions = {
    enableAutoPipelining: true,
  };

  const url = process.env.REDIS_URL;

  if (url) {
    return new Redis(url, commonOptions);
  }

  const host = process.env.REDIS_HOST;

  if (!host) {
    throw new Error(
      '[Redis] Variáveis de ambiente ausentes: defina REDIS_URL ou REDIS_HOST.'
    );
  }

  const options: RedisOptions = {
    ...commonOptions,
    host,
    port: parsePort(process.env.REDIS_PORT),
  };

  if (process.env.REDIS_USERNAME) {
    options.username = process.env.REDIS_USERNAME;
  }

  if (process.env.REDIS_PASSWORD) {
    options.password = process.env.REDIS_PASSWORD;
  }

  const tlsFlag = process.env.REDIS_TLS?.toLowerCase();

  if (tlsFlag === 'true' || tlsFlag === '1') {
    options.tls = {};
  }

  return new Redis(options);
}

function getOrCreateClient(): Redis {
  if (!redisConfigProvided) {
    throw new Error(
      '[Redis] Variáveis de ambiente ausentes: defina REDIS_URL ou REDIS_HOST.'
    );
  }

  if (!globalForRedis.redisClient) {
    const client = createRedisClient();

    client.on('error', (error) => {
      console.error('[Redis] Erro na conexão', error);
    });

    globalForRedis.redisClient = client;
  }

  return globalForRedis.redisClient;
}

function serialize(value: RedisSerializable): string | Buffer {
  if (value === undefined || value === null) {
    return 'null';
  }

  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return JSON.stringify(value);
}

async function runWithRedis<T>(
  operation: (client: Redis) => Promise<T>,
  fallback?: () => T | Promise<T>
): Promise<T> {
  if (!redisConfigProvided) {
    if (fallback) {
      return await fallback();
    }

    throw new Error(
      '[Redis] Configuração ausente: defina REDIS_URL ou REDIS_HOST.'
    );
  }

  try {
    const client = getOrCreateClient();
    return await operation(client);
  } catch (error) {
    if (fallback) {
      console.error('[Redis] Operação falhou', error);
      return await fallback();
    }

    throw error;
  }
}

export function isRedisConfigured(): boolean {
  return redisConfigProvided;
}

export function getRedisClient(): Redis {
  return getOrCreateClient();
}

export async function enqueue(
  queue: string,
  payload: RedisSerializable
): Promise<number | null> {
  return runWithRedis(
    async (client) => client.lpush(queue, serialize(payload)),
    () => null
  );
}

export async function dequeue(queue: string): Promise<string | null> {
  return runWithRedis(
    async (client) => client.rpop(queue),
    () => null
  );
}

export async function dequeueJson<T>(queue: string): Promise<T | null> {
  const raw = await dequeue(queue);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error('[Redis] Falha ao converter item da fila em JSON', error);
    return null;
  }
}

export async function cacheGet(key: string): Promise<string | null> {
  return runWithRedis(
    async (client) => client.get(key),
    () => null
  );
}

export async function cacheGetJson<T>(key: string): Promise<T | null> {
  const raw = await cacheGet(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error('[Redis] Falha ao converter item em cache para JSON', error);
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: RedisSerializable,
  ttlSeconds?: number
): Promise<boolean> {
  return runWithRedis(
    async (client) => {
      const payload = serialize(value);

      if (ttlSeconds && ttlSeconds > 0) {
        await client.set(key, payload, 'EX', ttlSeconds);
      } else {
        await client.set(key, payload);
      }

      return true;
    },
    () => false
  );
}

export async function cacheSetJson(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<boolean> {
  return cacheSet(key, value as RedisSerializable, ttlSeconds);
}

export async function cacheDelete(key: string): Promise<boolean> {
  return runWithRedis(
    async (client) => (await client.del(key)) > 0,
    () => false
  );
}

export type { Redis as RedisClient };
