import { formatINR, resolveMediaUrl } from '../../../lib/api';
import { ProductVisual } from '../../../components/ProductVisual';
import { useStorefront } from '../StorefrontContext';

export function HomeSection() {
  const {
    shop,
    categories,
    products,
    setSelectedCategory,
    designPreset,
    activeHeroSlideIdx,
    setActiveHeroSlideIdx,
    setSelectedProduct,
    setQuoteQty,
    customer,
    goToPage,
    handleAddToCart,
    primaryColor,
    accentColor,
    renderProductCard,
  } = useStorefront();
  if (!shop) return null;

  return (
    <div>
      {/* 1. Asymmetric Executive Split Hero (Matches Main Application Home Page Design) */}
      <section className="bg-[#181817] text-white relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex flex-wrap items-center gap-2.5 bg-[#232321] px-3.5 py-1.5 text-xs font-medium text-[#d4d3ce]">
              <span className="w-2 h-2 bg-[#a1ffcb]" />
              <span>{shop.legal_name || shop.name}</span>
              <span className="text-[#666560]">·</span>
              <span className="text-[#a1ffcb] font-semibold tnum">GSTIN: {shop.gstin}</span>
            </div>

            {(() => {
              const slides = shop.merchant_settings?.hero_slides || [];
              const activeSlide = slides[activeHeroSlideIdx] || null;
              return (
                <>
                  {slides.length > 1 && (
                    <div className="flex flex-wrap items-center gap-2">
                      {slides.map((sl, idx) => (
                        <button
                          key={sl.id || idx}
                          type="button"
                          onClick={() => setActiveHeroSlideIdx(idx)}
                          className={`px-3 py-1.5 text-[12px] font-semibold transition-colors cursor-pointer ${
                            activeHeroSlideIdx === idx
                              ? 'bg-[#a1ffcb] text-[#181817]'
                              : 'bg-[#232321] text-[#b8b7b2] hover:text-white'
                          }`}
                        >
                          {idx + 1}. {sl.eyebrow || sl.badge || `Campaign ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  )}
                  <h2
                    className={`font-display-platform text-[clamp(2rem,3.6vw,3.35rem)] font-bold tracking-[-0.03em] leading-[1.06] text-white ${
                      designPreset === 'classic' ? 'font-serif' : ''
                    }`}
                  >
                    {activeSlide?.title ||
                      shop.hero_title ||
                      `Direct Factory-to-Retailer Wholesale Supply from ${shop.name}`}
                  </h2>

                  <p className="text-[#b8b7b2] text-[16px] leading-[1.6] max-w-[60ch]">
                    {activeSlide?.subtitle ||
                      shop.hero_subtitle ||
                      'Authorized bulk distributor offering tiered slab discounts, contract rate lists, 100% GST Input Tax Credit invoices, and same-day dispatch.'}
                  </p>

                  {(activeSlide?.image_url || shop.banner_url) && (
                    <div className="overflow-hidden bg-[#232321] max-w-2xl relative">
                      <img
                        src={resolveMediaUrl(activeSlide?.image_url || shop.banner_url)}
                        alt={activeSlide?.title || shop.name}
                        className="w-full h-44 sm:h-52 object-cover object-center opacity-90"
                      />
                      <div className="bg-[#232321] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#d4d3ce] tnum">
                        <span>
                          Primary Dispatch Hub:{' '}
                          <strong className="text-white">
                            {shop.city}, {shop.state_code}
                          </strong>
                        </span>
                        <span className="text-[#a1ffcb] font-semibold">
                          MOV: {formatINR(shop.min_order_value || 5000)}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => goToPage('catalog')}
                className="px-6 py-3.5 bg-[#a1ffcb] text-[#181817] font-semibold text-sm hover:bg-[#8ef5be] transition-colors cursor-pointer"
              >
                Explore Full Wholesale Catalogue →
              </button>
              <button
                type="button"
                onClick={() => goToPage('bulk-order')}
                className="px-5 py-3.5 bg-[#232321] hover:bg-[#2c2c29] text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Open Rapid Bulk Order Sheet
              </button>
              <button
                type="button"
                onClick={() => goToPage('account')}
                className="px-5 py-3.5 bg-[#0d5c3a] hover:bg-[#0a4a2e] text-white font-semibold text-sm transition-colors cursor-pointer tnum"
              >
                {customer
                  ? `Credit Limit: ${formatINR(customer.credit_limit)}`
                  : 'Apply for Trade Credit Account'}
              </button>
            </div>

            {/* Key B2B Metrics Ledger Strip */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 tnum">
              <div className="bg-[#232321] p-4">
                <div className="font-display-platform text-xl font-bold text-white">
                  {products.length}+ SKUs
                </div>
                <div className="text-[12px] text-[#9e9d97] mt-1">Ready Warehouse Stock</div>
              </div>
              <div className="bg-[#232321] p-4">
                <div className="font-display-platform text-xl font-bold text-[#a1ffcb]">
                  Up to 22%
                </div>
                <div className="text-[12px] text-[#9e9d97] mt-1">Volume Slab Discounts</div>
              </div>
              <div className="bg-[#232321] p-4">
                <div className="font-display-platform text-xl font-bold text-white">100% ITC</div>
                <div className="text-[12px] text-[#9e9d97] mt-1">GSTN-Compliant Invoices</div>
              </div>
              <div className="bg-[#232321] p-4">
                <div className="font-display-platform text-xl font-bold text-[#a1ffcb]">
                  {shop.merchant_settings?.dispatch_sla_hours || 24} Hr SLA
                </div>
                <div className="text-[12px] text-[#9e9d97] mt-1">From {shop.city} Hub</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Quick Wholesale Slab & GST Preview Workbench */}
          {products[0] && (
            <div
              data-ui="featured-lot-card"
              className="lg:col-span-5 bg-white text-[#181817] p-6 tnum"
            >
              <div className="flex items-start justify-between gap-3 pb-4 mb-4 bg-[#f3f3f1] p-4">
                <div>
                  <span className="inline-block text-[11px] font-semibold text-[#181817] bg-[#a1ffcb] px-2.5 py-0.5">
                    Featured Flagship Wholesale Lot
                  </span>
                  <h3 className="font-display-platform text-base font-bold text-[#181817] mt-2 leading-snug">
                    {products[0].name}
                  </h3>
                </div>
                <span className="tnum text-xs font-semibold text-[#575652] shrink-0">
                  {products[0].sku}
                </span>
              </div>

              <ProductVisual
                sku={products[0].sku}
                name={products[0].name}
                brand={products[0].brand}
                unit={products[0].unit}
                packSize={products[0].pack_size}
                hsnCode={products[0].hsn_code}
                imageUrl={products[0].primary_image_url || products[0].images?.[0]?.url}
                galleryCount={products[0].images?.length || 1}
                primaryColor={primaryColor}
                accentColor={accentColor}
                className="h-48 mb-4"
              />

              {products[0].price_tiers && products[0].price_tiers.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {products[0].price_tiers.map((t, idx) => (
                    <div
                      key={t.id || idx}
                      className={`p-3 text-left ${
                        idx === 1 ? 'bg-[#181817] text-white' : 'bg-[#f3f3f1] text-[#181817]'
                      }`}
                    >
                      <div
                        className={`text-[11px] font-medium ${
                          idx === 1 ? 'text-[#a1ffcb]' : 'text-[#575652]'
                        }`}
                      >
                        {t.min_qty}
                        {t.max_qty ? `–${t.max_qty}` : '+'} {products[0].unit}
                      </div>
                      <div className="text-sm font-bold mt-1">{formatINR(t.unit_price)}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleAddToCart(products[0], products[0].min_order_qty || 10)}
                  className="flex-1 py-3.5 px-4 bg-[#181817] text-[#a1ffcb] hover:bg-[#2a2a28] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Quick Add MOQ ({products[0].min_order_qty} {products[0].unit}) to Cart
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(products[0]);
                    setQuoteQty(products[0].min_order_qty || 10);
                    goToPage('product', products[0].slug);
                  }}
                  className="py-3.5 px-4 bg-[#f3f3f1] hover:bg-[#e5e4e0] text-[#181817] font-semibold text-xs transition-colors cursor-pointer"
                >
                  GST Quote →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. B2B Assurance & Trade Credentials Strip */}
      <section className="bg-white">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-3.5 p-4 bg-[#f3f3f1]">
            <div className="w-9 h-9 bg-[#181817] text-[#a1ffcb] flex items-center justify-center font-bold text-sm shrink-0">
              %
            </div>
            <div>
              <div className="text-sm font-bold text-[#181817]">Automated Slab Pricing</div>
              <div className="text-xs text-[#575652] mt-1 leading-relaxed">
                Higher carton quantities automatically activate lower unit rates in your cart.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3.5 p-4 bg-[#f3f3f1]">
            <div className="w-9 h-9 bg-[#0d5c3a] text-white flex items-center justify-center font-bold text-xs shrink-0">
              GST
            </div>
            <div>
              <div className="text-sm font-bold text-[#181817]">100% GST Input Tax Credit</div>
              <div className="text-xs text-[#575652] mt-1 leading-relaxed">
                Every order includes an HSN-wise CGST/SGST or IGST tax invoice with your GSTIN.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3.5 p-4 bg-[#f3f3f1]">
            <div className="w-9 h-9 bg-[#181817] text-[#a1ffcb] flex items-center justify-center font-bold text-sm shrink-0">
              ₹
            </div>
            <div>
              <div className="text-sm font-bold text-[#181817]">Approved Retailer Credit Line</div>
              <div className="text-xs text-[#575652] mt-1 leading-relaxed">
                Verified dealers enjoy Net-15/Net-30 credit limits, NEFT/RTGS & online gateway.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3.5 p-4 bg-[#f3f3f1]">
            <div className="w-9 h-9 bg-[#0d5c3a] text-white flex items-center justify-center font-bold text-xs shrink-0">
              HUB
            </div>
            <div>
              <div className="text-sm font-bold text-[#181817]">Direct Warehouse Fulfillment</div>
              <div className="text-xs text-[#575652] mt-1 leading-relaxed">
                Dispatched directly from {shop.city}, {shop.state_code} with live batch tracking.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop by Wholesale Category */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-12 pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-semibold text-[#0d5c3a]">
              01 / Authorized Product Lines
            </span>
            <h3 className="font-display-platform text-2xl sm:text-3xl font-bold text-[#181817] tracking-[-0.025em] mt-1">
              Browse Wholesale Categories
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('');
              goToPage('catalog');
            }}
            className="px-4 py-2 bg-white text-[#181817] hover:bg-[#181817] hover:text-white text-xs font-semibold transition-colors cursor-pointer tnum"
          >
            View Complete Catalogue ({products.length} SKUs) →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.slug);
                goToPage('catalog');
              }}
              className="group bg-white hover:bg-[#181817] hover:text-white overflow-hidden transition-colors cursor-pointer flex flex-col justify-between"
            >
              {cat.image_url && (
                <div className="h-40 w-full overflow-hidden bg-[#181817] relative">
                  <img
                    src={resolveMediaUrl(cat.image_url)}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-5 flex items-center justify-between gap-3">
                <div>
                  <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 bg-[#f3f3f1] text-[#0d5c3a] group-hover:bg-[#232321] group-hover:text-[#a1ffcb] tnum">
                    {cat.products_count ?? 'Active'} Wholesale SKUs
                  </span>
                  <h4 className="font-display-platform text-base font-bold mt-2">{cat.name}</h4>
                  <p className="text-xs text-[#575652] group-hover:text-[#b8b7b2] mt-1">
                    {cat.description || 'Tiered carton rates & immediate dispatch'}
                  </p>
                </div>
                <span className="w-9 h-9 shrink-0 bg-[#f3f3f1] text-[#181817] group-hover:bg-[#a1ffcb] group-hover:text-[#181817] flex items-center justify-center font-bold text-sm">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Wholesale Catalogue */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-semibold text-[#0d5c3a]">
              02 / Direct Volume Pricing
            </span>
            <h3 className="font-display-platform text-2xl sm:text-3xl font-bold text-[#181817] tracking-[-0.025em] mt-1">
              Best-Selling Wholesale Catalogue
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage('bulk-order')}
              className="px-4 py-2.5 bg-[#181817] text-[#a1ffcb] text-xs font-semibold hover:bg-[#2a2a28] transition-colors cursor-pointer"
            >
              Open Multi-SKU Bulk Order Sheet →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => renderProductCard(product))}
        </div>
      </section>

      {/* 5. How B2B Wholesale Procurement Works */}
      <section className="bg-white py-14 mt-6">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-semibold text-[#0d5c3a]">03 / Direct Trade Workflow</span>
            <h3 className="font-display-platform text-2xl sm:text-3xl font-bold text-[#181817] tracking-[-0.025em] mt-1">
              How Wholesale Ordering Works with {shop.name}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: 'Stage 01',
                title: 'Verify Retailer GSTIN',
                desc: 'Sign in or register your business GSTIN to activate trade slabs and customized contract price lists.',
              },
              {
                step: 'Stage 02',
                title: 'Select Volume Slabs',
                desc: 'Add master cartons via the Catalogue or Rapid Bulk Order Sheet to trigger automatic tier discounts.',
              },
              {
                step: 'Stage 03',
                title: 'Live CGST/SGST or IGST',
                desc: 'Our checkout calculates exact HSN-wise intra-state or inter-state GST based on your delivery state.',
              },
              {
                step: 'Stage 04',
                title: 'Same-Day Hub Dispatch',
                desc: 'Pay via Online Gateway, NEFT/RTGS, or Approved Credit Limit and download your GST Tax Invoice.',
              },
            ].map((item) => (
              <div key={item.step} className="bg-[#f3f3f1] p-6 relative">
                <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-[#181817] text-[#a1ffcb] tnum">
                  {item.step}
                </span>
                <h4 className="font-display-platform text-base font-bold text-[#181817] mt-4">
                  {item.title}
                </h4>
                <p className="text-xs text-[#575652] mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
