import { formatINR } from '../../../lib/api';
import { useStorefront } from '../StorefrontContext';
import { INDIAN_STATES } from '../shared';

export function CheckoutSection() {
  const {
    placingOrder,
    shippingMethods,
    cartSummary,
    savedAddresses,
    checkoutForm,
    setCheckoutForm,
    handleCheckout,
    accentColor,
  } = useStorefront();

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl   p-6 sm:p-8 ">
          <h2 className="text-2xl font-black text-slate-900 mb-1">
            B2B Wholesale Checkout & GST Dispatch
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Confirm your delivery warehouse state, freight carrier, and B2B settlement method.
          </p>

          <form onSubmit={handleCheckout} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Destination State (Determines CGST/SGST vs IGST)
                </label>
                <select
                  value={checkoutForm.destination_state_code}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, destination_state_code: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5   rounded-xl bg-white font-semibold"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Freight / Logistics Method
                </label>
                <select
                  value={checkoutForm.shipping_method_id}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      shipping_method_id: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2.5   rounded-xl bg-white font-semibold"
                >
                  {shippingMethods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} · {formatINR(m.flat_rate)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  B2B Payment & Settlement Mode
                </label>
                <select
                  value={checkoutForm.payment_method}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, payment_method: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5   rounded-xl bg-white font-semibold"
                >
                  <option value="online_gateway">
                    Online Gateway (UPI / Corporate NetBanking / Cards)
                  </option>
                  <option value="bank_transfer">NEFT / RTGS Corporate Bank Transfer</option>
                  <option value="credit_account">
                    Approved Retailer Credit Line (Net Terms)
                  </option>
                  <option value="cod">Cash / Pay on Delivery</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Buyer Purchase Order (PO) Reference
                </label>
                <input
                  type="text"
                  value={checkoutForm.purchase_order_number}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      purchase_order_number: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5   rounded-xl"
                />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <label className="block font-bold text-slate-700">
                  Warehouse Receiving / Shipping Address
                </label>
                {savedAddresses.length > 0 && (
                  <select
                    onChange={(e) => {
                      const addr = savedAddresses.find((a) => String(a.id) === e.target.value);
                      if (addr) {
                        setCheckoutForm({
                          ...checkoutForm,
                          destination_state_code: addr.state_code || checkoutForm.destination_state_code,
                          shipping_address: `${addr.label ? addr.label + ': ' : ''}${addr.line1}, ${addr.city}, ${addr.state_code} - ${addr.postal_code}`,
                        });
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg   text-[11px] bg-slate-50 font-semibold"
                  >
                    <option value="">Select Saved Warehouse Address...</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label || 'Warehouse'} · {addr.city}, {addr.state_code}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <textarea
                rows={2}
                required
                aria-label="Shipping address"
                placeholder="Full delivery address with PIN code"
                value={checkoutForm.shipping_address}
                onChange={(e) =>
                  setCheckoutForm({ ...checkoutForm, shipping_address: e.target.value })
                }
                className="w-full px-3.5 py-2.5   rounded-xl"
              />
            </div>

            {cartSummary?.has_errors && (
              <p role="alert" className="text-rose-700 font-semibold">
                Your cart has items that can't be ordered. Review the cart before placing the order.
              </p>
            )}
            <button
              type="submit"
              disabled={placingOrder || Boolean(cartSummary?.has_errors)}
              aria-busy={placingOrder}
              style={{ backgroundColor: accentColor }}
              className="w-full py-3.5 rounded-xl text-white font-extrabold text-sm cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              {placingOrder ? 'Placing order…' : 'Confirm Wholesale Order & Generate GST Tax Invoice'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
