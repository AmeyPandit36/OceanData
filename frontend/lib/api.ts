export type ProviderId = "noaa-oisst" | "argo";

export interface QueryResult {
  request_id: string;
  provider: string;
  dataset: string;
  provider_url: string;
  provider_status: number;
  transport: "backend" | "browser";
  status: "success";
  parameters_sent: Record<string, unknown>;
  observation_count: number;
  variables: { name: string; unit: string }[];
  time_range: { start: string | null; end: string | null };
  spatial_range: {
    min_latitude: number | null;
    max_latitude: number | null;
    min_longitude: number | null;
    max_longitude: number | null;
  };
  records: Record<string, string | number | null>[];
  retrieved_at: string;
  raw_response_path: string;
}

export interface ApiError {
  error?: string;
  message?: string;
  detail?: string | { msg: string }[];
  provider_url?: string;
}

const allowedProviderHosts = new Set(["coastwatch.pfeg.noaa.gov", "erddap.ifremer.fr"]);

async function apiRequest(path: string, payload: Record<string, unknown>): Promise<Response> {
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function parseApiResponse(response: Response): Promise<QueryResult> {
  const body = await response.json() as QueryResult | ApiError;
  if (!response.ok) {
    const error = body as ApiError;
    const detail = Array.isArray(error.detail) ? error.detail.map((item) => item.msg).join("; ") : error.detail;
    const failure = new Error(error.message || detail || "The extraction request failed.");
    Object.assign(failure, { providerUrl: error.provider_url, code: error.error });
    throw failure;
  }
  return body as QueryResult;
}

async function browserTransport(payload: Record<string, unknown>, providerUrl: string): Promise<QueryResult> {
  const parsedUrl = new URL(providerUrl);
  if (parsedUrl.protocol !== "https:" || !allowedProviderHosts.has(parsedUrl.hostname)) {
    throw new Error("The connector returned a provider URL outside OceanData’s public-source allowlist.");
  }
  const providerResponse = await fetch(providerUrl, { method: "GET", mode: "cors", credentials: "omit" });
  const rawResponse = await providerResponse.text();
  if (!providerResponse.ok) {
    throw new Error(`Provider returned HTTP ${providerResponse.status}: ${rawResponse.slice(0, 240)}`);
  }
  const normalized = await apiRequest("/backend/api/browser-response", {
    request: payload,
    provider_url: providerUrl,
    provider_status: providerResponse.status,
    raw_response: rawResponse,
  });
  return parseApiResponse(normalized);
}

export async function executeQuery(payload: Record<string, unknown>): Promise<QueryResult> {
  const response = await apiRequest("/backend/api/query", payload);
  try {
    return await parseApiResponse(response);
  } catch (reason) {
    const failure = reason as Error & { providerUrl?: string; code?: string };
    const isTransportFailure = failure.code === "provider_request_failed" &&
      (failure.message.includes("secure connection") || failure.message.includes("within 30 seconds"));
    if (!isTransportFailure || !failure.providerUrl) throw failure;
    try {
      return await browserTransport(payload, failure.providerUrl);
    } catch (browserReason) {
      const browserFailure = browserReason as Error;
      throw Object.assign(
        new Error(`Backend and browser transports both failed. Browser transport: ${browserFailure.message}`),
        { providerUrl: failure.providerUrl },
      );
    }
  }
}
