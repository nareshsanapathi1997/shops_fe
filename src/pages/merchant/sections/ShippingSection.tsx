import { api, formatINR } from '../../../lib/api';
import { useMerchantConsole } from '../MerchantConsoleContext';

export function ShippingSection() {
  const {
    queryClient,
    newShippingMethod,
    setNewShippingMethod,
    showToast,
    runSafely,
    shippingMethodsQuery,
  } = useMerchantConsole();

  return (
    <>
      <div className="bg-white p-5 rounded-xl   space-y-4 text-xs">
        <h2 className="font-bold text-base">B2B Freight & Carrier Shipping Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 bg-slate-50 p-4 rounded-xl  ">
          <input
            placeholder="Method Name (e.g. Surface Pallet Cargo)"
            value={newShippingMethod.name}
            onChange={(e) => setNewShippingMethod({ ...newShippingMethod, name: e.target.value })}
            className="  rounded px-2.5 py-1.5 bg-white"
          />
          <input
            placeholder="Carrier (e.g. VRL / Delhivery B2B)"
            value={newShippingMethod.carrier_name}
            onChange={(e) => setNewShippingMethod({ ...newShippingMethod, carrier_name: e.target.value })}
            className="  rounded px-2.5 py-1.5 bg-white"
          />
          <input
            type="number"
            placeholder="Base Freight (₹)"
            value={newShippingMethod.base_charge}
            onChange={(e) => setNewShippingMethod({ ...newShippingMethod, base_charge: Number(e.target.value) })}
            className="  rounded px-2.5 py-1.5 bg-white"
          />
          <input
            type="number"
            placeholder="Free Freight Above (₹)"
            value={newShippingMethod.free_shipping_threshold}
            onChange={(e) => setNewShippingMethod({ ...newShippingMethod, free_shipping_threshold: Number(e.target.value) })}
            className="  rounded px-2.5 py-1.5 bg-white"
          />
          <button
            onClick={() =>
  runSafely(async () => {
              await api.post('/merchant/shipping-methods', newShippingMethod);
              queryClient.invalidateQueries({ queryKey: ['merchant-shipping-methods'] });
              setNewShippingMethod({ ...newShippingMethod, name: '' });
              showToast('success', 'Shipping carrier method added.');
            }, 'Action failed. Please try again.')
}
            className="px-3 py-1.5 rounded bg-slate-900 text-white font-bold cursor-pointer"
          >
            + Add Carrier
          </button>
        </div>
        <div className="space-y-2">
          {(shippingMethodsQuery.data || []).map((m: any) => (
            <div key={m.id} className="p-3 rounded-lg   flex justify-between items-center">
              <div>
                <div className="font-bold">{m.name} ({m.carrier_name || m.code})</div>
                <div className="text-slate-500">
                  Base Charge: {formatINR(m.base_charge ?? m.flat_rate)} • Free Above: {formatINR(m.free_shipping_threshold || 0)}
                </div>
              </div>
              <button
                onClick={() =>
  runSafely(async () => {
                  if (!window.confirm(`Delete shipping method "${m.name}"?`)) return;
                  await api.delete(`/merchant/shipping-methods/${m.id}`);
                  queryClient.invalidateQueries({ queryKey: ['merchant-shipping-methods'] });
                  showToast('success', 'Shipping method deleted.');
                }, 'Action failed. Please try again.')
}
                className="text-rose-600 font-bold cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
