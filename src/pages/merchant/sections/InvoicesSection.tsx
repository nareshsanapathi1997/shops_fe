import { api, formatINR } from '../../../lib/api';
import { DocumentPreview } from '../../../ui/DocumentPreview';
import { EmptyState } from '../../../ui/EmptyState';
import { useMerchantConsole } from '../MerchantConsoleContext';

export function InvoicesSection() {
  const {
    documentPreview,
    setDocumentPreview,
    runSafely,
    invoicesQuery,
  } = useMerchantConsole();

  return (
    <>
      <div className="bg-white p-5 rounded-xl   space-y-4 text-xs">
        <h2 className="font-bold text-base">Statutory B2B GST Tax Invoices</h2>
      {!invoicesQuery.isLoading && (invoicesQuery.data || []).length === 0 && (
        <EmptyState title="No invoices yet" description="A GST tax invoice is issued automatically for every order." />
      )}
        <div className="overflow-x-auto"><table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2">Invoice #</th>
              <th className="p-2">Buyer</th>
              <th className="p-2">CGST / SGST / IGST</th>
              <th className="p-2">Grand Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Preview</th>
            </tr>
          </thead>
          <tbody className=" divide-slate-200">
            {(invoicesQuery.data || []).map((inv: any) => (
              <tr key={inv.id}>
                <td className="p-2 font-bold tnum">{inv.invoice_number}</td>
                <td className="p-2">{inv.buyer_details_json?.business_name}</td>
                <td className="p-2">
                  CGST: {formatINR(inv.cgst_total)} | SGST: {formatINR(inv.sgst_total)} | IGST: {formatINR(inv.igst_total)}
                </td>
                <td className="p-2 font-bold">{formatINR(inv.grand_total)}</td>
                <td className="p-2 uppercase font-bold">{inv.status}</td>
                <td className="p-2">
                  <button
                    onClick={() =>
  runSafely(async () => {
                      const res = await api.get(`/merchant/invoices/${inv.id}`);
                      setDocumentPreview({ title: `GST Tax Invoice ${inv.invoice_number}`, html: res.data.printable_html });
                    }, 'Action failed. Please try again.')
}
                    className="px-2.5 py-1 rounded bg-slate-900 text-white font-semibold cursor-pointer"
                  >
                    View Printable GST Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
        {documentPreview && (
          <DocumentPreview
            title={documentPreview.title}
            html={documentPreview.html}
            onClose={() => setDocumentPreview(null)}
          />
        )}
      </div>
    </>
  );
}
