import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, Boxes, Users, ShoppingCart, FileText, Globe, Shield, CreditCard, BarChart3, Plus, LogOut, Settings, Menu, X, Bell, Truck, Warehouse, type LucideIcon } from 'lucide-react';
import { api, extractApiError, logoutSession, setActiveShopSlug } from '../../lib/api';
import { Toast } from '../../ui/Toast';
import { MerchantConsoleContext } from './MerchantConsoleContext';
import { useMerchantConsoleState } from './useMerchantConsoleState';
import { IS_DEV, type MerchantTab } from './shared';
import { DashboardSection } from './sections/DashboardSection';
import { SettingsSection } from './sections/SettingsSection';
import { ProductsSection } from './sections/ProductsSection';
import { CategoriesSection } from './sections/CategoriesSection';
import { InventorySection } from './sections/InventorySection';
import { PricingSection } from './sections/PricingSection';
import { CustomersSection } from './sections/CustomersSection';
import { RfqsSection } from './sections/RfqsSection';
import { OrdersSection } from './sections/OrdersSection';
import { InvoicesSection } from './sections/InvoicesSection';
import { ShippingSection } from './sections/ShippingSection';
import { DomainsSection } from './sections/DomainsSection';
import { StaffSection } from './sections/StaffSection';
import { SubscriptionSection } from './sections/SubscriptionSection';
import { NotificationsSection } from './sections/NotificationsSection';
import { ReportsSection } from './sections/ReportsSection';
import { AuditLogsSection } from './sections/AuditLogsSection';
import { NewShopSection } from './sections/NewShopSection';

const NAV_GROUPS: { heading: string; items: { id: MerchantTab; label: string; icon: LucideIcon }[] }[] = [
  {
    heading: 'Overview',
    items: [
      { id: 'overview', label: 'Dashboard & usage', icon: LayoutDashboard },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'reports', label: 'Sales & GST reports', icon: BarChart3 },
    ],
  },
  {
    heading: 'Sell',
    items: [
      { id: 'products', label: 'Products & variants', icon: Package },
      { id: 'categories', label: 'Categories & GST slabs', icon: Boxes },
      { id: 'pricing', label: 'Groups & contract prices', icon: CreditCard },
      { id: 'inventory', label: 'Warehouse stock', icon: Warehouse },
    ],
  },
  {
    heading: 'Orders',
    items: [
      { id: 'rfqs', label: 'RFQs & quotes', icon: FileText },
      { id: 'orders', label: 'Orders, payments & refunds', icon: ShoppingCart },
      { id: 'invoices', label: 'GST invoices', icon: FileText },
      { id: 'shipping', label: 'Shipping & carriers', icon: Truck },
    ],
  },
  {
    heading: 'Customers',
    items: [{ id: 'customers', label: 'Retailers & credit ledger', icon: Users }],
  },
  {
    heading: 'Settings',
    items: [
      { id: 'settings', label: 'Business page & bank', icon: Settings },
      { id: 'domains', label: 'Custom domains & SSL', icon: Globe },
      { id: 'staff', label: 'Staff & roles', icon: Shield },
      { id: 'subscription', label: 'Plan & billing', icon: CreditCard },
      { id: 'audit-logs', label: 'Security audit trail', icon: Shield },
      { id: 'new-shop', label: 'Launch another shop', icon: Plus },
    ],
  },
];

