import { formatINR } from '../../../lib/api';
import { useStorefront } from '../StorefrontContext';

export function PoliciesSection() {
  const {
    shop,
    activePolicySection,
    setActivePolicySection,
  } = useStorefront();
  if (!shop) return null;

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl   p-6 sm:p-8  space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4   pb-4">
            <div>
              <span className="text-xs font-extrabold tracking-tight text-blue-600">
                Official Governance & SLA
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                {shop.name} · Wholesale Trade Policies
              </h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'shipping', label: 'Shipping & Dispatch' },
                  { id: 'returns', label: 'Returns & Claims' },
                  { id: 'terms', label: 'B2B Terms of Trade' },
                  { id: 'privacy', label: 'Buyer Privacy' },
                ] as const
              ).map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActivePolicySection(sec.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    activePolicySection === sec.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50   text-sm text-slate-700 leading-relaxed">
            {activePolicySection === 'shipping' && (
              <div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Shipping, Freight & E-Way Bill Dispatch Policy
                </h3>
                <p>
                  {shop.shipping_policy ||
                    `Orders placed before 2:00 PM IST are dispatched the same business day from our ${shop.city} warehouse with automated GST E-Way Bill generation for consignments exceeding ₹50,000.`}
                </p>
              </div>
            )}
            {activePolicySection === 'returns' && (
              <div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Transit Damage, Shortage & Replacement Policy
                </h3>
                <p>
                  {shop.return_policy ||
                    'Any transit damage or carton shortage must be endorsed on the transporter POD and reported within 48 hours of delivery for immediate credit note or replacement.'}
                </p>
              </div>
            )}
            {activePolicySection === 'terms' && (
              <div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Wholesale Terms of Trade & Minimum Order Value
                </h3>
                <p>
                  {shop.terms_policy ||
                    `All transactions on this portal are strictly B2B wholesale supplies subject to a Minimum Order Value of ${formatINR(
                      shop.min_order_value
                    )} and ${shop.city} commercial jurisdiction.`}
                </p>
              </div>
            )}
            {activePolicySection === 'privacy' && (
              <div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Retailer Data & GSTIN Privacy Policy
                </h3>
                <p>
                  {shop.privacy_policy ||
                    'Buyer GSTIN, PAN, and commercial rate contracts are encrypted and used strictly for statutory e-Invoicing and B2B order fulfillment.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
