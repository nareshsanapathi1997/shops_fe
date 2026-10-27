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
    <>
      <div>
        {/* Executive Split Hero Banner */}
        <section
          style={{
            backgroundColor: primaryColor,
          }}
          className="text-white relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex flex-wrap items-center gap-2 bg-white/10    px-3.5 py-1.5 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{shop.legal_name || shop.name}</span>
                <span className="text-white/40">•</span>
                <span className="text-amber-300 tnum">GSTIN: {shop.gstin}</span>
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
                            className={`px-3 py-1 rounded-full text-[11px] font-bold  transition cursor-pointer ${
                              activeHeroSlideIdx === idx
                                ? 'bg-amber-400 text-slate-950  '
                                : 'bg-white/10 text-white/80  hover:bg-white/20'
                            }`}
                          >
                            {idx + 1}. {sl.eyebrow || sl.badge || `Campaign ${idx + 1}`}
                          </button>
                        ))}
                      </div>
                    )}
                    <h2
                      className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] ${
                        designPreset === 'classic' ? 'font-serif' : ''
                      }`}
                    >
                      {activeSlide?.title ||
                        shop.hero_title ||
                        `Direct Factory-to-Retailer Wholesale Supply from ${shop.name}`}
                    </h2>

                    <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl">
                      {activeSlide?.subtitle ||
                        shop.hero_subtitle ||
                        'Authorized bulk distributor offering tiered slab discounts, contract rate lists, 100% GST Input Tax Credit invoices, and same-day dispatch.'}
                    </p>

                    {(activeSlide?.image_url || shop.banner_url) && (
                      <div className="rounded-2xl overflow-hidden    bg-slate-950/50 max-w-2xl">
                        <img
                          src={resolveMediaUrl(activeSlide?.image_url || shop.banner_url)}
                          alt={activeSlide?.title || shop.name}
                          className="w-full h-40 sm:h-48 object-cover object-center"
                        />
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => goToPage('catalog')}
                  className="px-6 py-3.5 rounded-xl bg-white text-slate-950 font-extrabold text-xs sm:text-sm  hover:bg-slate-100 transition cursor-pointer"
                >
                  Explore Full Wholesale Catalogue →
                </button>
                <button
                  type="button"
                  onClick={() => goToPage('bulk-order')}
                  className="px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm    transition cursor-pointer"
                >
                  Open Rapid Bulk Order Sheet
                </button>
                <button
                  type="button"
                  onClick={() => goToPage('account')}
                  className="px-5 py-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-bold text-xs sm:text-sm   transition cursor-pointer"
                >
                  {customer ? `Credit Limit: ${formatINR(customer.credit_limit)}` : 'Apply for Trade Credit Account'}
                </button>
              </div>

              {/* Key B2B Metrics Strip */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3  ">
                <div className="bg-white/5 rounded-xl p-3  ">
                  <div className="text-xl font-black text-white">{products.length}+ SKUs</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Ready Warehouse Stock</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3  ">
                  <div className="text-xl font-black text-emerald-300">Up to 22%</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Volume Slab Discounts</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3  ">
                  <div className="text-xl font-black text-amber-300">100% ITC</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">GSTN-Compliant Invoices</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3  ">
                  <div className="text-xl font-black text-sky-300">{shop.merchant_settings?.dispatch_sla_hours || 24} Hr SLA</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">From {shop.city} Hub</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Quick Wholesale Slab & GST Preview Card */}
            {products[0] && (
              <div data-ui="featured-lot-card" className="lg:col-span-5 bg-[#f5f4f0] text-[#141413] p-6 tnum">
                <div className="flex items-center justify-between   pb-3 mb-4">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-tight text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      Featured Flagship Wholesale Lot
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1.5">
                      {products[0].name}
                    </h3>
                  </div>
                  <span className="tnum text-xs font-bold text-slate-500">
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
                  className="h-44 rounded-xl mb-4"
                />

                {products[0].price_tiers && products[0].price_tiers.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {products[0].price_tiers.map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-50   rounded-xl p-2.5 text-center"
                      >
                        <div className="text-[10px] font-bold text-slate-500">
                          {t.min_qty}
                          {t.max_qty ? `–${t.max_qty}` : '+'} {products[0].unit}
                        </div>
                        <div className="text-sm font-black text-slate-900 mt-0.5">
                          {formatINR(t.unit_price)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(products[0], products[0].min_order_qty || 10)}
                    style={{ backgroundColor: accentColor }}
                    className="flex-1 py-3 px-4 rounded-xl text-white font-bold text-xs  hover:opacity-95 transition cursor-pointer"
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
                    className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                  >
                    GST Quote →
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* B2B Assurance & Trade Credentials Strip */}
        <section className="bg-white  ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50  ">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                %
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">Automated Slab Pricing</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Higher carton quantities automatically activate lower unit rates in your cart.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50  ">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                GST
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">100% GST Input Tax Credit</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Every order includes an HSN-wise CGST/SGST or IGST tax invoice with your GSTIN.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50  ">
              <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                ₹
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">Approved Retailer Credit Line</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Verified dealers enjoy Net-15/Net-30 credit limits, NEFT/RTGS & online gateway.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50  ">
              <div className="w-9 h-9 rounded-lg bg-[#181817] text-white flex items-center justify-center font-bold text-sm shrink-0">
                Hub
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">Direct Warehouse Fulfillment</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Dispatched directly from {shop.city}, {shop.state_code} with live batch tracking.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shop by Wholesale Category */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
            <div>
              <span className="text-xs font-extrabold tracking-tight text-blue-600">
                Authorized Product Lines
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                Browse Wholesale Categories
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('');
                goToPage('catalog');
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              View Complete Catalogue ({products.length} SKUs) →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  goToPage('catalog');
                }}
                className="group bg-white hover:bg-slate-900 hover:text-white rounded-2xl overflow-hidden     transition-colors cursor-pointer flex flex-col justify-between"
              >
                {cat.image_url && (
                  <div className="h-36 w-full overflow-hidden bg-slate-900 relative">
                    <img
                      src={resolveMediaUrl(cat.image_url)}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5 flex items-center justify-between gap-3">
                  <div>
                    <span className="inline-block text-[10px] font-extrabold tracking-tight px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 group-hover:bg-white/15 group-hover:text-white">
                      {cat.products_count ?? 'Active'} Wholesale SKUs
                    </span>
                    <h4 className="text-base font-extrabold mt-2">{cat.name}</h4>
                    <p className="text-xs text-slate-500 group-hover:text-slate-300 mt-1">
                      {cat.description || 'Tiered carton rates & immediate dispatch'}
                    </p>
                  </div>
                  <span className="w-9 h-9 shrink-0 rounded-xl bg-slate-100 group-hover:bg-white/15 flex items-center justify-center font-bold text-sm">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Wholesale Catalogue */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-extrabold tracking-tight text-emerald-700">
                Direct Volume Pricing
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                Best-Selling Wholesale Catalogue
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage('bulk-order')}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Open Multi-SKU Bulk Order Sheet
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => renderProductCard(product))}
          </div>
        </section>

        {/* How B2B Wholesale Procurement Works */}
        <section className="bg-white   py-12 mt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-extrabold tracking-tight text-blue-600">
                direct Trade Workflow
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                How Wholesale Ordering Works with {shop.name}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  step: 'Stage 1',
                  title: 'Verify Retailer GSTIN',
                  desc: 'Sign in or register your business GSTIN to activate trade slabs and customized contract price lists.',
                },
                {
                  step: 'Stage 2',
                  title: 'Select Volume Slabs',
                  desc: 'Add master cartons via the Catalogue or Rapid Bulk Order Sheet to trigger automatic tier discounts.',
                },
                {
                  step: 'Stage 3',
                  title: 'Live CGST/SGST or IGST',
                  desc: 'Our checkout calculates exact HSN-wise intra-state or inter-state GST based on your delivery state.',
                },
                {
                  step: 'Stage 4',
                  title: 'Same-Day Hub Dispatch',
                  desc: 'Pay via Online Gateway, NEFT/RTGS, or Approved Credit Limit and download your GST Tax Invoice.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-slate-50 rounded-2xl p-5   relative"
                >
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                    {item.step}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-3">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
