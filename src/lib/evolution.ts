type EvolutionRequestInit = Omit<RequestInit, 'headers'> & {
  headers?: HeadersInit;
};

type EvolutionPayload =
  | BodyInit
  | Record<string, unknown>
  | Array<unknown>
  | boolean
  | number
  | null
  | undefined;

export interface EvolutionClient {
  readonly baseUrl: string;
  request: (path: string, init?: EvolutionRequestInit) => Promise<Response>;
  get: (path: string, init?: Omit<EvolutionRequestInit, 'method'>) => Promise<Response>;
  post: (
    path: string,
    payload?: EvolutionPayload,
    init?: Omit<EvolutionRequestInit, 'method' | 'body'>
  ) => Promise<Response>;
  put: (
    path: string,
    payload?: EvolutionPayload,
    init?: Omit<EvolutionRequestInit, 'method' | 'body'>
  ) => Promise<Response>;
  patch: (
    path: string,
    payload?: EvolutionPayload,
    init?: Omit<EvolutionRequestInit, 'method' | 'body'>
  ) => Promise<Response>;
  delete: (path: string, init?: Omit<EvolutionRequestInit, 'method'>) => Promise<Response>;
  json: <T>(path: string, init?: EvolutionRequestInit) => Promise<T>;
}

type EvolutionConfig = {
  baseUrl: string;
  token: string;
};

const globalForEvolution = globalThis as unknown as {
  evolutionClient?: EvolutionClient;
};

function ensureConfig(): EvolutionConfig {
  const rawBaseUrl = process.env.EVOLUTION_API_BASE_URL?.trim();
  const token = process.env.EVOLUTION_API_TOKEN?.trim();

  const missing: string[] = [];

  if (!rawBaseUrl) {
    missing.push('EVOLUTION_API_BASE_URL');
  }

  if (!token) {
    missing.push('EVOLUTION_API_TOKEN');
  }

  if (missing.length > 0) {
    throw new Error(
      `[Evolution API] Variáveis de ambiente ausentes: ${missing.join(', ')}`
    );
  }

  let normalizedBaseUrl: string;

  try {
    const parsedUrl = new URL(rawBaseUrl);
    const trimmedPath = parsedUrl.pathname.replace(/\/+$/, '');
    parsedUrl.pathname = trimmedPath;
    parsedUrl.search = '';
    parsedUrl.hash = '';
    normalizedBaseUrl = parsedUrl.toString().replace(/\/+$/, '');
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[Evolution API] EVOLUTION_API_BASE_URL inválida: ${reason}`
    );
  }

  return { baseUrl: normalizedBaseUrl, token };
}

function buildUrl(baseUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

function isBodyInit(value: unknown): value is BodyInit {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return true;
  }

  if (value instanceof ArrayBuffer) {
    return true;
  }

  if (ArrayBuffer.isView(value)) {
    return true;
  }

  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return true;
  }

  if (typeof FormData !== 'undefined' && value instanceof FormData) {
    return true;
  }

  if (
    typeof URLSearchParams !== 'undefined' &&
    value instanceof URLSearchParams
  ) {
    return true;
  }

  if (
    typeof ReadableStream !== 'undefined' &&
    value instanceof ReadableStream
  ) {
    return true;
  }

  return false;
}

function resolveBody(
  payload: EvolutionPayload,
  headers: Headers
): BodyInit | null | undefined {
  if (payload === undefined) {
    return undefined;
  }

  if (payload === null) {
    return null;
  }

  if (isBodyInit(payload)) {
    return payload;
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (typeof payload === 'boolean' || typeof payload === 'number') {
    return JSON.stringify(payload);
  }

  return JSON.stringify(payload ?? null);
}

function withBodyMethod(
  request: EvolutionClient['request'],
  method: string
) {
  return (
    path: string,
    payload?: EvolutionPayload,
    init?: Omit<EvolutionRequestInit, 'method' | 'body'>
  ) => {
    const baseInit: EvolutionRequestInit = { ...(init ?? {}), method };
    const headers = new Headers(baseInit.headers ?? {});
    const body = resolveBody(payload, headers);

    return request(path, { ...baseInit, headers, body });
  };
}

export function getEvolutionClient(): EvolutionClient {
  if (globalForEvolution.evolutionClient) {
    return globalForEvolution.evolutionClient;
  }

  const { baseUrl, token } = ensureConfig();

  const request: EvolutionClient['request'] = async (
    path,
    init = {}
  ) => {
    const url = buildUrl(baseUrl, path);
    const headers = new Headers(init.headers ?? {});

    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    return fetch(url, { ...init, headers });
  };

  const client: EvolutionClient = {
    baseUrl,
    request,
    get: (path, init) => request(path, { ...(init ?? {}), method: 'GET' }),
    post: withBodyMethod(request, 'POST'),
    put: withBodyMethod(request, 'PUT'),
    patch: withBodyMethod(request, 'PATCH'),
    delete: (path, init) => request(path, { ...(init ?? {}), method: 'DELETE' }),
    json: async <T>(path: string, init?: EvolutionRequestInit) => {
      const response = await request(path, init);

      if (!response.ok) {
        let details = '';

        try {
          details = await response.text();
        } catch {
          details = '';
        }

        const suffix = details ? `: ${details}` : '';
        throw new Error(
          `[Evolution API] Requisição falhou (${response.status} ${response.statusText})${suffix}`
        );
      }

      return (await response.json()) as T;
    },
  };

  globalForEvolution.evolutionClient = client;

  return client;
}

export type { EvolutionRequestInit };
