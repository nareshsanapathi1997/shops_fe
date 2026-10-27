import { formatINR } from '../../../lib/api';
import { useStorefront } from '../StorefrontContext';

export function BulkOrderSection() {
  const {
    products,
    bulkQuantities,
    setBulkQuantities,
    bulkSearchFilter,
    setBulkSearchFilter,
    handleBulkOrderSubmit,
    getResolvedTierUnitPrice,
    bulkRunningTotals,
    accentColor,
  } = useStorefront();

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl   p-6  space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4   pb-5">
            <div>
              <span className="text-xs font-extrabold tracking-tight text-blue-600">
                B2B Rapid Procurement Matrix
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                Rapid Multi-SKU Bulk Order Entry Sheet
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Enter carton quantities across multiple SKUs. Volume slab discounts automatically apply based on your entered quantities.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={bulkSearchFilter}
                onChange={(e) => setBulkSearchFilter(e.target.value)}
                placeholder="Filter sheet by SKU or Product Name..."
                className="px-3.5 py-2   rounded-xl text-xs w-64"
              />
              <button
                type="button"
                onClick={() => {
                  const filled: Record<number, number> = {};
                  products.forEach((p) => {
                    filled[p.id] = p.min_order_qty || 1;
                  });
                  setBulkQuantities(filled);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Pre-fill All MOQs
              </button>
            </div>
          </div>

          <form onSubmit={handleBulkOrderSubmit}>
            <div className="overflow-x-auto rounded-xl  ">
              <table className="w-full text-left ">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] tracking-tight">
                    <th className="py-3.5 px-4">SKU / HSN</th>
                    <th className="py-3.5 px-4">Product Name & Pack</th>
                    <th className="py-3.5 px-3">MOQ & Step</th>
                    <th className="py-3.5 px-3">Volume Slab Rates</th>
                    <th className="py-3.5 px-3">Order Qty</th>
                    <th className="py-3.5 px-4 text-right">Est. Line Subtotal</th>
                  </tr>
                </thead>
                <tbody className=" divide-slate-200 text-xs">
                  {products
                    .filter((p) => {
                      if (!bulkSearchFilter.trim()) return true;
                      const q = bulkSearchFilter.toLowerCase();
                      return (
                        p.name.toLowerCase().includes(q) ||
                        p.sku.toLowerCase().includes(q) ||
                        (p.hsn_code || '').toLowerCase().includes(q)
                      );
                    })
                    .map((prod) => {
                      const enteredQty = bulkQuantities[prod.id] ?? 0;
                      const unitRate = getResolvedTierUnitPrice(prod, enteredQty);
                      const estLine = enteredQty > 0 ? enteredQty * unitRate : 0;
                      return (
                        <tr
                          key={prod.id}
                          className={enteredQty > 0 ? 'bg-blue-50/40' : 'hover:bg-slate-50'}
                        >
                          <td className="py-3.5 px-4 tnum">
                            <div className="font-bold text-slate-800">{prod.sku}</div>
                            <div className="text-[11px] text-slate-500">HSN {prod.hsn_code}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{prod.name}</div>
                            <div className="text-[11px] text-slate-500">
                              Master Pack: {prod.pack_size} {prod.unit} • +{prod.tax_category?.gst_rate ?? 18}% GST
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded   font-semibold">
                              MOQ: {prod.min_order_qty} {prod.unit}
                            </span>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Step: {prod.order_qty_step} {prod.unit}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex flex-wrap gap-1.5">
                              {prod.price_tiers?.map((t) => (
                                <button
                                  type="button"
                                  key={t.id}
                                  onClick={() =>
                                    setBulkQuantities((prev) => ({
                                      ...prev,
                                      [prod.id]: t.min_qty,
                                    }))
                                  }
                                  className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-700 font-semibold text-[11px]   cursor-pointer"
                                >
                                  {t.min_qty}+: {formatINR(t.unit_price)}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <input
                              type="number"
                              min={0}
                              step={prod.order_qty_step}
                              value={enteredQty}
                              onChange={(e) =>
                                setBulkQuantities((prev) => ({
                                  ...prev,
                                  [prod.id]: Number(e.target.value),
                                }))
                              }
                              className="w-24 px-3 py-2   rounded-xl font-bold text-center bg-white"
                            />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {enteredQty > 0 ? (
                              <div>
                                <div className="font-extrabold text-slate-900">
                                  {formatINR(estLine)}
                                </div>
                                <div className="text-[11px] text-emerald-700 font-semibold">
                                  @ {formatINR(unitRate)}/{prod.unit}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400">·</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Sticky Running Batch Estimator Bar */}
            <div className="mt-6 p-5 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-[11px] text-slate-400">Selected Lines</div>
                  <div className="text-lg font-black">{bulkRunningTotals.skuCount} SKUs</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Total Units</div>
                  <div className="text-lg font-black">{bulkRunningTotals.totalUnits} Units</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Est. Excl-GST Subtotal</div>
                  <div className="text-lg font-black text-emerald-400">
                    {formatINR(bulkRunningTotals.estimatedSubtotal)}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                style={{ backgroundColor: accentColor }}
                className="px-6 py-3.5 rounded-xl text-white font-extrabold text-xs sm:text-sm  hover:opacity-95 transition cursor-pointer"
              >
                Add Selected Bulk SKUs to Wholesale Cart →
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
