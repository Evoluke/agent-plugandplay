import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

declare global {
  var redisClient: RedisClient | undefined;
  var redisClientPromise: Promise<RedisClient> | undefined;
}

function buildRedisConfig() {
  const {
    REDIS_USERNAME,
    REDIS_PASSWORD,
    REDIS_HOST,
    REDIS_PORT,
  } = process.env;

  if (!REDIS_HOST) {
    throw new Error("A variável de ambiente REDIS_HOST é obrigatória para conectar ao Redis.");
  }

  if (!REDIS_PORT) {
    throw new Error("A variável de ambiente REDIS_PORT é obrigatória para conectar ao Redis.");
  }

  const port = Number.parseInt(REDIS_PORT, 10);

  if (Number.isNaN(port)) {
    throw new Error("O valor de REDIS_PORT deve ser um número válido.");
  }

  return {
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD,
    socket: {
      host: REDIS_HOST,
      port,
    },
  } satisfies Parameters<typeof createClient>[0];
}

export async function getRedisClient(): Promise<RedisClient> {
  if (globalThis.redisClient) {
    return globalThis.redisClient;
  }

  if (!globalThis.redisClientPromise) {
    const client = createClient(buildRedisConfig());

    client.on("error", (err) => {
      console.error("Redis Client Error", err);
    });

    globalThis.redisClientPromise = client
      .connect()
      .then(() => {
        globalThis.redisClient = client;
        return client;
      })
      .catch((error) => {
        globalThis.redisClient = undefined;
        globalThis.redisClientPromise = undefined;
        throw error;
      });
  }

  return globalThis.redisClientPromise;
}

export async function disconnectRedisClient() {
  if (!globalThis.redisClient) {
    return;
  }

  await globalThis.redisClient.quit();
  globalThis.redisClient = undefined;
  globalThis.redisClientPromise = undefined;
}
