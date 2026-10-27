import { formatINR, resolveMediaUrl } from '../../../lib/api';
import { sanitizeHtml } from '../../../lib/sanitize';
import { useStorefront } from '../StorefrontContext';

export function AboutSection() {
  const {
    shop,
  } = useStorefront();
  if (!shop) return null;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl   p-8 ">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-xs font-extrabold tracking-tight text-blue-600">
                Corporate & Statutory Profile
              </span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">About {shop.name}</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Legal Entity: {shop.legal_name} • GSTIN: {shop.gstin}
            </p>
            <div
              className="mt-5 text-sm text-slate-700 leading-relaxed space-y-3"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(
                  shop.about_html ||
                  `<p>${shop.name} (${shop.legal_name}) is a verified B2B wholesale supplier and institutional distributor operating out of ${shop.city}, ${shop.state_code}.</p>`
                ),
              }}
            />
            </div>
            <div className="lg:col-span-5">
              <img
                src={resolveMediaUrl(shop.merchant_settings?.about_image_url || shop.banner_url || '/uploads/demo/acme-warehouse.svg')}
                alt={`${shop.name} Fulfillment Hub`}
                className="w-full h-56 object-cover rounded-2xl   "
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6  ">
            <div className="p-4 rounded-xl bg-slate-50  ">
              <div className="text-[11px] text-slate-500 font-semibold">Registered Legal Entity</div>
              <div className="text-sm font-black text-slate-900 mt-1">{shop.legal_name}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50  ">
              <div className="text-[11px] text-slate-500 font-semibold">Verified GSTIN & PAN</div>
              <div className="text-sm tnum font-black text-slate-900 mt-1">
                {shop.gstin} / {shop.pan || 'AABCA8821K'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50  ">
              <div className="text-[11px] text-slate-500 font-semibold">Primary Dispatch Hub</div>
              <div className="text-sm font-black text-slate-900 mt-1">
                {shop.city}, {shop.state_code} - {shop.postal_code}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50  ">
              <div className="text-[11px] text-slate-500 font-semibold">Minimum Order Value (MOV)</div>
              <div className="text-sm font-black text-emerald-700 mt-1">
                {formatINR(shop.min_order_value)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl   p-6 ">
            <h3 className="text-base font-extrabold text-slate-900 mb-3">
              Fulfillment Warehouses & Logistics Infrastructure
            </h3>
            <div className="space-y-3 text-xs">
              {(shop.warehouses && shop.warehouses.length > 0
                ? shop.warehouses
                : [
                    {
                      id: 1,
                      name: `${shop.city} Central Distribution Facility`,
                      code: 'WH-PRIMARY',
                      city: shop.city,
                      state_code: shop.state_code,
                    },
                  ]
              ).map((wh) => (
                <div
                  key={wh.id}
                  className="p-4 rounded-xl bg-slate-50   flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">{wh.name}</div>
                    <div className="text-slate-500 mt-0.5">
                      Location: {wh.city}, {wh.state_code} • E-Way Bill Automated
                    </div>
                  </div>
                  <span className="tnum text-[11px] px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">
                    {wh.code}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {shop.bank_account_details_json && (
            <div className="bg-white rounded-2xl   p-6 ">
              <h3 className="text-base font-extrabold text-slate-900 mb-3">
                Official Corporate Bank Details (NEFT / RTGS / IMPS)
              </h3>
              <div className="bg-slate-900 text-white rounded-xl p-5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Beneficiary Name:</span>
                  <span className="font-bold">{shop.bank_account_details_json.account_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Name:</span>
                  <span className="font-semibold">{shop.bank_account_details_json.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current A/C Number:</span>
                  <span className="tnum font-bold text-amber-300">
                    {shop.bank_account_details_json.account_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IFSC Code:</span>
                  <span className="tnum font-bold text-emerald-300">
                    {shop.bank_account_details_json.ifsc}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
