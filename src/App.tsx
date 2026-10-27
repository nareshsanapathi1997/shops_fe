import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlatformBusinessPage } from './pages/platform/PlatformBusinessPage';
import { StorefrontPortal } from './pages/storefront/StorefrontPortal';
import { MerchantPortal } from './pages/merchant/MerchantPortal';
import { AdminPortal } from './pages/admin/AdminPortal';
import { SetPasswordPage } from './pages/merchant/SetPasswordPage';
import { PLATFORM_BASE_DOMAIN } from './lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        // Auth / permission / not-found errors won't succeed on retry.
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
  },
});

const NON_TENANT_LABELS = new Set(['www', 'app', 'platform', 'admin', 'api']);

function detectSubdomainTenant(hostname?: string): string | null {
  if (typeof window === 'undefined' && !hostname) return null;
  const host = (hostname ?? window.location.hostname).toLowerCase();
  const suffix = '.' + PLATFORM_BASE_DOMAIN;
  // Only `{slug}.{base-domain}` is a tenant; the apex domain and any other host
  // (localhost, IPs, preview URLs) serve the platform app.
  if (!host.endsWith(suffix)) return null;
  const label = host.slice(0, -suffix.length);
  if (!label || label.includes('.') || NON_TENANT_LABELS.has(label)) return null;
  return label;
}

/** Remount the storefront per tenant so no customer, cart or catalogue state leaks across shops. */
function KeyedStorefront() {
  const { shopSlug } = useParams<{ shopSlug: string }>();
  return <StorefrontPortal key={shopSlug} />;
}

export function AppRoutes() {
  const subdomainSlug = detectSubdomainTenant();

  if (subdomainSlug) {
    return (
      <div className="min-h-svh flex flex-col bg-[#f5f4f0] text-[#141413]">
        <div className="flex-1">
          <Routes>
            <Route path="/*" element={<StorefrontPortal key={subdomainSlug} forcedSlug={subdomainSlug} />} />
          </Routes>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col bg-white text-[#181817]">
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<PlatformBusinessPage />} />
          <Route path="/platform" element={<PlatformBusinessPage />} />
          <Route path="/store/:shopSlug/*" element={<KeyedStorefront />} />
          <Route path="/store" element={<Navigate to="/" replace />} />
          <Route path="/merchant/set-password" element={<SetPasswordPage />} />
          <Route path="/merchant/*" element={<MerchantPortal />} />
          <Route path="/admin/*" element={<AdminPortal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
