import { formatINR } from '../../../lib/api';
import { useStorefront } from '../StorefrontContext';

export function CatalogSection() {
  const {
    categories,
    products,
    selectedCategory,
    setSelectedCategory,
    sortOption,
    setSortOption,
    catalogViewMode,
    setCatalogViewMode,
    setSelectedProduct,
    setQuoteQty,
    productQuantities,
    setProductQuantities,
    loading,
    goToPage,
    handleAddToCart,
    accentColor,
    renderProductCard,
  } = useStorefront();

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs text-slate-500 font-medium">
              <button
                type="button"
                onClick={() => goToPage('home')}
                className="hover:text-slate-900 cursor-pointer"
              >
                Home
              </button>{' '}
              / <span className="text-slate-900 font-bold">Wholesale Product Catalogue</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {selectedCategory
                ? categories.find((c) => c.slug === selectedCategory)?.name || 'Category Catalogue'
                : 'Complete Wholesale Catalogue'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3.5 py-2 rounded-xl   bg-white text-xs font-semibold text-slate-800 cursor-pointer"
              aria-label="Sort products"
            >
              <option value="featured">Sort: Featured SKUs</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>

            <div className="inline-flex rounded-xl   bg-white p-0.5">
              <button
                type="button"
                onClick={() => setCatalogViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  catalogViewMode === 'grid'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Card Grid
              </button>
              <button
                type="button"
                onClick={() => setCatalogViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  catalogViewMode === 'table'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Compact Table
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Filter Panel */}
          <aside className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl   p-5 ">
              <h3 className="text-xs font-extrabold tracking-tight text-slate-400 mb-3">
                Product Categories
              </h3>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                    selectedCategory === ''
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>All Wholesale SKUs</span>
                  <span className="text-[11px] opacity-80">{products.length}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      selectedCategory === cat.slug
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] opacity-75">{cat.products_count ?? ''}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-extrabold tracking-tight px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
                Fast Procurement
              </span>
              <h4 className="text-sm font-extrabold">Ordering 5+ SKUs at Once?</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Use our Rapid Bulk Order Sheet to enter carton quantities across all SKUs and add to cart in one click.
              </p>
              <button
                type="button"
                onClick={() => goToPage('bulk-order')}
                className="w-full py-2.5 rounded-xl bg-white text-slate-900 text-xs font-extrabold hover:bg-slate-100 transition cursor-pointer"
              >
                Open Rapid Bulk Order Sheet →
              </button>
            </div>
          </aside>

          {/* Main Catalogue Grid or Table */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-500  ">
                Loading wholesale product catalogue...
              </div>
            ) : catalogViewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => renderProductCard(product))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl    overflow-hidden">
                <div className="overflow-x-auto"><table className="w-full text-left ">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[11px] tracking-tight">
                      <th className="py-3.5 px-4">SKU & Product</th>
                      <th className="py-3.5 px-3">MOQ / Pack</th>
                      <th className="py-3.5 px-3">Volume Slabs</th>
                      <th className="py-3.5 px-3">Qty</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className=" divide-slate-200 text-xs">
                    {products.map((prod) => {
                      const q = productQuantities[prod.id] ?? prod.min_order_qty;
                      return (
                        <tr key={prod.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4">
                            <div className="tnum text-[11px] text-slate-500">{prod.sku} • HSN {prod.hsn_code}</div>
                            <div
                              onClick={() => {
                                setSelectedProduct(prod);
                                setQuoteQty(prod.min_order_qty);
                                goToPage('product', prod.slug);
                              }}
                              className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                            >
                              {prod.name}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-amber-800">MOQ: {prod.min_order_qty} {prod.unit}</div>
                            <div className="text-[11px] text-slate-500">Step: {prod.order_qty_step}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex flex-wrap gap-1">
                              {prod.price_tiers?.map((t) => (
                                <span
                                  key={t.id}
                                  className="px-2 py-0.5 rounded bg-slate-100   text-[11px] font-semibold"
                                >
                                  {t.min_qty}+: {formatINR(t.unit_price)}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <input
                              type="number"
                              min={prod.min_order_qty}
                              step={prod.order_qty_step}
                              value={q}
                              onChange={(e) =>
                                setProductQuantities((prev) => ({
                                  ...prev,
                                  [prod.id]: Number(e.target.value),
                                }))
                              }
                              className="w-20 px-2.5 py-1.5   rounded-lg font-bold text-center"
                            />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleAddToCart(prod, q)}
                              style={{ backgroundColor: accentColor }}
                              className="px-3.5 py-2 rounded-lg text-white font-bold text-xs cursor-pointer"
                            >
                              Add to Cart
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
