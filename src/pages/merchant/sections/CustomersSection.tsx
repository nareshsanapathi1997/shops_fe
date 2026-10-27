import { api, formatINR } from '../../../lib/api';
import { useMerchantConsole } from '../MerchantConsoleContext';

export function CustomersSection() {
  const {
    queryClient,
    showToast,
    runSafely,
    customersQuery,
    updateCustomerMutation,
  } = useMerchantConsole();

  return (
    <>
      <div className="bg-white p-5 rounded-xl   space-y-4 text-xs">
        <h2 className="font-bold text-base">Wholesale Customers, Credit Limits & B2B Credit Ledger</h2>
        <div className="overflow-x-auto"><table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2">Business Name</th>
              <th className="p-2">GSTIN</th>
              <th className="p-2">Credit Used / Limit</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions & Credit Settlement</th>
            </tr>
          </thead>
          <tbody className=" divide-slate-200">
            {(customersQuery.data || []).map((c: any) => (
              <tr key={c.id}>
                <td className="p-2 font-bold">{c.business_name}</td>
                <td className="p-2 tnum">{c.gstin || 'N/A'}</td>
                <td className="p-2">
                  <span className="font-bold text-amber-700">{formatINR(c.credit_used)}</span> / {formatINR(c.credit_limit)}
                </td>
                <td className="p-2 uppercase font-bold">{c.approval_status}</td>
                <td className="p-2 space-x-1.5">
                  <button
                    onClick={() => updateCustomerMutation.mutate({ id: c.id, approval_status: 'approved', credit_limit: Math.max(250000, Number(c.credit_limit || 0)) })}
                    className="px-2 py-1 rounded bg-emerald-600 text-white font-semibold cursor-pointer"
                  >
                    Approve (₹2.5L Credit)
                  </button>
                  <button
                    onClick={() =>
  runSafely(async () => {
                      await api.post(`/merchant/customers/${c.id}/credit-adjustment`, {
                        entry_type: 'repayment',
                        amount: 10000,
                        reference_number: `NEFT-${Date.now().toString().slice(-5)}`,
                        notes: 'NEFT credit account settlement received',
                      });
                      queryClient.invalidateQueries({ queryKey: ['merchant-customers'] });
                      showToast('success', 'Recorded ₹10,000 credit repayment in ledger.');
                    }, 'Action failed. Please try again.')
}
                    className="px-2 py-1 rounded bg-blue-600 text-white font-semibold cursor-pointer"
                  >
                    Record ₹10k Repayment
                  </button>
                  <button
                    onClick={() => updateCustomerMutation.mutate({ id: c.id, approval_status: 'rejected' })}
                    className="px-2 py-1 rounded bg-rose-600 text-white font-semibold cursor-pointer"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
