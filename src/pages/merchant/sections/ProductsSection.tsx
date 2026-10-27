import { api, formatINR, resolveMediaUrl } from '../../../lib/api';
import { useMerchantConsole } from '../MerchantConsoleContext';

export function ProductsSection() {
  const {
    queryClient,
    newProduct,
    setNewProduct,
    showToast,
    runSafely,
    productsQuery,
    mediaQuery,
    handleFileUpload,
    createProductMutation,
  } = useMerchantConsole();

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl   space-y-4">
          <h2 className="font-bold text-base text-slate-900">Create Wholesale Product with Dynamic Image &amp; Quantity Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="  rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="SKU Code"
              value={newProduct.sku}
              onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
              className="  rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Base Unit Price (INR)"
              value={newProduct.base_price}
              onChange={(e) => setNewProduct({ ...newProduct, base_price: Number(e.target.value) })}
              className="  rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="MOQ"
              value={newProduct.min_order_qty}
              onChange={(e) => setNewProduct({ ...newProduct, min_order_qty: Number(e.target.value) })}
              className="  rounded px-3 py-2"
            />
            <div className="md:col-span-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Primary Product Image URL (or upload file →)"
                value={newProduct.primary_image_url}
                onChange={(e) => setNewProduct({ ...newProduct, primary_image_url: e.target.value })}
                className="flex-1   rounded px-3 py-2 tnum"
              />
              <label className="px-3 py-2 rounded bg-blue-600 text-white font-bold cursor-pointer shrink-0">
                ↑ Upload Product Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      handleFileUpload(f, {
                        category: 'product',
                        onUploadedUrl: (url) => setNewProduct((prev) => ({ ...prev, primary_image_url: url })),
                      });
                    }
                  }}
                />
              </label>
            </div>
            <button
              onClick={() => createProductMutation.mutate()}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer"
            >
              Publish Wholesale Product
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl  ">
          <h3 className="font-bold text-sm mb-3">Shop Catalogue &amp; Multi-Image Galleries ({productsQuery.data?.length || 0} SKUs)</h3>
          <div className="overflow-x-auto"><table className="w-full text-xs text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2">Gallery Preview</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Product</th>
                <th className="p-2">Base Price</th>
                <th className="p-2">MOQ</th>
                <th className="p-2">Quantity Break Tiers</th>
                <th className="p-2">Actions &amp; Photo Upload</th>
              </tr>
            </thead>
            <tbody className=" divide-slate-200">
              {(productsQuery.data || []).map((p: any) => {
                const thumbUrl = p.primary_image_url || p.images?.[0]?.url;
                return (
                  <tr key={p.id}>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {thumbUrl ? (
                          <img
                            src={resolveMediaUrl(thumbUrl)}
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover  "
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100   flex items-center justify-center font-bold text-slate-400">
                            IMG
                          </div>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {p.images?.length || (p.primary_image_url ? 1 : 0)} Views
                        </span>
                      </div>
                    </td>
                    <td className="p-2 tnum">{p.sku}</td>
                    <td className="p-2 font-bold">{p.name}</td>
                    <td className="p-2">{formatINR(p.base_price)}</td>
                    <td className="p-2">{p.min_order_qty} {p.unit}</td>
                    <td className="p-2">
                      {p.price_tiers?.map((t: any, i: number) => (
                        <span key={i} className="mr-2 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded">
                          {t.min_qty}+: {formatINR(t.unit_price)}
                        </span>
                      ))}
                    </td>
                    <td className="p-2 space-x-1.5">
                      <label className="inline-block px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold cursor-pointer">
                        + Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              handleFileUpload(f, {
                                category: 'product',
                                assign_to: 'product_image',
                                target_id: p.id,
                              });
                            }
                          }}
                        />
                      </label>
                      <button
                        onClick={() =>
  runSafely(async () => {
                          await api.put(`/merchant/products/${p.id}`, { is_featured: !p.is_featured });
                          queryClient.invalidateQueries({ queryKey: ['merchant-products'] });
                          showToast('success', 'Product updated.');
                        }, 'Action failed. Please try again.')
}
                        className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-semibold cursor-pointer"
                      >
                        {p.is_featured ? ' Featured' : ' Feature'}
                      </button>
                      <button
                        onClick={() =>
  runSafely(async () => {
                          if (!window.confirm(`Delete product "${p.name}"? This cannot be undone.`)) return;
                          await api.delete(`/merchant/products/${p.id}`);
                          queryClient.invalidateQueries({ queryKey: ['merchant-products'] });
                          showToast('success', 'Product removed.');
                        }, 'Action failed. Please try again.')
}
                        className="px-2 py-1 rounded bg-rose-50 text-rose-700 font-semibold cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>

        {/* Dynamic Media Assets Library */}
        <div className="bg-white p-5 rounded-xl   space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Dynamic Media Assets Library ({mediaQuery.data?.length || 0} Database-Backed Files)
              </h3>
              <p className="text-[11px] text-slate-500">
                Every uploaded product photo, technical blueprint, category banner, and brand emblem is stored in `file_assets` and served dynamically.
              </p>
            </div>
            <label className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer">
              ↑ Upload New Media Asset
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f, { category: 'general' });
                }}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {(mediaQuery.data || []).map((asset: any) => (
              <div key={asset.id} className="  rounded-xl p-2 bg-slate-50 flex flex-col justify-between">
                <img
                  src={resolveMediaUrl(asset.url || asset.path)}
                  alt={asset.alt_text || asset.original_name}
                  className="w-full h-20 object-cover rounded-lg   bg-white"
                />
                <div className="mt-1.5">
                  <div className="text-[10px] font-bold text-slate-800 truncate">{asset.original_name}</div>
                  <div className="text-[9px] tnum text-slate-500 truncate">{asset.url}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