export const MerchantPortal: React.FC = () => {
  const consoleState = useMerchantConsoleState();
  const {
    queryClient,
    token,
    setToken,
    shopSlug,
    setShopSlug,
    activeTab,
    setActiveTab,
    mobileNavOpen,
    setMobileNavOpen,
    authMode,
    setAuthMode,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    forgotPending,
    setForgotPending,
    registerForm,
    setRegisterForm,
    notice,
    setNotice,
    showToast,
    runSafely,
    loginMutation,
    registerAndLaunchMutation,
    meQuery,
    dashboardQuery,
    isUnknownSection,
  } = consoleState;

  if (!token) {
    return (
      <div className="min-h-svh bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl p-8 space-y-5 ">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-slate-900">Merchant Back-Office Console</h1>
            <Link to="/platform" className="text-xs text-[#1b6c80] font-bold hover:underline">
              ← Application Business Page
            </Link>
          </div>

          <div className="flex gap-2   pb-3">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                authMode === 'login' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Sign In to Existing Store
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                authMode === 'register' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              + Register & Launch New Store
            </button>
          </div>

          <Toast toast={notice} onDismiss={() => setNotice(null)} />

          {authMode === 'login' ? (
            <>
              {IS_DEV && (
              <div className="p-3 rounded-lg bg-slate-100 text-xs space-y-2">
                <div className="font-bold text-slate-800">1-Click Demo Wholesale Merchants:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('owner@acmesupplies.in');
                      setLoginPassword('Merchant@123');
                    }}
                    className="px-2.5 py-1.5 rounded bg-slate-900 text-white font-semibold cursor-pointer"
                  >
                    Fill Acme Industrial (owner@acmesupplies.in)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('owner@freshfoods.in');
                      setLoginPassword('Merchant@123');
                    }}
                    className="px-2.5 py-1.5 rounded bg-emerald-700 text-white font-semibold cursor-pointer"
                  >
                    Fill FreshFoods Agro (owner@freshfoods.in)
                  </button>
                </div>
              </div>
              )}
              <form
                className="space-y-3 text-xs"
                onSubmit={(e) => {
                  e.preventDefault();
                  loginMutation.mutate();
                }}
              >
                <div>
                  <label htmlFor="merchant-login-email" className="block font-semibold mb-1">Merchant Email</label>
                  <input
                    id="merchant-login-email"
                    type="email"
                    required
                    autoComplete="username"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="merchant-login-password" className="block font-semibold mb-1">Password</label>
                  <input
                    id="merchant-login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-lg px-3 py-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full py-2.5 rounded-lg bg-slate-900 text-white font-bold cursor-pointer disabled:opacity-60"
                >
                  {loginMutation.isPending ? 'Signing in…' : 'Sign In to Merchant Console'}
                </button>
                <button
                  type="button"
                  disabled={forgotPending}
                  onClick={async () => {
                    const email = (window.prompt('Enter your account email to receive a password reset link:', loginEmail) || '').trim();
                    if (!email) return;
                    setForgotPending(true);
                    try {
                      const res = await api.post('/auth/password/forgot', { email: email.toLowerCase() });
                      showToast(
                        'success',
                        res.data?.message || 'If an account exists for that email, a reset link has been sent.'
                      );
                    } catch (err: any) {
                      showToast('error', extractApiError(err, 'Could not send the reset link. Try again shortly.'));
                    } finally {
                      setForgotPending(false);
                    }
                  }}
                  className="w-full text-center text-slate-600 underline font-semibold cursor-pointer disabled:opacity-60"
                >
                  {forgotPending ? 'Sending reset link…' : 'Forgot password?'}
                </button>
              </form>
            </>
          ) : (
            <form
              className="space-y-3 text-xs"
              onSubmit={(e) => {
                e.preventDefault();
                if (registerForm.owner_password.length < 8) {
                  showToast('error', 'Password must be at least 8 characters.');
                  return;
                }
                registerAndLaunchMutation.mutate();
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  aria-label="Your full name"
                  required
                  placeholder="Your Full Name *"
                  value={registerForm.owner_name}
                  onChange={(e) => setRegisterForm({ ...registerForm, owner_name: e.target.value })}
                  className="rounded-lg px-3 py-2"
                />
                <input
                  aria-label="Business email"
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="Business Email *"
                  value={registerForm.owner_email}
                  onChange={(e) => setRegisterForm({ ...registerForm, owner_email: e.target.value })}
                  className="rounded-lg px-3 py-2"
                />
                <input
                  aria-label="Password"
                  required
                  minLength={8}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Password (min 8 chars) *"
                  value={registerForm.owner_password}
                  onChange={(e) => setRegisterForm({ ...registerForm, owner_password: e.target.value })}
                  className="rounded-lg px-3 py-2"
                />
                <input
                  aria-label="Wholesale brand name"
                  required
                  placeholder="Wholesale Brand Name *"
                  value={registerForm.shop_name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28);
                    setRegisterForm({ ...registerForm, shop_name: name, slug: registerForm.slug || autoSlug });
                  }}
                  className="rounded-lg px-3 py-2"
                />
                <input
                  aria-label="Subdomain slug"
                  required
                  pattern="[a-z0-9-]+"
                  placeholder="Subdomain Slug (e.g. deccan-polymers) *"
                  value={registerForm.slug}
                  onChange={(e) => setRegisterForm({ ...registerForm, slug: e.target.value.toLowerCase() })}
                  className="rounded-lg px-3 py-2 tnum"
                />
                <input
                  aria-label="GSTIN"
                  maxLength={15}
                  placeholder="GSTIN (15-Digit)"
                  value={registerForm.gstin}
                  onChange={(e) => setRegisterForm({ ...registerForm, gstin: e.target.value.toUpperCase() })}
                  className="rounded-lg px-3 py-2 tnum"
                />
              </div>
              <button
                type="submit"
                disabled={registerAndLaunchMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer disabled:opacity-60"
              >
                {registerAndLaunchMutation.isPending
                  ? 'Provisioning Tenant & Subdomain...'
                  : 'Create Account & Launch Wholesale Storefront →'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }


  if (isUnknownSection) {
    return <Navigate to="/merchant/dashboard" replace />;
  }

  return (
    <MerchantConsoleContext.Provider value={consoleState}>
    <div className="min-h-svh flex flex-col lg:flex-row bg-[#f6f7f8] text-[#131416] font-app-workspace tnum">
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between bg-[#181817] text-white px-4 py-3">
        <span className="font-bold text-sm truncate">{dashboardQuery.data?.shop?.name || shopSlug}</span>
        <button
          type="button"
          onClick={() => setMobileNavOpen((open) => !open)}
          aria-expanded={mobileNavOpen}
          aria-controls="merchant-sidebar"
          aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="p-1.5 rounded cursor-pointer"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        id="merchant-sidebar"
        className={`${mobileNavOpen ? 'flex' : 'hidden'} lg:flex w-full lg:w-64 bg-[#181817] text-[#e4e3de] flex-col justify-between p-4 shrink-0`}
      >
        <div className="space-y-4">
          <div className="  pb-3">
            <div className="text-xs tracking-tight text-slate-400">Merchant Workspace</div>
            <div className="font-bold text-base text-white mt-0.5">{dashboardQuery.data?.shop?.name || shopSlug}</div>
            <div className="text-[11px] text-emerald-400 tnum">{shopSlug}.platform-domain.com</div>
          </div>

          {meQuery.data?.shops && meQuery.data.shops.length > 0 && (
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Switch Owned Shop</label>
              <select
                value={shopSlug}
                onChange={(e) => {
                  setActiveShopSlug(e.target.value);
                  setShopSlug(e.target.value);
                  queryClient.invalidateQueries();
                }}
                className="w-full bg-slate-800   rounded px-2 py-1.5 text-xs text-white"
              >
                {meQuery.data.shops.map((s: any) => (
                  <option key={s.id} value={s.slug}>
                    {s.name} ({s.slug})
                  </option>
                ))}
              </select>
            </div>
          )}

          <nav aria-label="Merchant console" className="space-y-4 text-xs">
            {NAV_GROUPS.map((group) => (
              <div key={group.heading}>
                <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {group.heading}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-current={activeTab === item.id ? 'page' : undefined}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileNavOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition cursor-pointer ${
                          activeTab === item.id ? 'bg-[#a1ffcb] text-[#181817] font-semibold' : 'text-[#d4d3ce] hover:bg-[#262624]'
                        }`}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="  pt-3 space-y-2 text-xs">
          <Link to={`/store/${shopSlug}`} className="block text-emerald-300 hover:underline font-bold">
            ↗ View Merchant Business Page
          </Link>
          <Link to="/platform" className="block text-[#a1ffcb] hover:underline">
            ↗ Application Business Page
          </Link>
          <button
            onClick={() =>
  runSafely(async () => {
              await logoutSession('merchant');
              queryClient.clear();
              setToken(null);
            }, 'Action failed. Please try again.')
}
            className="text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 min-w-0 m-2 bg-white rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-6">
        <Toast toast={notice} onDismiss={() => setNotice(null)} />

        {/* OVERVIEW */}
        {activeTab === 'overview' && <DashboardSection />}

        {/* BUSINESS PAGE & BRANDING SETTINGS */}
        {activeTab === 'settings' && <SettingsSection />}

        {/* PRODUCTS & TIER PRICING */}
        {activeTab === 'products' && <ProductsSection />}

        {/* CATEGORIES */}
        {activeTab === 'categories' && <CategoriesSection />}

        {/* INVENTORY */}
        {activeTab === 'inventory' && <InventorySection />}

        {/* PRICING GROUPS & CONTRACT PRICE LISTS */}
        {activeTab === 'pricing' && <PricingSection />}

        {/* CUSTOMERS & RETAILER APPROVAL */}
        {activeTab === 'customers' && <CustomersSection />}

        {/* WHOLESALE RFQS & TRADE INQUIRIES */}
        {activeTab === 'rfqs' && <RfqsSection />}

        {/* ORDERS */}
        {activeTab === 'orders' && <OrdersSection />}

        {/* INVOICES */}
        {activeTab === 'invoices' && <InvoicesSection />}

        {/* SHIPPING METHODS */}
        {activeTab === 'shipping' && <ShippingSection />}

        {/* DOMAINS */}
        {activeTab === 'domains' && <DomainsSection />}

        {/* STAFF */}
        {activeTab === 'staff' && <StaffSection />}

        {/* SUBSCRIPTION */}
        {activeTab === 'subscription' && <SubscriptionSection />}

        {/* NOTIFICATIONS INBOX */}
        {activeTab === 'notifications' && <NotificationsSection />}

        {/* REPORTS */}
        {activeTab === 'reports' && <ReportsSection />}

        {/* SECURITY AUDIT LOGS */}
        {activeTab === 'audit-logs' && <AuditLogsSection />}

        {/* NEW SHOP ONBOARDING */}
        {activeTab === 'new-shop' && <NewShopSection />}
      </main>
    </div>
    </MerchantConsoleContext.Provider>
  );
};
