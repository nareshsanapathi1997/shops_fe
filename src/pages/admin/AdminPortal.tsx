import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ShieldAlert, Building2, Globe, CreditCard, Activity, LogOut } from 'lucide-react';
import {
  ADMIN_TOKEN_KEY,
  AUTH_EXPIRED_EVENT,
  api,
  extractApiError,
  formatINR,
  getAdminToken,
  logoutSession,
} from '../../lib/api';
import { useDocumentTitle } from '../../lib/useDocumentTitle';

const SHOW_DEMO_CREDENTIALS = import.meta.env.DEV;

const ADMIN_SECTIONS = ['merchants', 'plans', 'domains', 'settings', 'audit'] as const;
type AdminSection = (typeof ADMIN_SECTIONS)[number];

export const AdminPortal: React.FC = () => {
  useDocumentTitle('Super Admin · Wholesale SaaS');
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(getAdminToken());
  const [loginEmail, setLoginEmail] = useState(SHOW_DEMO_CREDENTIALS ? 'admin@platform-domain.com' : '');
  const [loginPassword, setLoginPassword] = useState(SHOW_DEMO_CREDENTIALS ? 'Admin@12345' : '');

  // The active tab lives in the URL (/admin/plans, ...) so refresh and back/forward keep the place.
  const navigate = useNavigate();
  const { '*': sectionParam = '' } = useParams();
  const requestedSection = sectionParam.split('/')[0];
  const activeSection: AdminSection = (ADMIN_SECTIONS as readonly string[]).includes(requestedSection)
    ? (requestedSection as AdminSection)
    : 'merchants';
  const setActiveSection = (section: AdminSection) => navigate(`/admin/${section}`);
  const [message, setMessage] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState({ name: '', slug: '', price_monthly: 3499, max_products: 1000, max_staff: 15, description: '' });
  const [platformSettingsForm, setPlatformSettingsForm] = useState({
    platform_name: 'India Wholesale B2B Cloud',
    support_email: 'enterprise@platform-domain.com',
    support_phone: '+91 40 6789 1200',
    announcement_banner: 'Live Multi-Tenant B2B Wholesale SaaS · Instant Subdomain & Custom Domain Provisioning',
    default_trial_days: 14,
  });

  useEffect(() => {
    const onExpired = (e: Event) => {
      if ((e as CustomEvent).detail?.surface === 'admin') {
        setToken(null);
        queryClient.clear();
        setMessage('Your admin session has expired. Please sign in again.');
      }
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
      return res.data;
    },
    onSuccess: (data) => {
      if (!data?.user?.is_super_admin) {
        setMessage('This account does not have platform super-admin access.');
        return;
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setToken(data.token);
      setMessage(null);
      queryClient.invalidateQueries();
    },
    onError: (err: any) => {
      setMessage(extractApiError(err, 'Super-Admin login failed.'));
    },
  });

  const overviewQuery = useQuery({
    queryKey: ['admin-overview', token],
    enabled: Boolean(token),
    queryFn: async () => {
      const res = await api.get('/admin/overview');
      return res.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (payload: { shopId: number; status: 'active' | 'suspended'; reason?: string }) => {
      const res = await api.put(`/admin/shops/${payload.shopId}/status`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      setMessage('Shop operational status updated and recorded in platform audit log.');
    },
    onError: (err: any) => setMessage(extractApiError(err, 'Could not update shop status.')),
  });

  const runAction = async (action: () => Promise<unknown>, successMessage: string, failureMessage: string) => {
    try {
      await action();
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      setMessage(successMessage);
    } catch (err) {
      setMessage(extractApiError(err, failureMessage));
    }
  };

  const overviewStatus = (overviewQuery.error as any)?.response?.status;
  const overviewForbidden = overviewStatus === 401 || overviewStatus === 403;

  if (overviewQuery.isError && !overviewForbidden) {
    return (
      <div className="min-h-svh bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 space-y-4 text-sm" role="alert">
          <h1 className="text-xl font-extrabold text-slate-900">Platform data unavailable</h1>
          <p className="text-slate-600">The admin API could not be reached. Check that the backend is running and try again.</p>
          <button
            onClick={() => overviewQuery.refetch()}
            className="w-full py-2.5 rounded-lg bg-[#181817] text-white font-bold text-xs cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!token || overviewForbidden) {
    return (
      <div className="min-h-svh bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-slate-900">SaaS Super-Admin Console</h1>
            <Link to="/" className="text-xs text-blue-600 font-semibold hover:underline">
              ← Storefront
            </Link>
          </div>
          {SHOW_DEMO_CREDENTIALS && (
            <div className="p-3 rounded-lg bg-[#181817] text-[#a1ffcb] text-xs">
              Demo Super-Admin Credentials (dev only):<br />
              <code>admin@platform-domain.com</code> / <code>Admin@12345</code>
            </div>
          )}
          {message && <div role="alert" className="p-2 rounded bg-rose-50 text-rose-800 text-xs">{message}</div>}
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              loginMutation.mutate();
            }}
          >
            <label className="block text-xs font-semibold text-slate-700" htmlFor="admin-login-email">
              Email
              <input
                id="admin-login-email"
                type="email"
                required
                autoComplete="username"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="mt-1 w-full rounded-lg px-3 py-2 text-xs font-normal"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-700" htmlFor="admin-login-password">
              Password
              <input
                id="admin-login-password"
                type="password"
                required
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="mt-1 w-full rounded-lg px-3 py-2 text-xs font-normal"
              />
            </label>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-2.5 rounded-lg bg-[#181817] text-white font-bold text-xs cursor-pointer disabled:opacity-60"
            >
              {loginMutation.isPending ? 'Signing in…' : 'Sign In as Platform Owner'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const metrics = overviewQuery.data?.metrics;

  return (
    <div className="min-h-svh bg-[#f6f7f8] text-[#131416] font-app-workspace tnum">
      <header className="bg-[#181817] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-[#a1ffcb]" />
          <div>
            <h1 className="text-lg font-bold">Wholesale SaaS Platform Super-Admin</h1>
            <p className="text-xs text-slate-400">Central Governance, Subscriptions, Tenant Isolation & Domains</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link to="/" className="text-amber-300 hover:underline">Storefront</Link>
          <Link to="/merchant" className="text-blue-300 hover:underline">Merchant Console</Link>
          <button
            onClick={async () => {
              await logoutSession('admin');
              queryClient.clear();
              setToken(null);
            }}
            className="text-rose-400 flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {message && (
          <div role="status" aria-live="polite" className="p-3 rounded-lg bg-emerald-50 text-emerald-900 text-xs font-semibold flex justify-between gap-3">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} aria-label="Dismiss message" className="cursor-pointer">×</button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl  ">
            <div className="text-xs text-slate-500">Total Tenant Shops</div>
            <div className="text-2xl font-extrabold text-slate-900">{metrics?.total_shops || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl  ">
            <div className="text-xs text-slate-500">Monthly Recurring Revenue (MRR)</div>
            <div className="text-2xl font-extrabold text-emerald-700">
              {formatINR(metrics?.monthly_recurring_revenue)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl  ">
            <div className="text-xs text-slate-500">Platform Wholesale GMV</div>
            <div className="text-2xl font-extrabold text-slate-900">{formatINR(metrics?.platform_gmv)}</div>
          </div>
          <div className="bg-white p-4 rounded-xl  ">
            <div className="text-xs text-slate-500">Verified Tenant Domains</div>
            <div className="text-2xl font-extrabold text-blue-700">{metrics?.verified_domains || 0}</div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
          {[
            { id: 'merchants', label: 'Tenant Merchants & Suspension', icon: Building2 },
            { id: 'plans', label: 'SaaS Subscription Plans', icon: CreditCard },
            { id: 'domains', label: 'Subdomains & Custom SSL', icon: Globe },
            { id: 'settings', label: 'Platform Config & Webhooks', icon: ShieldAlert },
            { id: 'audit', label: 'Platform Security Audit Trail', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeSection === tab.id}
              onClick={() => setActiveSection(tab.id as AdminSection)}
              className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                activeSection === tab.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-700  '
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeSection === 'merchants' && (
          <div className="bg-white rounded-xl   p-5 text-xs">
            <h2 className="font-bold text-base mb-3">Registered Wholesale Merchants</h2>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2.5">Shop Name</th>
                  <th className="p-2.5">Subdomain</th>
                  <th className="p-2.5">GSTIN / State</th>
                  <th className="p-2.5">SKUs / Orders</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Governance</th>
                </tr>
              </thead>
              <tbody className=" divide-slate-200">
                {(overviewQuery.data?.shops || []).map((s: any) => (
                  <tr key={s.id}>
                    <td className="p-2.5 font-bold">{s.name}</td>
                    <td className="p-2.5 tnum text-blue-700">{s.slug}.platform-domain.com</td>
                    <td className="p-2.5">{s.gstin} ({s.state_code})</td>
                    <td className="p-2.5">{s.products_count} SKUs • {s.orders_count} Orders</td>
                    <td className="p-2.5 uppercase font-bold">{s.status}</td>
                    <td className="p-2.5 space-x-2">
                      {s.status === 'active' ? (
                        <button
                          onClick={() => {
                            const reason = window.prompt(
                              `Suspending "${s.name}" takes its storefront offline for all buyers.\nEnter a reason for the audit log:`
                            );
                            if (!reason || !reason.trim()) return;
                            statusMutation.mutate({ shopId: s.id, status: 'suspended', reason: reason.trim() });
                          }}
                          disabled={statusMutation.isPending}
                          className="px-2.5 py-1 rounded bg-rose-600 text-white font-semibold cursor-pointer"
                        >
                          Suspend Shop
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (!window.confirm(`Reactivate "${s.name}"?`)) return;
                            statusMutation.mutate({ shopId: s.id, status: 'active' });
                          }}
                          disabled={statusMutation.isPending}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold cursor-pointer"
                        >
                          Reactivate Shop
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {(overviewQuery.data?.shops || []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      {overviewQuery.isLoading ? 'Loading merchants…' : 'No merchant shops registered yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {activeSection === 'plans' && (
          <div className="space-y-4 text-xs">
            <div className="bg-white p-5 rounded-xl   space-y-3">
              <h2 className="font-bold text-base">Create or Update SaaS Subscription Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                <input
                  placeholder="Plan Name (e.g. Scale Plus)"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                  className="  rounded px-2.5 py-1.5"
                />
                <input
                  type="number"
                  placeholder="Monthly Price (₹)"
                  value={newPlan.price_monthly}
                  onChange={(e) => setNewPlan({ ...newPlan, price_monthly: Number(e.target.value) })}
                  className="  rounded px-2.5 py-1.5"
                />
                <input
                  type="number"
                  placeholder="Max Products"
                  value={newPlan.max_products}
                  onChange={(e) => setNewPlan({ ...newPlan, max_products: Number(e.target.value) })}
                  className="  rounded px-2.5 py-1.5"
                />
                <input
                  placeholder="Plan Description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  className="  rounded px-2.5 py-1.5"
                />
                <button
                  onClick={async () => {
                    if (!newPlan.name.trim()) {
                      setMessage('Enter a plan name before saving.');
                      return;
                    }
                    const planName = newPlan.name;
                    await runAction(
                      async () => {
                        await api.post('/admin/plans', newPlan);
                        setNewPlan({ name: '', slug: '', price_monthly: 3499, max_products: 1000, max_staff: 15, description: '' });
                      },
                      `Subscription plan "${planName}" published across platform.`,
                      'Could not save the subscription plan.'
                    );
                  }}
                  className="px-3 py-1.5 rounded bg-[#181817] text-white font-bold cursor-pointer"
                >
                  + Save Plan
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(overviewQuery.data?.plans || []).map((plan: any) => (
                <div key={plan.id} className="bg-white p-5 rounded-xl   space-y-2">
                  <div className="font-bold text-base text-slate-900">{plan.name}</div>
                  <div className="text-xl font-extrabold text-blue-700">{formatINR(plan.price_monthly ?? plan.monthly_price)} / mo</div>
                  <p className="text-slate-600">{plan.description}</p>
                  <div>Max Products: <strong>{plan.max_products}</strong> • Max Staff: <strong>{plan.max_staff_users ?? plan.max_staff}</strong></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'domains' && (
          <div className="bg-white rounded-xl   p-5 text-xs">
            <h2 className="font-bold text-base mb-3">All Tenant Subdomains & Custom Domains</h2>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2">Hostname</th>
                  <th className="p-2">Shop</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">DNS Verification</th>
                  <th className="p-2">SSL Certificate</th>
                  <th className="p-2">Admin Override</th>
                </tr>
              </thead>
              <tbody className=" divide-slate-200">
                {(overviewQuery.data?.domains || []).map((d: any) => (
                  <tr key={d.id}>
                    <td className="p-2 tnum font-bold">{d.hostname}</td>
                    <td className="p-2">{d.shop?.name}</td>
                    <td className="p-2">{d.type}</td>
                    <td className="p-2 font-bold">{d.verification_status}</td>
                    <td className="p-2">{d.ssl_status}</td>
                    <td className="p-2">
                      <button
                        onClick={async () => {
                          if (
                            !window.confirm(
                              `Force-verify ${d.hostname} without DNS proof? Only do this after confirming ownership out-of-band.`
                            )
                          )
                            return;
                          await runAction(
                            () =>
                              api.put(`/admin/domains/${d.id}`, {
                                verification_status: 'verified',
                                ssl_status: 'active',
                              }),
                            `Domain ${d.hostname} verified & SSL activated.`,
                            `Could not verify ${d.hostname}.`
                          );
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold cursor-pointer"
                      >
                        Force Verify + SSL
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="bg-white rounded-xl   p-5 text-xs space-y-4">
            <h2 className="font-bold text-base">Dynamic Platform Configuration & Feature Entitlements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold mb-1">Platform Brand Name</label>
                <input
                  value={platformSettingsForm.platform_name}
                  onChange={(e) => setPlatformSettingsForm({ ...platformSettingsForm, platform_name: e.target.value })}
                  className="w-full   rounded px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Support Email</label>
                <input
                  value={platformSettingsForm.support_email}
                  onChange={(e) => setPlatformSettingsForm({ ...platformSettingsForm, support_email: e.target.value })}
                  className="w-full   rounded px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Global Announcement Banner</label>
                <input
                  value={platformSettingsForm.announcement_banner}
                  onChange={(e) => setPlatformSettingsForm({ ...platformSettingsForm, announcement_banner: e.target.value })}
                  className="w-full   rounded px-3 py-1.5"
                />
              </div>
            </div>
            <button
              onClick={() =>
                runAction(
                  () => api.put('/admin/platform-settings', platformSettingsForm),
                  'Global platform configuration saved to database.',
                  'Could not save platform settings.'
                )
              }
              className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold cursor-pointer"
            >
              Save Platform Settings
            </button>
          </div>
        )}

        {activeSection === 'audit' && (
          <div className="bg-white rounded-xl   p-5 text-xs">
            <h2 className="font-bold text-base mb-3">Platform-Wide Security & Support Audit Trail</h2>
            <div className="space-y-2">
              {(overviewQuery.data?.audit_logs || []).map((log: any) => (
                <div key={log.id} className="p-2.5 rounded   flex justify-between">
                  <div>
                    <span className="tnum font-bold text-slate-900">{log.action}</span>
                    <span className="ml-2 text-slate-500">
                      Shop: {log.shop?.name || 'Platform'} • Actor: {log.actor_user?.email || log.actor_type}
                    </span>
                  </div>
                  <span className="text-slate-400">{log.ip_address}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
