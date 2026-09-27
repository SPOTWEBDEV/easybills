/**
 * Thin fetch wrapper around the easybills-backend PHP API.
 *
 * The backend wraps list responses as `{ data: [...] }` and object responses
 * as the object directly — see easybills-backend/src/Core/Response.php.
 * Each function in lib/api/*.ts knows which shape to expect for its own
 * endpoint, so this client just handles the transport: base URL, JSON
 * headers, bearer token, and turning `{ error: "..." }` into a thrown Error.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const USER_TOKEN_KEY = "easybills:token";
const ADMIN_TOKEN_KEY = "easybills:admin_token";

export const tokenStore = {
  getUserToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(USER_TOKEN_KEY);
  },
  setUserToken(token: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(USER_TOKEN_KEY, token);
  },
  clearUserToken() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(USER_TOKEN_KEY);
  },
  getAdminToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  setAdminToken(token: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },
  clearAdminToken() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: "user" | "admin" | "none";
  query?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(API_BASE_URL.replace(/\/$/, "") + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function apiFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = "user", query } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth === "user") {
    const token = tokenStore.getUserToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  } else if (auth === "admin") {
    const token = tokenStore.getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON response (e.g. an unexpected 502 HTML page from the host)
  }

  if (!res.ok) {
    const message =
      (json && typeof json === "object" && "error" in json && typeof (json as any).error === "string"
        ? (json as any).error
        : null) ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status, json);
  }

  return json as T;
}

/** Unwraps the backend's `{ data: [...] }` list envelope. */
export function unwrapList<T>(payload: { data: T[] } | T[]): T[] {
  if (Array.isArray(payload)) return payload;
  return payload?.data ?? [];
}

/**
 * Fetches a binary/text file (e.g. CSV export) with auth headers attached,
 * since a plain `<a href>` download can't carry an Authorization header.
 * Triggers a browser download of the response body.
 */
export async function downloadAuthed(path: string, filename: string, query?: RequestOptions["query"]): Promise<void> {
  const token = tokenStore.getUserToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(buildUrl(path, query), { headers });
  if (!res.ok) {
    throw new ApiError(`Download failed (${res.status})`, res.status);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
