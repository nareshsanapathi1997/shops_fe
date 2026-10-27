import { formatINR } from '../../../lib/api';
import { sanitizeHtml } from '../../../lib/sanitize';
import type { WholesaleOrder } from '../../../types/api';

interface OrdersHistoryProps {
  orders: WholesaleOrder[];
  pendingPayment: { orderId: number; orderNumber: string; message: string } | null;
  payingOrderId: number | null;
  documentPreview: { title: string; html: string } | null;
  onReorder: (orderId: number) => void;
  onViewInvoice: (invoiceId: number) => void;
  onViewCreditNote: (creditNoteId: number) => void;
  onRetryPayment: (orderId: number) => void;
  onDismissPendingPayment: () => void;
  onClosePreview: () => void;
}

/** Online orders that can still be paid from the account (not yet paid, not cancelled). */
function canPayOnline(order: WholesaleOrder): boolean {
  return (
    (order.payment_method === 'online' || order.payment_method === 'online_gateway') &&
    ['pending', 'failed'].includes(order.payment_status) &&
    !['cancelled', 'refunded'].includes(order.status)
  );
}

export function OrdersHistory({
  orders,
  pendingPayment,
  payingOrderId,
  documentPreview,
  onReorder,
  onViewInvoice,
  onViewCreditNote,
  onRetryPayment,
  onDismissPendingPayment,
  onClosePreview,
}: OrdersHistoryProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {pendingPayment && (
        <div
          role="alert"
          className="bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          <div>
            <div className="font-bold">Order {pendingPayment.orderNumber}: payment not completed</div>
            <div className="mt-0.5">{pendingPayment.message}</div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onRetryPayment(pendingPayment.orderId)}
              disabled={payingOrderId === pendingPayment.orderId}
              className="px-3.5 py-2 rounded-xl bg-amber-600 text-white font-bold cursor-pointer disabled:opacity-60"
            >
              {payingOrderId === pendingPayment.orderId ? 'Opening payment…' : 'Retry payment'}
            </button>
            <button
              type="button"
              onClick={onDismissPendingPayment}
              className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-xl font-black text-slate-900 mb-4">
          Wholesale Order History, Reorder & GST Tax Invoices
        </h2>
        {orders.length === 0 ? (
          <p className="text-xs text-slate-500">No wholesale orders placed yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((ord) => (
              <div key={ord.id} className="p-4 rounded-xl border border-slate-200 text-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="tnum font-bold text-slate-900 text-sm">{ord.order_number}</div>
                    <div className="text-slate-500 mt-0.5">
                      Status: <strong className="uppercase">{ord.status}</strong> • Payment:{' '}
                      <strong className="uppercase">{ord.payment_status}</strong> • Supply State:{' '}
                      {ord.supply_state_code}
                      {ord.eway_bill_number && (
                        <>
                          {' '}
                          • E-way bill: <strong className="tnum">{ord.eway_bill_number}</strong>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right">
                      <div className="font-black text-sm text-slate-900">{formatINR(ord.grand_total)}</div>
                      <div className="text-[11px] text-slate-500">Incl. GST ({formatINR(ord.tax_total)})</div>
                    </div>
                    {canPayOnline(ord) && (
                      <button
                        type="button"
                        onClick={() => onRetryPayment(ord.id)}
                        disabled={payingOrderId === ord.id}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 text-white font-bold cursor-pointer disabled:opacity-60"
                      >
                        {payingOrderId === ord.id ? 'Opening payment…' : 'Pay now'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onReorder(ord.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                    >
                      1-Click Reorder
                    </button>
                    {ord.invoice && (
                      <button
                        type="button"
                        onClick={() => onViewInvoice(ord.invoice!.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 text-white font-bold cursor-pointer"
                      >
                        GST Invoice ({ord.invoice.invoice_number})
                      </button>
                    )}
                  </div>
                </div>

                {ord.credit_notes && ord.credit_notes.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-[11px] font-bold uppercase text-slate-500 mb-1.5">Credit notes</div>
                    <ul className="space-y-1.5">
                      {ord.credit_notes.map((cn) => (
                        <li key={cn.id} className="flex flex-wrap items-center justify-between gap-2">
                          <span>
                            <strong className="tnum">{cn.credit_note_number}</strong>
                            {cn.reason ? ` · ${cn.reason}` : ''} · {formatINR(cn.grand_total)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onViewCreditNote(cn.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 font-bold cursor-pointer"
                          >
                            View credit note
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {documentPreview && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4 pb-3">
            <h3 className="font-bold text-sm">{documentPreview.title}</h3>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="text-xs text-slate-700 font-bold cursor-pointer"
              >
                Print
              </button>
              <button
                type="button"
                onClick={onClosePreview}
                className="text-xs text-rose-600 font-bold cursor-pointer"
              >
                Close preview
              </button>
            </div>
          </div>
          <div
            className="prose max-w-none text-xs"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(documentPreview.html) }}
          />
        </div>
      )}
    </div>
  );
}
