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
    primaryColor,
    accentColor,
    cartLineCount,
  } = storefrontState;

  if (storeLoadError && (!shop || !DEMO_SEED_SLUGS.includes(activeSlug) || !import.meta.env.DEV)) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-slate-50 p-6">
        <div role="alert" className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
          <h1 className="text-xl font-black text-slate-900">Store unavailable</h1>
          <p className="text-sm text-slate-600">{storeLoadError}</p>
          <button
            type="button"
            onClick={() => loadStorefront(activeSlug)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-slate-50 p-6" aria-busy="true">
        <p role="status" className="text-sm font-semibold text-slate-500">
          Loading wholesale store…
        </p>
      </div>
    );
  }

  return (
    <StorefrontContext.Provider value={storefrontState}>
    <div className={`min-h-svh flex flex-col text-slate-900 ${designPreset === "classic" ? "bg-[#fafaf7]" : designPreset === "smart" ? "bg-slate-100" : "bg-slate-50"}`}>
      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} tone="dark" position="bottom" />

      {/* 0. Dynamic Merchant Announcement Bar */}
      {shop?.merchant_settings?.announcement_bar?.enabled && shop?.merchant_settings?.announcement_bar?.text && (
        <div className="bg-amber-400 text-slate-950 text-xs font-extrabold py-1.5 px-4 text-center">
          {shop.merchant_settings.announcement_bar.text}
        </div>
      )}

      {/* 1. Merchant Statutory Top Utility Bar (100% Merchant-Owned · ZERO SaaS Platform Links) */}
      <div
        style={{ backgroundColor: primaryColor }}
        className="text-white/90 text-xs  "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 " />
              Verified B2B Supplier • GSTIN: {shop?.gstin || '36AABCA8821K1Z5'}
            </span>
            <span className="hidden md:inline text-white/30">|</span>
            <span className="hidden md:inline text-white/80">
              ISO 9001:2015 Certified Distribution Hub: {shop?.city || 'Hyderabad'}, {shop?.state_code || 'TG'}
            </span>
            <span className="hidden lg:inline text-white/30">|</span>
            <span className="bg-amber-400/20 text-amber-200   px-2.5 py-0.5 rounded-full font-bold text-[11px]">
              Min Wholesale Order (MOV): {formatINR(shop?.min_order_value || 5000)}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {shop?.support_phone && (
              <span className="text-white/85 font-medium">
                Wholesale Desk: <strong className="text-white">{shop.support_phone}</strong>
              </span>
            )}
            {shop?.whatsapp_number && (
              <button
                type="button"
                onClick={() => goToPage('contact')}
                className="text-emerald-300 hover:text-emerald-200 font-semibold cursor-pointer"
              >
                WhatsApp RFQ: {shop.whatsapp_number}
              </button>
            )}
            <button
              type="button"
              onClick={() => goToPage('bulk-order')}
              className="hidden sm:inline-block text-amber-300 hover:text-amber-200 font-bold underline underline-offset-4 cursor-pointer"
            >
              Quick SKU Order Pad
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Sticky White-Labeled Merchant Brand Header */}
      <header className="bg-white   sticky top-0 z-30 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Merchant Brand Emblem & Legal Identity */}
          <div
            onClick={() => goToPage('home')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            {shop?.logo_url ? (
              <img
                src={resolveMediaUrl(shop.logo_url)}
                alt={shop.name}
                className="w-12 h-12 rounded-2xl object-cover    group-hover:scale-105 transition-transform"
              />
            ) : (
              <div
                style={{
                  backgroundColor: primaryColor,
                }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl  group-hover:scale-105 transition-transform"
              >
                {shop?.name ? shop.name.slice(0, 2).toUpperCase() : 'WS'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {shop?.name || 'Wholesale Storefront'}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight bg-blue-50 text-blue-700  ">
                  Official B2B Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {shop?.legal_name || 'Authorized Wholesale Distributor & Institutional Supplier'}
              </p>
            </div>
          </div>

          {/* Global SKU / HSN / Keyword Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl hidden lg:flex items-center bg-slate-50   rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition"
          >
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                goToPage('catalog');
              }}
              aria-label="Filter by category"
              className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-2.5   border-0 focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer"
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
              className="flex-1 px-3.5 py-2 text-xs text-slate-900 bg-transparent border-0 focus:outline-none"
            />
            <button
              type="submit"
              style={{ backgroundColor: primaryColor }}
              className="px-4 py-2.5 text-white text-xs font-bold hover:opacity-95 transition cursor-pointer"
            >
              Search Catalogue
            </button>
          </form>

          {/* Retailer Account & Live Wholesale Cart Controls */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => goToPage('account')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold  transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-slate-900 text-white '
                  : 'bg-white text-slate-700  hover:bg-slate-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-medium leading-none">
                  {customer ? 'Verified Trade Buyer' : 'Retailer Portal'}
                </div>
                <div className="font-bold leading-tight mt-0.5">
                  {customer ? customer.company_name : 'Buyer Sign In / Apply'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => goToPage('cart')}
              style={{ backgroundColor: accentColor }}
              className="px-4 py-2 rounded-xl text-white text-xs font-bold  hover:opacity-95 transition flex items-center gap-2.5 cursor-pointer"
            >
              <div className="text-left">
                <div className="text-[10px] text-white/80 font-medium leading-none">
                  Wholesale Cart ({cartLineCount} SKUs)
                </div>
                <div className="text-xs font-extrabold leading-tight mt-0.5">
                  {formatINR(cartSummary?.grand_total || 0)}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 3. Secondary Storefront Navigation Bar (Strictly Merchant Pages Only) */}
        <div className="bg-slate-50/90  ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto">
            <nav className="flex items-center gap-1 py-1.5" aria-label="Merchant Storefront Navigation">
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
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-slate-900 text-white '
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {customer && (
                <button
                  type="button"
                  onClick={() => goToPage('orders')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-slate-900 text-white '
                      : 'text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  Orders & GST Invoices ({orders.length})
                </button>
              )}
            </nav>

            <div className="flex items-center gap-2 py-1">
              <span className="hidden xl:inline text-[11px] font-bold text-slate-500 tracking-tight">
                UI Mode:
              </span>
              <div className="inline-flex items-center rounded-lg bg-white   p-0.5 ">
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
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                      designPreset === mode.id
                        ? 'bg-slate-900 text-white '
                        : 'text-slate-600 hover:text-slate-900'
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
        {/* HOME TAB: Complete Flagship B2B Wholesale Brand Website */}
        {activeTab === 'home' && shop && <HomeSection />}

        {/* CATALOG TAB: Full Wholesale Catalogue with Sidebar Filters & Grid/Table Toggle */}
        {activeTab === 'catalog' && <CatalogSection />}

        {/* PRODUCT DETAIL & LIVE QUOTE CALCULATOR TAB */}
        {activeTab === 'product' && selectedProduct && <ProductDetailSection />}

        {/* BULK ORDER SHEET TAB: Spreadsheet-Style Multi-SKU Procurement Pad */}
        {activeTab === 'bulk-order' && <BulkOrderSection />}

        {/* ABOUT OUR COMPANY TAB */}
        {activeTab === 'about' && shop && <AboutSection />}

        {/* CONTACT & CUSTOM B2B RFQ TAB */}
        {activeTab === 'contact' && shop && <ContactSection />}

        {/* SHIPPING & TRADE POLICIES TAB */}
        {activeTab === 'policies' && shop && <PoliciesSection />}

        {/* WHOLESALE CART TAB */}
        {activeTab === 'cart' && <CartSection />}

        {/* CHECKOUT TAB */}
        {activeTab === 'checkout' && <CheckoutSection />}

        {/* RETAILER ACCOUNT TAB */}
        {activeTab === 'account' && <AccountSection />}

        {/* ORDERS & PRINTABLE GST TAX INVOICE TAB */}
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
      <footer className="bg-slate-950 text-slate-400   mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                style={{ backgroundColor: accentColor }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
              >
                {shop?.name ? shop.name.slice(0, 2).toUpperCase() : 'WS'}
              </div>
              <span className="text-base font-extrabold text-white">{shop?.name}</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {shop?.legal_name} · Official B2B Wholesale Procurement & Distribution Portal.
            </p>
            <div className="tnum text-[11px] text-emerald-400 font-semibold">
              Verified GSTIN: {shop?.gstin}
            </div>
          </div>

          <div>
            <h4 className="text-white font-extrabold tracking-tight text-[11px] mb-3">
              Wholesale Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <button type="button" onClick={() => goToPage('home')} className="hover:text-white cursor-pointer">
                  Storefront Home
                </button>
              </li>
              <li>
                <button type="button" onClick={() => goToPage('catalog')} className="hover:text-white cursor-pointer">
                  Complete Product Catalogue
                </button>
              </li>
              <li>
                <button type="button" onClick={() => goToPage('bulk-order')} className="hover:text-white cursor-pointer">
                  Rapid Multi-SKU Bulk Order Sheet
                </button>
              </li>
              <li>
                <button type="button" onClick={() => goToPage('account')} className="hover:text-white cursor-pointer">
                  Retailer Login & Trade Credit Application
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-extrabold tracking-tight text-[11px] mb-3">
              Corporate & Governance
            </h4>
            <ul className="space-y-2">
              <li>
                <button type="button" onClick={() => goToPage('about')} className="hover:text-white cursor-pointer">
                  About {shop?.name} & Warehouses
                </button>
              </li>
              <li>
                <button type="button" onClick={() => goToPage('contact')} className="hover:text-white cursor-pointer">
                  Contact Sales & Custom Bulk RFQ
                </button>
              </li>
              <li>
                <button type="button" onClick={() => goToPage('policies')} className="hover:text-white cursor-pointer">
                  Shipping, Returns & B2B Trade Policies
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-extrabold tracking-tight text-[11px] mb-3">
              Dispatch Hub & Settlement
            </h4>
            <p className="text-slate-400 leading-relaxed">
              {shop?.address_line1}, {shop?.city}, {shop?.state_code} - {shop?.postal_code}
            </p>
            <p className="mt-2 text-slate-300 font-semibold">Helpline: {shop?.support_phone}</p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-slate-900   text-slate-300">
                NEFT / RTGS
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900   text-slate-300">
                Corporate UPI
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900   text-slate-300">
                Net Credit Line
              </span>
            </div>
          </div>
        </div>

        <div className="  py-4 text-center text-[11px] text-slate-500">
          © 2026 {shop?.legal_name || shop?.name}. All rights reserved. Statutory GST E-Invoicing & Wholesale Supply Portal.
        </div>
      </footer>
    </div>
    </StorefrontContext.Provider>
  );
};
