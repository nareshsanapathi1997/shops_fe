import { api } from '../../../lib/api';
import { useMerchantConsole } from '../MerchantConsoleContext';

export function PricingSection() {
  const {
    queryClient,
    newGroup,
    setNewGroup,
    newPriceList,
    setNewPriceList,
    showToast,
    runSafely,
    productsQuery,
    customersQuery,
    pricingListsQuery,
  } = useMerchantConsole();

  return (
    <>
      <div className="bg-white p-5 rounded-xl   space-y-5 text-xs">
        <h2 className="font-bold text-base">Customer Groups & Negotiated Contract Price Lists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50   space-y-3">
            <h3 className="font-bold">Customer Groups</h3>
            <div className="flex gap-2">
              <input
                placeholder="Group Name (e.g. Super Stockists)"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                className="  rounded px-2.5 py-1.5 flex-1 bg-white"
              />
              <input
                type="number"
                placeholder="Disc %"
                value={newGroup.discount_percentage}
                onChange={(e) => setNewGroup({ ...newGroup, discount_percentage: Number(e.target.value) })}
                className="  rounded px-2 py-1.5 w-20 bg-white"
              />
              <button
                onClick={() =>
  runSafely(async () => {
                  await api.post('/merchant/customer-groups', newGroup);
                  queryClient.invalidateQueries({ queryKey: ['merchant-pricing-lists'] });
                  setNewGroup({ name: '', code: '', discount_percentage: 5 });
                  showToast('success', 'Customer group created.');
                }, 'Action failed. Please try again.')
}
                className="px-3 py-1.5 rounded bg-slate-900 text-white font-bold cursor-pointer"
              >
                + Add
              </button>
            </div>
            {(pricingListsQuery.data?.customer_groups || pricingListsQuery.data?.groups || []).map((g: any) => (
              <div key={g.id} className="flex justify-between items-center py-1.5  ">
                <span className="font-semibold">{g.name} ({g.code})</span>
                <span className="text-emerald-700 font-bold">{g.default_discount_pct ?? g.discount_percentage}% Off</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50   space-y-3">
            <h3 className="font-bold">Customer-Specific Contract Price Lists</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Contract Name (e.g. Metro Annual Rate)"
                value={newPriceList.name}
                onChange={(e) => setNewPriceList({ ...newPriceList, name: e.target.value })}
                className="  rounded px-2.5 py-1.5 bg-white col-span-2"
              />
              <select
                value={newPriceList.product_id}
                onChange={(e) => setNewPriceList({ ...newPriceList, product_id: Number(e.target.value) })}
                className="  rounded px-2 py-1.5 bg-white"
              >
                <option value={0}>Select SKU...</option>
                {(productsQuery.data || []).map((p: any) => (
                  <option key={p.id} value={p.id}>{p.sku} · {p.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Contract Unit Rate"
                value={newPriceList.fixed_unit_price}
                onChange={(e) => setNewPriceList({ ...newPriceList, fixed_unit_price: Number(e.target.value) })}
                className="  rounded px-2 py-1.5 bg-white"
              />
              <select
                value={newPriceList.customer_id}
                onChange={(e) => setNewPriceList({ ...newPriceList, customer_id: Number(e.target.value) })}
                className="  rounded px-2 py-1.5 bg-white"
              >
                <option value={0}>Assign Buyer (Optional)...</option>
                {(customersQuery.data || []).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.business_name}</option>
                ))}
              </select>
              <button
                disabled={!newPriceList.name || !newPriceList.product_id}
                onClick={() =>
  runSafely(async () => {
                  await api.post('/merchant/price-lists', {
                    name: newPriceList.name,
                    items: [{ product_id: newPriceList.product_id, fixed_unit_price: newPriceList.fixed_unit_price }],
                    customer_ids: newPriceList.customer_id ? [newPriceList.customer_id] : [],
                  });
                  queryClient.invalidateQueries({ queryKey: ['merchant-pricing-lists'] });
                  setNewPriceList({ name: '', product_id: 0, fixed_unit_price: 95, customer_id: 0 });
                  showToast('success', 'Contract price list published.');
                }, 'Action failed. Please try again.')
}
                className="px-3 py-1.5 rounded bg-emerald-600 text-white font-bold cursor-pointer"
              >
                + Create Contract
              </button>
            </div>
            {(pricingListsQuery.data?.price_lists || []).map((pl: any) => (
              <div key={pl.id} className="py-1.5   flex justify-between items-center">
                <div>
                  <div className="font-semibold">{pl.name}</div>
                  <div className="text-slate-500">Items: {pl.items?.length || 0} • Assigned Buyers: {pl.customers?.length || 0}</div>
                </div>
                <button
                  onClick={() =>
  runSafely(async () => {
                    if (!window.confirm(`Delete contract price list "${pl.name}"? Buyers on it will revert to standard pricing.`)) return;
                    await api.delete(`/merchant/price-lists/${pl.id}`);
                    queryClient.invalidateQueries({ queryKey: ['merchant-pricing-lists'] });
                    showToast('success', 'Contract list deleted.');
                  }, 'Action failed. Please try again.')
}
                  className="text-rose-600 font-bold cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
