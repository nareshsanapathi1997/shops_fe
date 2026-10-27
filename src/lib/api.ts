import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
export const PLATFORM_BASE_DOMAIN = (import.meta.env.VITE_PLATFORM_BASE_DOMAIN || 'platform-domain.com').toLowerCase();

export const MERCHANT_TOKEN_KEY = 'ws_merchant_token';
export const ADMIN_TOKEN_KEY = 'ws_admin_token';
export const AUTH_EXPIRED_EVENT = 'ws:auth-expired';

export type AuthSurface = 'customer' | 'merchant' | 'admin';

export function resolveMediaUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/shops/')) {
    return `${BACKEND_ORIGIN}${trimmed}`;
  }
  if (trimmed.startsWith('uploads/shops/')) {
    return `${BACKEND_ORIGIN}/${trimmed}`;
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function generateSecureToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '');
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getCartSessionToken(): string {
  let token = localStorage.getItem('ws_cart_session');
  // Legacy tokens were generated with Math.random() and are guessable; rotate them.
  if (!token || token.length < 32) {
    token = 'sess_' + generateSecureToken();
    localStorage.setItem('ws_cart_session', token);
  }
  return token;
}

export function generateIdempotencyKey(prefix = 'chk'): string {
  return `${prefix}_${generateSecureToken()}`;
}

export function getActiveShopSlug(): string {
  const pathMatch = window.location.pathname.match(/^\/store\/([a-z0-9-]+)/i);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1].toLowerCase();
  }
  const host = window.location.hostname.toLowerCase();
  if (host.endsWith('.' + PLATFORM_BASE_DOMAIN)) {
    return host.replace('.' + PLATFORM_BASE_DOMAIN, '');
  }
  return localStorage.getItem('ws_active_shop_slug') || import.meta.env.VITE_DEFAULT_SHOP_SLUG || 'acme';
}

export function setActiveShopSlug(slug: string): void {
  localStorage.setItem('ws_active_shop_slug', slug.toLowerCase());
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getMerchantToken(): string | null {
  return localStorage.getItem(MERCHANT_TOKEN_KEY);
}

function surfaceForUrl(url?: string): AuthSurface {
  if (url?.startsWith('/storefront')) return 'customer';
  if (url?.startsWith('/admin')) return 'admin';
  return 'merchant';
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const slug = getActiveShopSlug();
  config.headers['X-Shop-Slug'] = slug;
  config.headers['X-Cart-Session'] = getCartSessionToken();

  const surface = surfaceForUrl(config.url);
  const customerToken = localStorage.getItem(`ws_customer_token_${slug}`);

  if (surface === 'customer') {
    if (customerToken) config.headers.Authorization = `Bearer ${customerToken}`;
  } else if (surface === 'admin') {
    const adminToken = getAdminToken();
    if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`;
  } else {
    // Merchant routes; super-admins may also use support access on merchant routes.
    const token = getMerchantToken() || getAdminToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  const supportReason = sessionStorage.getItem('ws_support_access_reason');
  if (supportReason) {
    config.headers['X-Support-Access-Reason'] = supportReason;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string | undefined = error?.config?.url;
    const sentAuth = Boolean(error?.config?.headers?.Authorization);
    // Ignore failed credential submissions; only expire sessions that sent a bearer token.
    if (status === 401 && sentAuth && !url?.startsWith('/auth/login')) {
      const surface = surfaceForUrl(url);
      if (surface === 'customer') {
        localStorage.removeItem(`ws_customer_token_${getActiveShopSlug()}`);
      } else if (surface === 'admin') {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
      } else {
        localStorage.removeItem(MERCHANT_TOKEN_KEY);
      }
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, { detail: { surface } }));
    }
    return Promise.reject(error);
  }
);

/** Best-effort server-side token revocation; always clears the local token. */
export async function logoutSession(surface: 'merchant' | 'admin'): Promise<void> {
  const key = surface === 'admin' ? ADMIN_TOKEN_KEY : MERCHANT_TOKEN_KEY;
  const token = localStorage.getItem(key);
  if (token) {
    try {
      await api.post('/auth/logout', null, { headers: { Authorization: `Bearer ${token}` } });
    } catch {
      // Token may already be expired; local cleanup below is what matters.
    }
  }
  localStorage.removeItem(key);
}

export function extractApiError(err: any, fallback: string): string {
  const errors = err?.response?.data?.errors;
  if (errors && typeof errors === 'object') {
    const first = Object.values(errors).flat()[0];
    if (typeof first === 'string') return first;
  }
  return err?.response?.data?.message || fallback;
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export function formatINR(amount: number | string | undefined | null): string {
  if (amount === null || amount === undefined || amount === '') return '—';
  const num = Number(amount);
  if (!Number.isFinite(num)) return '—';
  return inrFormatter.format(num);
}
