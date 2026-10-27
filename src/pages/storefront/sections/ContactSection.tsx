import { api } from '../../../lib/api';
import { useStorefront } from '../StorefrontContext';

export function ContactSection() {
  const {
    shop,
    rfqForm,
    setRfqForm,
    rfqSubmitted,
    setRfqSubmitted,
    showToast,
    primaryColor,
  } = useStorefront();
  if (!shop) return null;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-white rounded-2xl   p-6  space-y-5 h-fit">
          <div>
            <span className="text-xs font-extrabold tracking-tight text-blue-600">
              Direct Trade Desk
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Contact {shop.name} Wholesale Team
            </h2>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50  ">
              <div className="text-slate-500 font-semibold">Registered Office & Dispatch Hub</div>
              <div className="font-bold text-slate-900 mt-1">{shop.legal_name}</div>
              <div className="text-slate-700 mt-0.5">
                {shop.address_line1}, {shop.city}, {shop.state_code} - {shop.postal_code}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50  ">
              <div className="text-slate-500 font-semibold">Wholesale Order & RFQ Desk</div>
              <div className="font-bold text-slate-900 mt-1">Phone: {shop.support_phone}</div>
              <div className="font-bold text-emerald-700 mt-0.5">
                WhatsApp Trade Desk: {shop.whatsapp_number}
              </div>
              <div className="text-blue-700 font-medium mt-0.5">Email: {shop.support_email}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl   p-6 ">
          <h3 className="text-lg font-black text-slate-900">
            Submit Custom Bulk RFQ / Annual Rate Contract Inquiry
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Need custom pallet pricing or scheduled multi-location dispatches? Send an RFQ directly to our wholesale desk.
          </p>

          {rfqSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50   text-emerald-900 space-y-2">
              <div className="text-sm font-black">
                Trade RFQ Received by {shop.name} Wholesale Desk
              </div>
              <p className="text-xs">
                Our Key Accounts Manager will respond with a formal GST proforma quote within 4 business hours.
              </p>
              <button
                type="button"
                onClick={() => setRfqSubmitted(false)}
                className="mt-2 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await api.post('/storefront/rfqs', {
                    business_name: rfqForm.company_name,
                    contact_name: rfqForm.contact_person,
                    phone: rfqForm.phone,
                    email: rfqForm.email,
                    gstin: rfqForm.gstin || undefined,
                    product_name: rfqForm.product_name || 'Custom Bulk Requirement',
                    target_quantity: Number(rfqForm.target_quantity) || 100,
                    target_unit_price: rfqForm.target_unit_price ? Number(rfqForm.target_unit_price) : undefined,
                    delivery_city: shop.city,
                    delivery_state_code: shop.state_code,
                    notes: rfqForm.message,
                  });
                  setRfqSubmitted(true);
                  showToast('success', res.data?.message || `RFQ submitted directly to ${shop.name} trade desk.`);
                } catch (err: any) {
                  showToast('error', err?.response?.data?.message || 'Could not submit RFQ.');
                }
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input
                  type="text"
                  required
                  placeholder="Buyer Company / Firm Name *"
                  value={rfqForm.company_name}
                  onChange={(e) => setRfqForm({ ...rfqForm, company_name: e.target.value })}
                  className="px-3.5 py-2.5   rounded-xl"
                />
                <input
                  type="text"
                  required
                  placeholder="Contact Person & Designation *"
                  value={rfqForm.contact_person}
                  onChange={(e) => setRfqForm({ ...rfqForm, contact_person: e.target.value })}
                  className="px-3.5 py-2.5   rounded-xl"
                />
                <input
                  type="text"
                  required
                  placeholder="Mobile / WhatsApp Number *"
                  value={rfqForm.phone}
                  onChange={(e) => setRfqForm({ ...rfqForm, phone: e.target.value })}
                  className="px-3.5 py-2.5   rounded-xl"
                />
                <input
                  type="email"
                  required
                  placeholder="Official Business Email *"
                  value={rfqForm.email}
                  onChange={(e) => setRfqForm({ ...rfqForm, email: e.target.value })}
                  className="px-3.5 py-2.5   rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Buyer GSTIN (15-Digit Optional)"
                  value={rfqForm.gstin}
                  onChange={(e) => setRfqForm({ ...rfqForm, gstin: e.target.value })}
                  className="px-3.5 py-2.5   rounded-xl tnum"
                />
                <input
                  type="text"
                  placeholder="Product / SKU Requirement"
                  value={rfqForm.product_name}
                  onChange={(e) => setRfqForm({ ...rfqForm, product_name: e.target.value })}
                  className="px-3.5 py-2.5   rounded-xl"
                />
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="Target Bulk Quantity *"
                  value={rfqForm.target_quantity}
                  onChange={(e) => setRfqForm({ ...rfqForm, target_quantity: Number(e.target.value) })}
                  className="px-3.5 py-2.5   rounded-xl"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Target Unit Rate (₹ Optional)"
                  value={rfqForm.target_unit_price}
                  onChange={(e) => setRfqForm({ ...rfqForm, target_unit_price: e.target.value })}
                  className="px-3.5 py-2.5   rounded-xl"
                />
              </div>
              <textarea
                rows={4}
                required
                placeholder="Specify SKUs, target quantities, delivery pin code, and required dispatch schedule..."
                value={rfqForm.message}
                onChange={(e) => setRfqForm({ ...rfqForm, message: e.target.value })}
                className="w-full px-3.5 py-2.5   rounded-xl"
              />
              <button
                type="submit"
                style={{ backgroundColor: primaryColor }}
                className="px-6 py-3 rounded-xl text-white font-extrabold text-xs  cursor-pointer"
              >
                Send Official Bulk RFQ to {shop.name}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
