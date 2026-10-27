import { formatINR } from '../../../lib/api';
import { useMerchantConsole } from '../MerchantConsoleContext';

export function ReportsSection() {
  const {
    reportsQuery,
  } = useMerchantConsole();

  return (
    <>
      <div className="bg-white p-5 rounded-xl   space-y-4 text-xs">
        <h2 className="font-bold text-base">GST Tax Liability Summary & Top Selling Wholesale SKUs</h2>
        {reportsQuery.data?.gst_summary && (
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg">
            <div>Taxable: <strong>{formatINR(reportsQuery.data.gst_summary.taxable_value)}</strong></div>
            <div>CGST: <strong>{formatINR(reportsQuery.data.gst_summary.cgst)}</strong></div>
            <div>SGST: <strong>{formatINR(reportsQuery.data.gst_summary.sgst)}</strong></div>
            <div>IGST: <strong>{formatINR(reportsQuery.data.gst_summary.igst)}</strong></div>
          </div>
        )}
        <div>
          <h3 className="font-bold mb-2">Top Selling SKUs by Revenue</h3>
          <div className="space-y-1">
            {(reportsQuery.data?.top_products || []).map((tp: any) => (
              <div key={tp.sku} className="p-2   flex justify-between">
                <span><strong>{tp.sku}</strong> · {tp.product_name} ({tp.total_qty} units)</span>
                <span className="font-bold text-emerald-700">{formatINR(tp.total_revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
