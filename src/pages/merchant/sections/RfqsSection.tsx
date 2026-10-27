import { api, formatINR } from '../../../lib/api';
import { useMerchantConsole } from '../MerchantConsoleContext';

export function RfqsSection() {
  const {
    queryClient,
    rfqQuoteInputs,
    setRfqQuoteInputs,
    showToast,
    runSafely,
    rfqsQuery,
  } = useMerchantConsole();

  return (
    <>
      <div className="bg-white p-5 rounded-xl   space-y-4 text-xs">
        <h2 className="font-bold text-base">Wholesale RFQs & Custom Rate Contract Inquiries</h2>
        {(rfqsQuery.data || []).length === 0 ? (
          <p className="text-slate-500">No wholesale RFQs submitted yet. Buyers can submit RFQs from your public Contact & RFQ page.</p>
        ) : (
          <div className="space-y-3">
            {(rfqsQuery.data || []).map((rfq: any) => {
              const qInput = rfqQuoteInputs[rfq.id] || { price: rfq.quoted_unit_price || rfq.target_unit_price || '95', notes: rfq.merchant_response || '' };
              return (
                <div key={rfq.id} className="p-4 rounded-xl   bg-slate-50 space-y-2">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <span className="tnum font-bold text-blue-700">{rfq.rfq_number}</span>
                      <span className="font-bold text-slate-900 ml-2">{rfq.business_name}</span>
                      <span className="text-slate-500 ml-2">({rfq.contact_name} • {rfq.phone} • {rfq.email})</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold uppercase">
                      {rfq.status}
                    </span>
                  </div>
                  <div className="text-slate-700">
                    Requirement: <strong>{rfq.product_name || rfq.product_requirement}</strong> • Target Qty: <strong>{rfq.target_quantity}</strong>
                    {rfq.target_unit_price && <> • Target Rate: <strong>{formatINR(rfq.target_unit_price)}</strong></>}
                    {rfq.quoted_unit_price && <> • Quoted Rate: <strong className="text-emerald-700">{formatINR(rfq.quoted_unit_price)}</strong></>}
                  </div>
                  {rfq.notes && <div className="text-slate-600 italic">"{rfq.notes}"</div>}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <input
                      type="number"
                      placeholder="Quote Unit Rate (₹)"
                      value={qInput.price}
                      onChange={(e) =>
                        setRfqQuoteInputs({
                          ...rfqQuoteInputs,
                          [rfq.id]: { ...qInput, price: e.target.value },
                        })
                      }
                      className="  rounded px-2.5 py-1.5 bg-white w-40"
                    />
                    <input
                      type="text"
                      placeholder="Merchant response / terms..."
                      value={qInput.notes}
                      onChange={(e) =>
                        setRfqQuoteInputs({
                          ...rfqQuoteInputs,
                          [rfq.id]: { ...qInput, notes: e.target.value },
                        })
                      }
                      className="  rounded px-2.5 py-1.5 bg-white flex-1"
                    />
                    <button
                      onClick={() =>
  runSafely(async () => {
                        await api.patch(`/merchant/rfqs/${rfq.id}`, {
                          status: 'quoted',
                          quoted_unit_price: Number(qInput.price),
                          merchant_response: qInput.notes || 'Special wholesale slab approved.',
                          convert_to_contract: true,
                        });
                        queryClient.invalidateQueries({ queryKey: ['merchant-rfqs'] });
                        queryClient.invalidateQueries({ queryKey: ['merchant-pricing-lists'] });
                        showToast('success', 'RFQ quoted & converted to contract price list!');
                      }, 'Action failed. Please try again.')
}
                      className="px-3 py-1.5 rounded bg-emerald-600 text-white font-bold cursor-pointer"
                    >
                      Send Quote & Convert to Contract
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
