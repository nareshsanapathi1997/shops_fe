import { api } from '../../../lib/api';
import { useMerchantConsole } from '../MerchantConsoleContext';

export function CategoriesSection() {
  const {
    queryClient,
    newCategory,
    setNewCategory,
    newTaxCat,
    setNewTaxCat,
    showToast,
    runSafely,
    categoriesQuery,
    createCategoryMutation,
  } = useMerchantConsole();

  return (
    <>
      <div className="bg-white p-5 rounded-xl   space-y-4 text-xs">
        <h2 className="font-bold text-base">Categories & GST Tax Slabs</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            className="  rounded px-3 py-2 flex-1"
          />
          <button
            onClick={() => createCategoryMutation.mutate()}
            className="px-4 py-2 rounded bg-slate-900 text-white font-bold cursor-pointer"
          >
            Add Category
          </button>
        </div>
        <ul className=" divide-slate-200">
          {(categoriesQuery.data?.categories || []).map((c: any) => (
            <li key={c.id} className="py-2 flex justify-between items-center">
              <div>
                <span className="font-bold">{c.name}</span>
                <span className="text-slate-500 ml-2">Slug: {c.slug}</span>
              </div>
              <button
                onClick={() =>
  runSafely(async () => {
                  if (!window.confirm(`Delete category "${c.name}"?`)) return;
                  await api.delete(`/merchant/categories/${c.id}`);
                  queryClient.invalidateQueries({ queryKey: ['merchant-categories'] });
                  showToast('success', 'Category deleted.');
                }, 'Action failed. Please try again.')
}
                className="text-rose-600 font-bold cursor-pointer"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <div className="  pt-4 space-y-2">
          <h3 className="font-bold text-sm">Create Custom HSN GST Tax Slab</h3>
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="Slab Name (e.g. GST 12% Industrial)"
              value={newTaxCat.name}
              onChange={(e) => setNewTaxCat({ ...newTaxCat, name: e.target.value })}
              className="  rounded px-3 py-1.5"
            />
            <input
              placeholder="HSN Code"
              value={newTaxCat.hsn_code}
              onChange={(e) => setNewTaxCat({ ...newTaxCat, hsn_code: e.target.value })}
              className="  rounded px-3 py-1.5 w-28 tnum"
            />
            <input
              type="number"
              placeholder="GST %"
              value={newTaxCat.gst_rate}
              onChange={(e) => setNewTaxCat({ ...newTaxCat, gst_rate: Number(e.target.value) })}
              className="  rounded px-3 py-1.5 w-24"
            />
            <button
              onClick={() =>
  runSafely(async () => {
                await api.post('/merchant/tax-categories', newTaxCat);
                queryClient.invalidateQueries({ queryKey: ['merchant-categories'] });
                setNewTaxCat({ name: '', hsn_code: '', gst_rate: 18 });
                showToast('success', 'GST Tax Slab saved.');
              }, 'Action failed. Please try again.')
}
              className="px-3 py-1.5 rounded bg-emerald-600 text-white font-bold cursor-pointer"
            >
              + Add GST Slab
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
