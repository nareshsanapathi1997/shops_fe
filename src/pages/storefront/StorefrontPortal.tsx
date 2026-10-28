import React from 'react';
import { formatINR, resolveMediaUrl } from '../../lib/api';
import { OrdersHistory } from './components/OrdersHistory';
import { Toast } from '../../ui/Toast';
import { StorefrontContext } from './StorefrontContext';
import { useStorefrontState } from './useStorefrontState';
import { type StorefrontTab, DEMO_SEED_SLUGS, type StorefrontPortalProps } from './shared';
import { HomeSection } from './sections/HomeSection';
import { CatalogSection } from './sections/CatalogSection';
import { ProductDetailSection } from './sections/ProductDetailSection';
import { BulkOrderSection } from './sections/BulkOrderSection';
import { AboutSection } from './sections/AboutSection';
import { ContactSection } from './sections/ContactSection';
import { PoliciesSection } from './sections/PoliciesSection';
import { CartSection } from './sections/CartSection';
import { CheckoutSection } from './sections/CheckoutSection';
import { AccountSection } from './sections/AccountSection';

export const StorefrontPortal: React.FC<StorefrontPortalProps> = ({ forcedSlug }) => {
  const storefrontState = useStorefrontState(forcedSlug);
  const {
    activeSlug,
    storeLoadError,
    pendingPayment,
    setPendingPayment,
    payingOrderId,
    shop,
    categories,
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    activeTab,
    designPreset,
    setDesignPreset,
    selectedProduct,
    cartSummary,
    customer,
    orders,
    documentPreview,
    setDocumentPreview,
    toast,
    setToast,
    goToPage,
    loadStorefront,
    handleSearchSubmit,
    handleRetryPayment,
    handleReorder,
    handleViewInvoice,
    handleViewCreditNote,
    cartLineCount,
  } = storefrontState;

  if (storeLoadError && (!shop || !DEMO_SEED_SLUGS.includes(activeSlug) || !import.meta.env.DEV)) {
    return (
      <div className="font-sans-platform min-h-svh flex items-center justify-center bg-[#f3f3f1] p-6 text-[#181817]">
        <div role="alert" className="max-w-md w-full bg-white p-8 text-center space-y-4">
          <h1 className="font-display-platform text-xl font-bold text-[#181817]">Store unavailable</h1>
          <p className="text-sm text-[#575652]">{storeLoadError}</p>
          <button
            type="button"
            onClick={() => loadStorefront(activeSlug)}
            className="px-5 py-2.5 bg-[#181817] text-[#a1ffcb] text-sm font-semibold cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="font-sans-platform min-h-svh flex items-center justify-center bg-[#f3f3f1] p-6" aria-busy="true">
        <p role="status" className="text-sm font-semibold text-[#575652]">
          Loading wholesale store…
        </p>
      </div>
    );
  }

  return (
    <StorefrontContext.Provider value={storefrontState}>
      <div
        className={`font-sans-platform min-h-svh flex flex-col text-[#181817] antialiased selection:bg-[#a1ffcb] selection:text-[#181817] ${
          designPreset === 'classic'
            ? 'bg-[#fafaf7]'
            : designPreset === 'smart'
            ? 'bg-[#ecebe6]'
            : 'bg-[#f3f3f1]'
        }`}
      >
        {/* Toast Notification */}
        <Toast toast={toast} onDismiss={() => setToast(null)} tone="dark" position="bottom" />

        {/* 0. Dynamic Merchant Announcement Bar */}
        {shop?.merchant_settings?.announcement_bar?.enabled &&
          shop?.merchant_settings?.announcement_bar?.text && (
            <div className="bg-[#a1ffcb] text-[#181817] text-xs font-semibold py-2 px-4 text-center">
              {shop.merchant_settings.announcement_bar.text}
            </div>
          )}

        {/* 1. Merchant Statutory Top Utility Bar (100% Merchant-Owned · ZERO SaaS Platform Links) */}
        <div className="bg-[#181817] text-[#d4d3ce] text-xs">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 font-semibold text-[#a1ffcb] tnum">
                <span className="w-2 h-2 bg-[#a1ffcb]" />
                Verified B2B Supplier · GSTIN: {shop?.gstin || '36AABCA8821K1Z5'}
              </span>
              <span className="hidden md:inline text-[#575652]">·</span>
              <span className="hidden md:inline text-[#b8b7b2]">
                ISO 9001:2015 Certified Distribution Hub: {shop?.city || 'Hyderabad'},{' '}
                {shop?.state_code || 'TG'}
              </span>
              <span className="hidden lg:inline text-[#575652]">·</span>
              <span className="bg-[#232321] text-[#a1ffcb] px-2.5 py-0.5 font-semibold text-[11px] tnum">
                Min Wholesale Order (MOV): {formatINR(shop?.min_order_value || 5000)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[12px] tnum">
              {shop?.support_phone && (
                <span className="text-[#b8b7b2] font-medium">
                  Wholesale Desk: <strong className="text-white">{shop.support_phone}</strong>
                </span>
              )}
              {shop?.whatsapp_number && (
                <button
                  type="button"
                  onClick={() => goToPage('contact')}
                  className="text-[#a1ffcb] hover:text-white font-semibold cursor-pointer"
                >
                  WhatsApp RFQ: {shop.whatsapp_number}
                </button>
              )}
              <button
                type="button"
                onClick={() => goToPage('bulk-order')}
                className="hidden sm:inline-block text-white hover:text-[#a1ffcb] font-semibold underline underline-offset-4 cursor-pointer"
              >
                Quick SKU Order Pad
              </button>
            </div>
          </div>
        </div>

        {/* 2. Main Sticky White-Labeled Merchant Brand Header */}
        <header className="bg-[#181817] text-white sticky top-0 z-30">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
            {/* Merchant Brand Emblem & Legal Identity */}
            <div
              onClick={() => goToPage('home')}
              className="flex items-center gap-3.5 cursor-pointer group"
            >
              <img
                src={resolveMediaUrl(
                  shop?.logo_url ||
                    (shop?.slug === 'freshfoods'
                      ? '/uploads/demo/freshfoods-logo.png'
                      : '/uploads/demo/acme-logo.png')
                )}
                alt={shop?.name || 'Wholesale Storefront'}
                className="w-12 h-12 object-contain p-1 shrink-0 bg-white"
              />
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-display-platform text-lg sm:text-xl font-bold text-white tracking-[-0.02em]">
                    {shop?.name || 'Wholesale Storefront'}
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-[#232321] text-[#a1ffcb]">
                    Official B2B Portal
                  </span>
                </div>
                <p className="text-xs text-[#9e9d97] font-medium mt-0.5">
                  {shop?.legal_name || 'Authorized Wholesale Distributor & Institutional Supplier'}
                </p>
              </div>
            </div>

            {/* Global SKU / HSN / Keyword Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 max-w-xl hidden lg:flex items-center bg-[#232321] overflow-hidden"
            >
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  goToPage('catalog');
                }}
                aria-label="Filter by category"
                className="bg-[#2c2c29] text-[#e5e4e0] text-xs font-semibold px-3.5 py-3 border-0 focus:outline-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Product Name, SKU Code, Brand or 8-digit HSN..."
                className="flex-1 px-3.5 py-2.5 text-xs text-white placeholder-[#8c8b85] bg-transparent border-0 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-[#a1ffcb] text-[#181817] text-xs font-semibold hover:bg-[#8ef5be] transition-colors cursor-pointer"
              >
                Search Catalogue
              </button>
            </form>

            {/* Retailer Account & Live Wholesale Cart Controls */}
            <div className="flex items-center gap-2.5 tnum">
              <button
                type="button"
                onClick={() => goToPage('account')}
                className={`px-3.5 py-2.5 text-xs font-semibold transition-colors flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'account'
                    ? 'bg-white text-[#181817]'
                    : 'bg-[#232321] text-white hover:bg-[#2c2c29]'
                }`}
              >
                <span className="w-2 h-2 bg-[#a1ffcb]" />
                <div className="text-left">
                  <div className="text-[10px] opacity-75 leading-none">
                    {customer ? 'Verified Trade Account' : 'Trade Buyer Login'}
                  </div>
                  <div className="text-xs font-bold leading-tight mt-0.5">
                    {customer ? customer.company_name : 'Sign In / KYC'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => goToPage('cart')}
                className="px-4 py-2.5 bg-[#a1ffcb] text-[#181817] hover:bg-[#8ef5be] transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <div className="text-left">
                  <div className="text-[10px] text-[#181817]/75 font-semibold leading-none">
                    Wholesale Cart ({cartLineCount} SKUs)
                  </div>
                  <div className="text-xs font-bold leading-tight mt-0.5">
                    {formatINR(cartSummary?.grand_total || 0)}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Secondary Storefront Navigation Bar (Strictly Merchant Pages Only) */}
          <div className="bg-[#232321]">
            <div className="max-w-[1400px] mx-auto px-5 sm:px-8 flex items-center justify-between overflow-x-auto">
              <nav className="flex items-center gap-1 py-2" aria-label="Merchant Storefront Navigation">
                {(
                  [
                    { id: 'home', label: 'Home' },
                    { id: 'catalog', label: `Product Catalogue (${products.length})` },
                    { id: 'bulk-order', label: 'Rapid Bulk Order Sheet' },
                    { id: 'about', label: 'About Our Company' },
                    { id: 'contact', label: 'Contact & Custom RFQ' },
                    { id: 'policies', label: 'Shipping & Trade Policies' },
                  ] as { id: StorefrontTab; label: string }[]
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goToPage(item.id)}
                    className={`px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === item.id
                        ? 'bg-[#a1ffcb] text-[#181817]'
                        : 'text-[#d4d3ce] hover:text-white hover:bg-[#2c2c29]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                {customer && (
                  <button
                    type="button"
                    onClick={() => goToPage('orders')}
                    className={`px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === 'orders'
                        ? 'bg-[#a1ffcb] text-[#181817]'
                        : 'text-[#a1ffcb] hover:bg-[#2c2c29]'
                    }`}
                  >
                    Orders & GST Invoices ({orders.length})
                  </button>
                )}
              </nav>

              <div className="flex items-center gap-2 py-1.5">
                <span className="hidden xl:inline text-[11px] font-semibold text-[#9e9d97]">
                  Layout:
                </span>
                <div className="inline-flex items-center bg-[#181817] p-0.5">
                  {(
                    [
                      { id: 'classic_smart', label: 'Classic & Smart' },
                      { id: 'classic', label: 'Classic' },
                      { id: 'smart', label: 'Smart' },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setDesignPreset(mode.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                        designPreset === mode.id
                          ? 'bg-[#a1ffcb] text-[#181817]'
                          : 'text-[#b8b7b2] hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          {activeTab === 'home' && shop && <HomeSection />}
          {activeTab === 'catalog' && <CatalogSection />}
          {activeTab === 'product' && selectedProduct && <ProductDetailSection />}
          {activeTab === 'bulk-order' && <BulkOrderSection />}
          {activeTab === 'about' && shop && <AboutSection />}
          {activeTab === 'contact' && shop && <ContactSection />}
          {activeTab === 'policies' && shop && <PoliciesSection />}
          {activeTab === 'cart' && <CartSection />}
          {activeTab === 'checkout' && <CheckoutSection />}
          {activeTab === 'account' && <AccountSection />}
          {activeTab === 'orders' && (
            <OrdersHistory
              orders={orders}
              pendingPayment={pendingPayment}
              payingOrderId={payingOrderId}
              documentPreview={documentPreview}
              onReorder={handleReorder}
              onViewInvoice={handleViewInvoice}
              onViewCreditNote={handleViewCreditNote}
              onRetryPayment={handleRetryPayment}
              onDismissPendingPayment={() => setPendingPayment(null)}
              onClosePreview={() => setDocumentPreview(null)}
            />
          )}
        </main>

        {/* 4. 100% White-Labeled Merchant Business Website Footer (ZERO SaaS Platform Links) */}
        <footer className="bg-[#181817] text-[#b8b7b2] mt-16">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#a1ffcb] flex items-center justify-center text-[#181817] font-bold text-sm">
                  {shop?.name ? shop.name.slice(0, 2).toUpperCase() : 'WS'}
                </div>
                <span className="font-display-platform text-base font-bold text-white">
                  {shop?.name}
                </span>
              </div>
              <p className="text-[#9e9d97] leading-relaxed">
                {shop?.legal_name} · Official B2B Wholesale Procurement & Distribution Portal.
              </p>
              <div className="tnum text-[12px] text-[#a1ffcb] font-semibold">
                Verified GSTIN: {shop?.gstin}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold text-[13px] mb-3">
                Wholesale Navigation
              </h4>
              <ul className="space-y-2.5 text-[#9e9d97]">
                <li>
                  <button
                    type="button"
                    onClick={() => goToPage('home')}
                    className="hover:text-white cursor-pointer"
                  >
                    Storefront Home
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => goToPage('catalog')}
                    className="hover:text-white cursor-pointer"
                  >
                    Complete Product Catalogue
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => goToPage('bulk-order')}
                    className="hover:text-white cursor-pointer"
                  >
                    Rapid Multi-SKU Bulk Order Sheet
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => goToPage('account')}
                    className="hover:text-white cursor-pointer"
                  >
                    Retailer Login & Trade Credit Application
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-[13px] mb-3">
                Corporate & Governance
              </h4>
              <ul className="space-y-2.5 text-[#9e9d97]">
                <li>
                  <button
                    type="button"
                    onClick={() => goToPage('about')}
                    className="hover:text-white cursor-pointer"
                  >
                    About {shop?.name} & Warehouses
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => goToPage('contact')}
                    className="hover:text-white cursor-pointer"
                  >
                    Contact Sales & Custom Bulk RFQ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => goToPage('policies')}
                    className="hover:text-white cursor-pointer"
                  >
                    Shipping, Returns & B2B Trade Policies
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-[13px] mb-3">
                Dispatch Hub & Settlement
              </h4>
              <p className="text-[#9e9d97] leading-relaxed">
                {shop?.address_line1}, {shop?.city}, {shop?.state_code} - {shop?.postal_code}
              </p>
              <p className="mt-2 text-white font-semibold tnum">Helpline: {shop?.support_phone}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                <span className="px-2.5 py-1 bg-[#232321] text-[#e5e4e0]">NEFT / RTGS</span>
                <span className="px-2.5 py-1 bg-[#232321] text-[#e5e4e0]">Corporate UPI</span>
                <span className="px-2.5 py-1 bg-[#232321] text-[#a1ffcb]">Net Credit Line</span>
              </div>
            </div>
          </div>

          <div className="bg-[#121211] py-4 text-center text-[12px] text-[#8c8b85]">
            © 2026 {shop?.legal_name || shop?.name}. All rights reserved. Statutory GST E-Invoicing &
            Wholesale Supply Portal.
          </div>
        </footer>
      </div>
    </StorefrontContext.Provider>
  );
};
