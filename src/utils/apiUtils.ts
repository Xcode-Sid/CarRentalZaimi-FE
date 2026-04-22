import ky from "ky";
import i18next from "i18next";
import type { ApiResponse, LoginTokens } from "../types/backendAuth";
import { showApiError } from "./notifications";
import { STORAGE_KEYS, DEFAULT_LANGUAGE } from "../data/storageKeys";
import { API_REQUEST_FAILED, MUTATION_END, SESSION_EXPIRED } from "../constants/events";
import { AUTH_REFRESH } from "../constants/apiPaths";


const BASE_URL = import.meta.env.VITE_API_ROOT;

const api = ky.create({
  prefixUrl: BASE_URL,
  timeout: 30000,
  retry: 0,
});

// ─── Token helpers ────────────────────────────────────────────────────────────

function getAccessToken(): string | null {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  return token || sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || null;
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
  console.trace('clearTokens called!');
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
        .post(AUTH_REFRESH, { json: { refreshToken }, headers: buildAuthHeaders(), throwHttpErrors: false })
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
  const language = i18next.language || localStorage.getItem(STORAGE_KEYS.LANGUAGE) || DEFAULT_LANGUAGE;
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

    const text = await response.text();
    const res: ApiResponse<T> = text
      ? JSON.parse(text)
      : { success: false, data: null as any, message: null, errors: [] };

    if (!res.success) {
      let msg: string;
      if (Array.isArray(res.errors) && res.errors.length > 0) {
        msg = res.errors[0];
      } else if (res.errors && typeof res.errors === "object") {
        const allMsgs = Object.values(res.errors as unknown as Record<string, string[]>).flat();
        msg = allMsgs.join("; ") || (res as any).title || res.message || i18next.t("common.somethingWentWrong");
      } else {
        msg = res.message || (res as any).title || i18next.t("common.somethingWentWrong");
      }
      showApiError(msg);
    }

    return res;
  } catch (error) {
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
      endpoint.includes("Authentication/refresh") ||
      endpoint.includes("Authentication/logout"); 

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

    const text = await response.text();
    const res: ApiResponse<any> = text
      ? JSON.parse(text)
      : { success: true, data: null, message: null, errors: [] };

    if (!res.success) {
      let msg: string;
      if (Array.isArray(res.errors) && res.errors.length > 0) {
        msg = res.errors[0];
      } else if (res.errors && typeof res.errors === "object") {
        const allMsgs = Object.values(res.errors as unknown as Record<string, string[]>).flat();
        msg = allMsgs.join("; ") || (res as any).title || res.message || i18next.t("common.somethingWentWrong");
      } else {
        msg = res.message || (res as any).title || i18next.t("common.somethingWentWrong");
      }
      showApiError(msg);
    }

    return res;
  } catch (error) {
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

    const authHeaders = buildAuthHeaders(headers?.headers);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(body),
    });


    if (response.status === 401) {
      const refreshed = await tryRefresh();
      if (!refreshed) {
        throw new Error(i18next.t("auth.sessionExpired"));
      }
      const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(body),
      });
      const retryText = await retryResponse.text();
      const retryRes: ApiResponse<any> = retryText
        ? JSON.parse(retryText)
        : { success: true, data: null, message: null, errors: [] };
      if (!retryRes.success) {
        const msg =
          (Array.isArray(retryRes.errors) && retryRes.errors.length > 0 && retryRes.errors[0]) ||
          retryRes.message ||
          i18next.t("common.somethingWentWrong");
        showApiError(msg);
      }
      return retryRes;
    }

    const text = await response.text();
    const res: ApiResponse<any> = text
      ? JSON.parse(text)
      : { success: true, data: null, message: null, errors: [] };

    if (!res.success) {
      let msg: string;
      if (Array.isArray(res.errors) && res.errors.length > 0) {
        msg = res.errors[0];
      } else if (res.errors && typeof res.errors === "object") {
        const allMsgs = Object.values(res.errors as unknown as Record<string, string[]>).flat();
        msg = allMsgs.join("; ") || (res as any).title || res.message || i18next.t("common.somethingWentWrong");
      } else {
        msg = res.message || (res as any).title || i18next.t("common.somethingWentWrong");
      }
      showApiError(msg);
    }

    return res;
  } catch (error) {
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
): Promise<ApiResponse<any>> => {
  try {
    window.dispatchEvent(new Event("mutation-start"));

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

    // SAFELY read body (works for 200, 400, 409, etc.)
    const raw = await delResponse.text();

    let res: ApiResponse<any>;
    try {
      res = JSON.parse(raw);
    } catch {
      throw new Error(raw || i18next.t("common.somethingWentWrong"));
    }

    if (!res.success) {
      let msg: string;
      if (Array.isArray(res.errors) && res.errors.length > 0) {
        msg = res.errors[0];
      } else if (res.errors && typeof res.errors === "object") {
        const allMsgs = Object.values(res.errors as unknown as Record<string, string[]>).flat();
        msg = allMsgs.join("; ") || (res as any).title || res.message || i18next.t("common.somethingWentWrong");
      } else {
        msg = res.message || (res as any).title || i18next.t("common.somethingWentWrong");
      }
      showApiError(msg);
    }

    return res;
  } catch (error) {
    window.dispatchEvent(
      new CustomEvent(API_REQUEST_FAILED, {
        detail: (error as Error).message,
      })
    );

    throw error;
  } finally {
    window.dispatchEvent(new Event(MUTATION_END));
  }
};
// Expose saveTokens so AuthContext can call it after login/refresh
export { saveTokens, getAccessToken };
