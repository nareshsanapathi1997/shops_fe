import { api, formatINR } from '../../../lib/api';
import type { CreditNoteRecord } from '../../../types/api';
import { DocumentPreview } from '../../../ui/DocumentPreview';
import { EmptyState } from '../../../ui/EmptyState';
import { useMerchantConsole } from '../MerchantConsoleContext';
import { EWAY_BILL_THRESHOLD } from '../shared';

export function OrdersSection() {
  const {
    queryClient,
    documentPreview,
    setDocumentPreview,
    showToast,
    runSafely,
    ordersQuery,
    updateOrderStatusMutation,
  } = useMerchantConsole();

  return (
    <>
      <div className="bg-white p-5 rounded-xl   space-y-4 text-xs">
        <h2 className="font-bold text-base">Wholesale Orders & Fulfillment Lifecycle</h2>
      {ordersQuery.isLoading && <p role="status" className="text-slate-500">Loading orders…</p>}
      {!ordersQuery.isLoading && (ordersQuery.data || []).length === 0 && (
        <EmptyState
          title="No orders yet"
          description="Orders placed by approved retailers on your storefront will appear here for confirmation, dispatch and payment reconciliation."
        />
      )}
        <div className="space-y-3">
          {(ordersQuery.data || []).map((o: any) => (
            <div key={o.id} className="p-4 rounded-xl   flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-bold text-sm">{o.order_number} · {o.customer?.business_name}</div>
                <div className="text-slate-500">
                  Total: {formatINR(o.grand_total)} • Order: <strong>{o.status}</strong> • Payment: <strong>{o.payment_status}</strong>
                  {o.eway_bill_number && (
                    <>
                      {' '}
                      • E-way bill: <strong className="tnum">{o.eway_bill_number}</strong>
                    </>
                  )}
                </div>
                {o.credit_notes?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {o.credit_notes.map((cn: CreditNoteRecord) => (
                      <button
                        key={cn.id}
                        type="button"
                        onClick={() =>
                          runSafely(async () => {
                            const res = await api.get(`/merchant/credit-notes/${cn.id}`);
                            setDocumentPreview({
                              title: `GST Credit Note ${cn.credit_note_number}`,
                              html: res.data.printable_html,
                            });
                          }, 'Could not load the credit note.')
                        }
                        className="px-2 py-1 rounded bg-slate-100 font-semibold cursor-pointer"
                      >
                        Credit note {cn.credit_note_number} · {formatINR(cn.grand_total)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    disabled={o.status === st || updateOrderStatusMutation.isPending}
                    onClick={() => {
                      let tracking_number: string | undefined;
                      let eway_bill_number: string | undefined;
                      if (st === 'shipped') {
                        const input = window.prompt(`Tracking / LR number for ${o.order_number} (optional):`);
                        if (input === null) return;
                        tracking_number = input.trim() || undefined;
                        if (Number(o.grand_total) > EWAY_BILL_THRESHOLD) {
                          const eway = window.prompt(
                            `${o.order_number} is above ${formatINR(EWAY_BILL_THRESHOLD)}: enter the e-way bill number (required for dispatch):`,
                            o.eway_bill_number || ''
                          );
                          if (eway === null) return;
                          if (!eway.trim()) {
                            showToast('error', 'An e-way bill number is required to ship consignments above ₹50,000.');
                            return;
                          }
                          eway_bill_number = eway.trim();
                        }
                      }
                      if (
                        st === 'cancelled' &&
                        !window.confirm(`Cancel order ${o.order_number}? Reserved stock will be released.`)
                      )
                        return;
                      updateOrderStatusMutation.mutate({ id: o.id, status: st, tracking_number, eway_bill_number });
                    }}
                    className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-900 hover:text-white font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Mark {st}
                  </button>
                ))}
                <button
                  onClick={() =>
  runSafely(async () => {
                    const utr = window.prompt(
                      `Enter the bank UTR / reference number received for ${o.order_number} (${formatINR(o.grand_total)}):`
                    );
                    if (!utr || !utr.trim()) return;
                    await api.post(`/merchant/orders/${o.id}/reconcile-payment`, {
                      utr_reference: utr.trim(),
                    });
                    queryClient.invalidateQueries({ queryKey: ['merchant-orders'] });
                    queryClient.invalidateQueries({ queryKey: ['merchant-dashboard'] });
                    showToast('success', 'Payment reconciled with bank UTR reference.');
                  }, 'Action failed. Please try again.')
}
                  className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold cursor-pointer"
                >
                  Reconcile UTR Paid
                </button>
                <button
                  onClick={() =>
  runSafely(async () => {
                    const amountInput = window.prompt(
                      `Refund amount for ${o.order_number} (paid total ${formatINR(o.grand_total)}):`,
                      String(o.grand_total)
                    );
                    if (amountInput === null) return;
                    const amount = Number(amountInput);
                    if (!Number.isFinite(amount) || amount <= 0) {
                      showToast('error', 'Enter a valid refund amount.');
                      return;
                    }
                    const reason = window.prompt('Reason for refund (recorded in the audit log):');
                    if (!reason || !reason.trim()) return;
                    await api.post(`/merchant/orders/${o.id}/refund`, { amount, reason: reason.trim() });
                    queryClient.invalidateQueries({ queryKey: ['merchant-orders'] });
                    showToast('success', 'Order refund recorded in refunds ledger.');
                  }, 'Action failed. Please try again.')
}
                  className="px-2.5 py-1 rounded bg-rose-600 text-white font-semibold cursor-pointer"
                >
                  Issue Refund
                </button>
              </div>
            </div>
          ))}
        </div>
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
