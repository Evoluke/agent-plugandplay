export interface EvolutionClientOptions {
  baseUrl?: string;
  token?: string;
}

export interface EvolutionClient {
  baseUrl: string;
  token: string;
  request: (path: string, init?: RequestInit) => Promise<Response>;
  requestJson: <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
}

function assertEnvVariable(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`[evolution] Variável de ambiente ausente: ${name}`);
  }
  return value;
}

function buildUrl(baseUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const trimmedBase = baseUrl.replace(/\/+$/g, "");
  const trimmedPath = path.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedPath}`;
}

async function extractErrorMessage(response: Response): Promise<string> {
  const clone = response.clone();
  const contentType = clone.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const data = (await clone.json()) as {
        message?: string;
        error?: string;
        detail?: string;
        [key: string]: unknown;
      };
      const message =
        (typeof data.message === "string" && data.message) ||
        (typeof data.error === "string" && data.error) ||
        (typeof data.detail === "string" && data.detail) ||
        JSON.stringify(data);
      return message;
    }

    const text = await clone.text();
    return text || response.statusText;
  } catch (error) {
    console.error("[evolution] Falha ao interpretar erro da API", error);
    return response.statusText;
  }
}

function createHeaders(token: string, init?: RequestInit) {
  const headers = new Headers(init?.headers ?? {});

  if (!headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  return headers;
}

export function createEvolutionClient(
  options: EvolutionClientOptions = {}
): EvolutionClient {
  const baseUrl = assertEnvVariable(
    options.baseUrl ?? process.env.EVOLUTION_API_BASE_URL,
    "EVOLUTION_API_BASE_URL"
  );

  const token = assertEnvVariable(
    options.token ?? process.env.EVOLUTION_API_TOKEN,
    "EVOLUTION_API_TOKEN"
  );

  const normalizedBaseUrl = baseUrl.replace(/\/+$/g, "");

  const request: EvolutionClient["request"] = async (path, init = {}) => {
    const url = buildUrl(normalizedBaseUrl, path);
    const headers = createHeaders(token, init);

    return fetch(url, {
      ...init,
      headers,
    });
  };

  const requestJson = async <T = unknown>(
    path: string,
    init: RequestInit = {}
  ): Promise<T> => {
    const response = await request(path, init);

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      throw new Error(
        `[evolution] Requisição falhou (${response.status}): ${message}`
      );
    }

    if (response.status === 204) {
      return null as unknown as T;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    const text = await response.text();
    return text as unknown as T;
  };

  return {
    baseUrl: normalizedBaseUrl,
    token,
    request,
    requestJson,
  };
}

let cachedClient: EvolutionClient | null = null;

export function getEvolutionClient(): EvolutionClient {
  if (!cachedClient) {
    cachedClient = createEvolutionClient();
  }

  return cachedClient;
}
