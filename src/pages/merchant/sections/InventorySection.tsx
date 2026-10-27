import { api } from '../../../lib/api';
import { useMerchantConsole } from '../MerchantConsoleContext';

export function InventorySection() {
  const {
    queryClient,
    newWarehouse,
    setNewWarehouse,
    stockAdjust,
    setStockAdjust,
    showToast,
    runSafely,
    productsQuery,
    inventoryQuery,
    adjustInventoryMutation,
  } = useMerchantConsole();

  return (
    <>
      <div className="space-y-6 text-xs">
        <div className="bg-white p-5 rounded-xl   space-y-3">
          <h2 className="font-bold text-base">Add Multi-State Dispatch Warehouse</h2>
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="Warehouse Name (e.g. Balanagar Hub)"
              value={newWarehouse.name}
              onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
              className="  rounded px-3 py-1.5"
            />
            <input
              placeholder="Code (e.g. HYD-02)"
              value={newWarehouse.code}
              onChange={(e) => setNewWarehouse({ ...newWarehouse, code: e.target.value.toUpperCase() })}
              className="  rounded px-3 py-1.5 w-28 tnum"
            />
            <input
              placeholder="City"
              value={newWarehouse.city}
              onChange={(e) => setNewWarehouse({ ...newWarehouse, city: e.target.value })}
              className="  rounded px-3 py-1.5 w-32"
            />
            <button
              onClick={() =>
  runSafely(async () => {
                await api.post('/merchant/warehouses', newWarehouse);
                queryClient.invalidateQueries({ queryKey: ['merchant-inventory'] });
                setNewWarehouse({ name: '', code: '', city: 'Hyderabad', state_code: 'TG' });
                showToast('success', 'New dispatch warehouse created.');
              }, 'Action failed. Please try again.')
}
              className="px-3 py-1.5 rounded bg-slate-900 text-white font-bold cursor-pointer"
            >
              + Add Warehouse
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl   space-y-3">
          <h2 className="font-bold text-base">Warehouse Stock Adjustment & Movement Ledger</h2>
          <div className="flex flex-wrap gap-3">
            <select
              value={stockAdjust.product_id}
              onChange={(e) => setStockAdjust({ ...stockAdjust, product_id: Number(e.target.value) })}
              className="  rounded px-3 py-2"
            >
              <option value={0}>Select SKU...</option>
              {(productsQuery.data || []).map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.sku} · {p.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={stockAdjust.quantity_delta}
              onChange={(e) => setStockAdjust({ ...stockAdjust, quantity_delta: Number(e.target.value) })}
              className="  rounded px-3 py-2 w-28"
            />
            <button
              disabled={!stockAdjust.product_id}
              onClick={() => adjustInventoryMutation.mutate()}
              className="px-4 py-2 rounded bg-blue-600 text-white font-bold cursor-pointer"
            >
              Record Stock Entry
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl  ">
          <h3 className="font-bold text-sm mb-3">Live Warehouse Stock Balances</h3>
          <div className="overflow-x-auto"><table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2">Product</th>
                <th className="p-2">Warehouse</th>
                <th className="p-2">On Hand</th>
                <th className="p-2">Reserved</th>
                <th className="p-2">Available</th>
              </tr>
            </thead>
            <tbody className=" divide-slate-200">
              {(inventoryQuery.data?.balances || []).map((b: any) => (
                <tr key={b.id}>
                  <td className="p-2 font-bold">{b.product?.name}</td>
                  <td className="p-2">{b.warehouse?.name}</td>
                  <td className="p-2 font-semibold">{b.on_hand_qty}</td>
                  <td className="p-2 text-amber-700">{b.reserved_qty}</td>
                  <td className="p-2 font-bold text-emerald-700">{b.on_hand_qty - b.reserved_qty}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
    </>
  );
}
