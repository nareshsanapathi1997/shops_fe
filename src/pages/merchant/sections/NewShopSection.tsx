import { useMerchantConsole } from '../MerchantConsoleContext';

export function NewShopSection() {
  const {
    newShopForm,
    setNewShopForm,
    createShopMutation,
  } = useMerchantConsole();

  return (
    <>
      <div className="bg-white p-6 rounded-xl   max-w-lg space-y-4 text-xs">
        <h2 className="font-bold text-base">Launch New Independent Wholesale Storefront</h2>
        <input
          type="text"
          placeholder="Business / Store Name"
          value={newShopForm.name}
          onChange={(e) => setNewShopForm({ ...newShopForm, name: e.target.value })}
          className="w-full   rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Unique Subdomain Slug (e.g. apex-steel)"
          value={newShopForm.slug}
          onChange={(e) => setNewShopForm({ ...newShopForm, slug: e.target.value.toLowerCase() })}
          className="w-full   rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="GSTIN"
          value={newShopForm.gstin}
          onChange={(e) => setNewShopForm({ ...newShopForm, gstin: e.target.value })}
          className="w-full   rounded px-3 py-2"
        />
        <button
          onClick={() => createShopMutation.mutate()}
          className="w-full py-2.5 rounded bg-emerald-600 text-white font-bold cursor-pointer"
        >
          Provision Subdomain & Storefront
        </button>
      </div>
    </>
  );
}
