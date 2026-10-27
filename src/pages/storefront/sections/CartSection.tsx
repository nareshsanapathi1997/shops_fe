import { formatINR } from '../../../lib/api';
import { useStorefront } from '../StorefrontContext';

export function CartSection() {
  const {
    cartSummary,
    goToPage,
    accentColor,
  } = useStorefront();

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl   p-6 ">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-extrabold tracking-tight text-blue-600">
                Wholesale Procurement Basket
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                Your Wholesale Cart & Slab Summary
              </h2>
            </div>
            <button
              type="button"
              onClick={() => goToPage('catalog')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              + Add More SKUs from Catalogue
            </button>
          </div>

          {!cartSummary || cartSummary.lines.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-slate-500 text-sm">Your wholesale cart is currently empty.</p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => goToPage('catalog')}
                  style={{ backgroundColor: accentColor }}
                  className="px-5 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer"
                >
                  Browse Wholesale Catalogue
                </button>
                <button
                  type="button"
                  onClick={() => goToPage('bulk-order')}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold cursor-pointer"
                >
                  Open Bulk Order Sheet
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 overflow-x-auto">
                <table className="w-full text-left ">
                  <thead>
                    <tr className="  text-[11px] uppercase text-slate-500">
                      <th className="py-3 px-3">Product & HSN</th>
                      <th className="py-3 px-3">Applied Rule</th>
                      <th className="py-3 px-3">Qty</th>
                      <th className="py-3 px-3">Net Rate</th>
                      <th className="py-3 px-3">GST</th>
                      <th className="py-3 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className=" divide-slate-200 text-xs">
                    {cartSummary.lines.map((line) => (
                      <tr key={`${line.product_id}-${line.variant_id || 0}`}>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900">{line.product_name}</div>
                          <div className="tnum text-[11px] text-slate-500">
                            {line.sku} • HSN: {line.hsn_code}
                          </div>
                          {line.error && (
                            <p role="alert" className="mt-1 text-[11px] font-semibold text-rose-700">
                              {line.error}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 tnum text-[11px] font-bold">
                            {line.pricing_rule}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-bold">
                          {line.quantity} {line.unit}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold">{formatINR(line.unit_price)}</div>
                          {line.discount_amount > 0 && (
                            <div className="text-[11px] text-emerald-600 font-semibold">
                              Saved {formatINR(line.discount_amount)}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <div>{formatINR(line.tax_amount)}</div>
                          <div className="text-[10px] text-slate-500">({line.gst_rate}% GST)</div>
                        </td>
                        <td className="py-3.5 px-3 text-right font-extrabold text-slate-900">
                          {formatINR(line.line_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:col-span-4 bg-slate-900 text-white rounded-2xl p-6 space-y-3 text-xs h-fit">
                <h3 className="text-base font-black   pb-2.5">
                  Wholesale Tax & Order Summary
                </h3>
                <div className="flex justify-between">
                  <span className="text-slate-400">Taxable Subtotal:</span>
                  <span className="font-bold">{formatINR(cartSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Total Tier / Contract Savings:</span>
                  <span className="font-bold">− {formatINR(cartSummary.discount_total)}</span>
                </div>
                {cartSummary.is_inter_state ? (
                  <div className="flex justify-between text-amber-300">
                    <span>Inter-State IGST:</span>
                    <span>{formatINR(cartSummary.igst_total)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sky-300">
                      <span>Intra-State CGST:</span>
                      <span>{formatINR(cartSummary.cgst_total)}</span>
                    </div>
                    <div className="flex justify-between text-sky-300">
                      <span>Intra-State SGST:</span>
                      <span>{formatINR(cartSummary.sgst_total)}</span>
                    </div>
                  </>
                )}
                <div className="pt-3   flex justify-between items-baseline text-sm font-black">
                  <span>Grand Total (Incl. GST):</span>
                  <span className="text-xl text-emerald-400">
                    {formatINR(cartSummary.grand_total)}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-xl text-[11px] font-semibold ${
                    cartSummary.meets_min_order_value
                      ? 'bg-emerald-950 text-emerald-300  '
                      : 'bg-amber-950 text-amber-300  '
                  }`}
                >
                  {cartSummary.meets_min_order_value
                    ? `Meets Minimum Wholesale Order Value (${formatINR(cartSummary.min_order_value)})`
                    : ` Add ${formatINR(
                        cartSummary.min_order_value - cartSummary.subtotal
                      )} more in taxable subtotal to meet MOV (${formatINR(
                        cartSummary.min_order_value
                      )})`}
                </div>

                {cartSummary.has_errors && (
                  <div role="alert" className="p-3 rounded-xl text-[11px] font-semibold bg-rose-950 text-rose-200">
                    Some items can no longer be ordered as listed. Update or remove the highlighted lines to continue.
                  </div>
                )}

                <button
                  type="button"
                  disabled={!cartSummary.meets_min_order_value || Boolean(cartSummary.has_errors)}
                  onClick={() => goToPage('checkout')}
                  style={{ backgroundColor: accentColor }}
                  className="w-full py-3.5 rounded-xl text-white font-extrabold text-xs  disabled:opacity-40 cursor-pointer"
                >
                  Proceed to B2B GST Checkout →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
