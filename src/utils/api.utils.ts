import ky from "ky";
import i18next from "i18next";
import type { ApiResponse, LoginTokens } from "../types/backendAuth";
import { showApiError } from "./notifications";
import { STORAGE_KEYS, DEFAULT_LANGUAGE } from "../data/storageKeys";
import { API_REQUEST_FAILED, MUTATION_END, SESSION_EXPIRED  } from "../constants/events";
import { AUTH_REFRESH } from "../constants/apiPaths";


const BASE_URL = import.meta.env.VITE_API_ROOT;

const api = ky.create({
  prefixUrl: BASE_URL,
  timeout: 30000,
  retry: 0,
});

// ─── Token helpers ────────────────────────────────────────────────────────────

function getAccessToken(): string | null {
  return (
    localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
    localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
    null
  );
}

function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || null;
}

function getTokenExpiry(): Date | null {
  const raw = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN_EXPIRY);
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

/** Returns true when the access token is expired or will expire within 30 seconds. */
function isTokenExpiredOrExpiringSoon(): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) return false; // no expiry stored → assume still valid
  return expiry.getTime() - Date.now() < 30_000;
}

function saveTokens(tokens: LoginTokens) {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN_EXPIRY, tokens.accessTokenExpiresAt);
}

function clearTokens() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN_EXPIRY);
  sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

function dispatchSessionExpired() {
  clearTokens();
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED));
}


// ─── Refresh logic (singleton promise to avoid parallel refresh races) ────────

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await api
        .post(AUTH_REFRESH, { json: { refreshToken }, throwHttpErrors: false })
        .json<ApiResponse<LoginTokens>>();

      if (res.success && res.data) {
        saveTokens(res.data);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Shared header builder ────────────────────────────────────────────────────

function buildAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const language = localStorage.getItem(STORAGE_KEYS.LANGUAGE) || DEFAULT_LANGUAGE;
  const accessToken = getAccessToken();

  return {
    "Accept-Language": language,
    "X-User-Language": language,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(extra || {}),
  };
}

// ─── Proactive refresh gate ───────────────────────────────────────────────────

/**
 * Call before every authenticated request.
 * If the token is expired/expiring, attempts a silent refresh.
 * Returns false and fires SESSION_EXPIRED if refresh also fails.
 */
async function ensureFreshToken(): Promise<boolean> {
  if (!isTokenExpiredOrExpiringSoon()) return true;

  const refreshed = await tryRefresh();
  if (!refreshed) {
    dispatchSessionExpired();
    return false;
  }
  return true;
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

export const get = async <T = any>(
  endpoint: string,
  params?: Record<string, any>,
  headers?: any,
): Promise<ApiResponse<T>> => {
  const doGet = () =>
    api.get(endpoint, {
      searchParams: params,
      headers: buildAuthHeaders(headers),
      throwHttpErrors: false,
    });

  try {
    await ensureFreshToken();

    let response = await doGet();

    // 401 → attempt one silent refresh then retry
    if (response.status === 401) {
      const refreshed = await tryRefresh();
      if (!refreshed) {
        dispatchSessionExpired();
        throw new Error(i18next.t("auth.sessionExpired"));
      }
      response = await doGet();
    }

    return response.json<ApiResponse<T>>();
  } catch (error) {
    console.error(`GET ${endpoint} failed:`, error);
    window.dispatchEvent(new CustomEvent(API_REQUEST_FAILED));
    throw error;
  }
};

export const post = async (
  endpoint: string,
  body: Record<string, any>,
  headers?: any,
): Promise<ApiResponse<any>> => {
  try {
    window.dispatchEvent(new Event("mutation-start"));

    // Don't run the refresh gate for auth endpoints (login, refresh itself)
    const isAuthEndpoint =
      endpoint.includes("Authentication/login") ||
      endpoint.includes("Authentication/refresh");

    if (!isAuthEndpoint) {
      const ok = await ensureFreshToken();
      if (!ok) throw new Error(i18next.t("auth.sessionExpired"));
    }

    const doPost = () =>
      api.post(endpoint, {
        json: body,
        headers: buildAuthHeaders(headers?.headers),
        throwHttpErrors: false,
      });

    let response = await doPost();

    // 401 → attempt one silent refresh then retry
    if (response.status === 401 && !isAuthEndpoint) {
      const refreshed = await tryRefresh();
      if (!refreshed) {
        dispatchSessionExpired();
        throw new Error(i18next.t("auth.sessionExpired"));
      }
      response = await doPost();
    }

    const res = await response.json<ApiResponse<any>>();

    if (!res.success) {
      const msg =
        (Array.isArray(res.errors) && res.errors.length > 0 && res.errors[0]) ||
        res.message ||
        i18next.t("common.somethingWentWrong");
      showApiError(msg);
    }

    return res;
  } catch (error) {
    console.error(`POST ${endpoint} failed:`, error);
    window.dispatchEvent(new CustomEvent(API_REQUEST_FAILED));
    throw error;
  } finally {
    window.dispatchEvent(new Event(MUTATION_END));
  }
};

export const put = async (
  endpoint: string,
  body: Record<string, any>,
  headers?: any,
): Promise<ApiResponse<any>> => {
  try {
    window.dispatchEvent(new Event("mutation-start"));

    const ok = await ensureFreshToken();
    if (!ok) throw new Error(i18next.t("auth.sessionExpired"));

    const doPut = () =>
      api.put(endpoint, {
        json: body,
        headers: buildAuthHeaders(headers?.headers),
        throwHttpErrors: false,
      });

    let putResponse = await doPut();

    if (putResponse.status === 401) {
      const refreshed = await tryRefresh();
      if (!refreshed) {
        dispatchSessionExpired();
        throw new Error(i18next.t("auth.sessionExpired"));
      }
      putResponse = await doPut();
    }

    const res = await putResponse.json<ApiResponse<any>>();

    if (!res.success) {
      const msg =
        (Array.isArray(res.errors) && res.errors.length > 0 && res.errors[0]) ||
        res.message ||
        i18next.t("common.somethingWentWrong");
      showApiError(msg);
    }

    return res;
  } catch (error) {
    console.error(`PUT ${endpoint} failed:`, error);
    window.dispatchEvent(new CustomEvent(API_REQUEST_FAILED));
    throw error;
  } finally {
    window.dispatchEvent(new Event(MUTATION_END));
  }
};

export const del = async (
  endpoint: string,
  params?: Record<string, any>,
  headers?: any,
): Promise<any> => {
  try {
    const ok = await ensureFreshToken();
    if (!ok) throw new Error(i18next.t("auth.sessionExpired"));

    const doDelete = () =>
      api.delete(endpoint, {
        searchParams: params,
        headers: buildAuthHeaders(headers?.headers),
        throwHttpErrors: false,
      });

    let delResponse = await doDelete();

    if (delResponse.status === 401) {
      const refreshed = await tryRefresh();
      if (!refreshed) {
        dispatchSessionExpired();
        throw new Error(i18next.t("auth.sessionExpired"));
      }
      delResponse = await doDelete();
    }

    return delResponse.json();
  } catch (error) {
    console.error(`DELETE ${endpoint} failed:`, error);
    window.dispatchEvent(new CustomEvent(API_REQUEST_FAILED));
    throw error;
  }
};

// Expose saveTokens so AuthContext can call it after login/refresh
export { saveTokens };
