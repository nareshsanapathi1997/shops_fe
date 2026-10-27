import { formatINR, resolveMediaUrl } from '../../../lib/api';
import { ProductVisual } from '../../../components/ProductVisual';
import { useStorefront } from '../StorefrontContext';
import { INDIAN_STATES } from '../shared';

export function ProductDetailSection() {
  const {
    activeProductImageIdx,
    setActiveProductImageIdx,
    selectedProduct,
    selectedVariantId,
    setSelectedVariantId,
    quoteQty,
    setQuoteQty,
    quoteStateCode,
    setQuoteStateCode,
    priceQuote,
    quoteError,
    goToPage,
    handleAddToCart,
    getAvailableStock,
    primaryColor,
    accentColor,
  } = useStorefront();
  if (!selectedProduct) return null;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            <button type="button" onClick={() => goToPage('home')} className="hover:text-slate-900 cursor-pointer">
              Home
            </button>{' '}
            /{' '}
            <button type="button" onClick={() => goToPage('catalog')} className="hover:text-slate-900 cursor-pointer">
              Wholesale Catalogue
            </button>{' '}
            / <span className="text-slate-900 font-bold">{selectedProduct.name}</span>
          </div>
          <button
            type="button"
            onClick={() => goToPage('catalog')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            ← Back to All Wholesale Products
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 Columns: Dynamic Multi-Image Gallery, Technical Specifications & Slab Matrix */}
          <div className="lg:col-span-7 bg-white rounded-2xl   p-6  space-y-6">
            {(() => {
              const gallery =
                selectedProduct.images && selectedProduct.images.length > 0
                  ? selectedProduct.images
                  : selectedProduct.primary_image_url
                  ? [{ id: 0, url: selectedProduct.primary_image_url, alt_text: selectedProduct.name }]
                  : [];
              const safeIdx = gallery[activeProductImageIdx] ? activeProductImageIdx : 0;
              const activeImg = gallery[safeIdx];
              return (
                <div className="space-y-3">
                  <ProductVisual
                    sku={selectedProduct.sku}
                    name={selectedProduct.name}
                    categoryName={selectedProduct.category?.name}
                    brand={selectedProduct.brand}
                    unit={selectedProduct.unit}
                    packSize={selectedProduct.pack_size}
                    hsnCode={selectedProduct.hsn_code}
                    imageUrl={activeImg?.url || selectedProduct.primary_image_url}
                    galleryCount={gallery.length}
                    primaryColor={primaryColor}
                    accentColor={accentColor}
                    className="h-80 rounded-2xl  "
                  />
                  {gallery.length > 1 && (
                    <div className="grid grid-cols-3 gap-3">
                      {gallery.map((img, idx) => (
                        <button
                          key={img.id || idx}
                          type="button"
                          onClick={() => setActiveProductImageIdx(idx)}
                          className={`group text-left rounded-xl p-2 border-2 transition cursor-pointer flex items-center gap-2.5 ${
                            safeIdx === idx
                              ? ' border-blue-500 bg-blue-50/50 '
                              : ' border-transparent bg-slate-50 '
                          }`}
                        >
                          <img
                            src={resolveMediaUrl(img.url)}
                            alt={img.alt_text || `View ${idx + 1}`}
                            className="w-14 h-12 rounded-lg object-cover   shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-[10px] font-extrabold tracking-tight text-blue-700">
                              View 0{idx + 1}
                            </div>
                            <div className="text-[11px] font-bold text-slate-800 truncate">
                              {img.alt_text || `Gallery Photo ${idx + 1}`}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="tnum font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                  SKU: {selectedProduct.sku}
                </span>
                <span>•</span>
                <span>HSN Code: {selectedProduct.hsn_code}</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">
                  {(() => {
                    const available = getAvailableStock(selectedProduct);
                    if (available === null) return 'Stock availability on request';
                    return available > 0
                      ? `${available} ${selectedProduct.unit} Ready in Warehouse`
                      : 'Currently out of stock';
                  })()}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-2">{selectedProduct.name}</h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {selectedProduct.description || selectedProduct.short_description}
              </p>
              {selectedProduct.attributes_json && Object.keys(selectedProduct.attributes_json).length > 0 && (
                <div className="mt-4 bg-slate-50 rounded-xl   p-4">
                  <h3 className="text-xs font-extrabold tracking-tight text-slate-500 mb-2.5">
                    Technical Specifications &amp; B2B Compliance Matrix
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {Object.entries(selectedProduct.attributes_json).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between bg-white px-3 py-2 rounded-lg  "
                      >
                        <span className="text-slate-500 font-semibold">{k}</span>
                        <span className="tnum font-bold text-slate-900">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Variants Selector if applicable */}
            {selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <div>
                <h3 className="text-xs font-extrabold tracking-tight text-slate-500 mb-2.5">
                  Select Industrial Specification / Pack Variant
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedVariantId(null)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold  transition cursor-pointer ${
                      selectedVariantId === null
                        ? 'bg-slate-900 text-white '
                        : 'bg-white text-slate-700  hover:bg-slate-50'
                    }`}
                  >
                    Standard ({selectedProduct.sku}) · {formatINR(selectedProduct.base_price)}
                  </button>
                  {selectedProduct.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold  transition cursor-pointer ${
                        selectedVariantId === v.id
                          ? 'bg-slate-900 text-white '
                          : 'bg-white text-slate-700  hover:bg-slate-50'
                      }`}
                    >
                      {v.name} ({v.sku}) · {formatINR(v.base_price)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Quantity-Break Tier Matrix */}
            <div>
              <h3 className="text-xs font-extrabold tracking-tight text-slate-500 mb-2.5">
                Click Any Volume Slab to Load Quote Quantity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedProduct.price_tiers?.map((tier) => {
                  const active =
                    quoteQty >= tier.min_qty && (!tier.max_qty || quoteQty <= tier.max_qty);
                  const savingsPct = Math.max(
                    0,
                    Math.round(
                      ((Number(selectedProduct.base_price) - Number(tier.unit_price)) /
                        Number(selectedProduct.base_price)) *
                        100
                    )
                  );
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setQuoteQty(tier.min_qty)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                        active
                          ? ' border-blue-500 bg-blue-50/70 '
                          : ' border-transparent bg-slate-50 '
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">
                          {tier.min_qty}
                          {tier.max_qty ? ` – ${tier.max_qty}` : '+'} {selectedProduct.unit}
                        </span>
                        {savingsPct > 0 && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Save {savingsPct}%
                          </span>
                        )}
                      </div>
                      <div className="text-xl font-black text-slate-900 mt-1">
                        {formatINR(tier.unit_price)}
                        <span className="text-xs font-normal text-slate-500">
                          /{selectedProduct.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Live Server-Side Wholesale & GST Quote Engine */}
          <div className="lg:col-span-5 bg-white rounded-2xl   p-6  space-y-5 h-fit">
            <div>
              <span className="text-[10px] font-extrabold tracking-tight px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700  ">
                Real-Time B2B Pricing & GST Split Engine
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">
                Calculate Landed Wholesale Quote
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Order Quantity ({selectedProduct.unit})
                </label>
                <input
                  type="number"
                  min={selectedProduct.min_order_qty}
                  step={selectedProduct.order_qty_step}
                  value={quoteQty}
                  onChange={(e) => setQuoteQty(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5   rounded-xl text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery State (GST Place of Supply)
                </label>
                <select
                  value={quoteStateCode}
                  onChange={(e) => setQuoteStateCode(e.target.value)}
                  className="w-full px-3 py-2.5   rounded-xl text-xs font-bold bg-white"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {quoteError && (
              <div className="p-3.5 rounded-xl bg-rose-50   text-rose-700 text-xs font-semibold">
                {quoteError}
              </div>
            )}

            {priceQuote && (
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2  ">
                  <span className="text-slate-400">Applied Pricing Rule:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 tnum text-[11px] font-bold">
                    {priceQuote.pricing_rule}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Resolved Net Unit Rate:</span>
                  <span className="font-bold text-white text-sm">
                    {formatINR(priceQuote.unit_price)} / {selectedProduct.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Volume Slab Discount Saved:</span>
                  <span className="text-emerald-400 font-bold">
                    − {formatINR(priceQuote.discount_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Taxable Value ({priceQuote.quantity} {selectedProduct.unit}):</span>
                  <span className="font-semibold">{formatINR(priceQuote.taxable_amount)}</span>
                </div>

                {priceQuote.is_inter_state ? (
                  <div className="flex justify-between text-amber-300">
                    <span>Inter-State IGST ({priceQuote.gst_rate}%):</span>
                    <span className="font-bold">{formatINR(priceQuote.igst_amount)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sky-300">
                      <span>Intra-State CGST ({priceQuote.gst_rate / 2}%):</span>
                      <span className="font-bold">{formatINR(priceQuote.cgst_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sky-300">
                      <span>Intra-State SGST ({priceQuote.gst_rate / 2}%):</span>
                      <span className="font-bold">{formatINR(priceQuote.sgst_amount)}</span>
                    </div>
                  </>
                )}

                <div className="pt-3   flex justify-between items-baseline text-sm font-black">
                  <span>Total Landed Quote (Incl. GST):</span>
                  <span className="text-xl text-emerald-400">{formatINR(priceQuote.line_total)}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={!!quoteError}
              onClick={() => handleAddToCart(selectedProduct, quoteQty, selectedVariantId)}
              style={{ backgroundColor: accentColor }}
              className="w-full py-3.5 rounded-xl text-white font-extrabold text-sm  hover:opacity-95 disabled:opacity-40 transition cursor-pointer"
            >
              Add {quoteQty} {selectedProduct.unit} to Wholesale Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
