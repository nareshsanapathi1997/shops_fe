import { api, formatINR } from '../../../lib/api';
import { useStorefront } from '../StorefrontContext';
import { INDIAN_STATES } from '../shared';

export function AccountSection() {
  const {
    customer,
    authMode,
    setAuthMode,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    regForm,
    setRegForm,
    savedAddresses,
    setSavedAddresses,
    newAddressForm,
    setNewAddressForm,
    showToast,
    handleCustomerLogin,
    handleCustomerRegister,
    handleCustomerLogout,
    primaryColor,
    accentColor,
  } = useStorefront();

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {customer ? (
          <div className="bg-white rounded-2xl   p-6 sm:p-8  space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4   pb-4">
              <div>
                <span className="text-xs font-extrabold tracking-tight text-emerald-700">
                  Verified Trade Account
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                  {customer.company_name}
                </h2>
                <p className="text-xs text-slate-500">
                  Contact: {customer.name} ({customer.email}) • GSTIN:{' '}
                  <span className="tnum font-bold">{customer.gstin || 'N/A'}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleCustomerLogout}
                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold   cursor-pointer"
              >
                Sign Out
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50  ">
                <div className="text-slate-500">Trade Verification Status</div>
                <div className="text-base font-black text-emerald-700 uppercase mt-1">
                  {customer.approval_status}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50  ">
                <div className="text-slate-500">Sanctioned Credit Limit</div>
                <div className="text-base font-black text-slate-900 mt-1">
                  {formatINR(customer.credit_limit)}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50  ">
                <div className="text-slate-500">Current Credit Exposure</div>
                <div className="text-base font-black text-amber-700 mt-1">
                  {formatINR(customer.credit_balance)}
                </div>
              </div>
            </div>

            {/* Saved Delivery / Warehouse Addresses */}
            <div className="  pt-5 space-y-4">
              <h3 className="text-sm font-black text-slate-900">
                Saved Delivery & Warehouse Addresses ({savedAddresses.length})
              </h3>
              {savedAddresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {savedAddresses.map((addr) => (
                    <div key={addr.id} className="p-3.5 rounded-xl   bg-slate-50 flex justify-between items-start gap-2">
                      <div>
                        <div className="font-bold text-slate-900">{addr.label || 'Warehouse'} • {addr.recipient_name}</div>
                        <div className="text-slate-600 mt-0.5">{addr.line1}, {addr.city}, {addr.state_code} - {addr.postal_code}</div>
                        {addr.phone && <div className="text-slate-500 mt-0.5">Phone: {addr.phone}</div>}
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.delete(`/storefront/customers/addresses/${addr.id}`);
                            setSavedAddresses(savedAddresses.filter((a) => a.id !== addr.id));
                            showToast('success', 'Saved address removed.');
                          } catch {
                            showToast('error', 'Failed to remove address.');
                          }
                        }}
                        className="text-rose-600 font-bold text-[11px] cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await api.post('/storefront/customers/addresses', newAddressForm);
                    setSavedAddresses([res.data.address, ...savedAddresses]);
                    setNewAddressForm({ ...newAddressForm, line1: '', recipient_name: '' });
                    showToast('success', 'Delivery address saved to your B2B account.');
                  } catch (err: any) {
                    showToast('error', err?.response?.data?.message || 'Failed to save address.');
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-slate-50 p-4 rounded-xl  "
              >
                <input
                  type="text"
                  placeholder="Location Label (e.g. Dock 1)"
                  value={newAddressForm.label}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, label: e.target.value })}
                  className="px-3 py-2   rounded-lg bg-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Receiving Manager Name *"
                  value={newAddressForm.recipient_name}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, recipient_name: e.target.value })}
                  className="px-3 py-2   rounded-lg bg-white"
                />
                <input
                  type="text"
                  placeholder="Contact Phone"
                  value={newAddressForm.phone}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                  className="px-3 py-2   rounded-lg bg-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Street / Industrial Plot Address *"
                  value={newAddressForm.line1}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, line1: e.target.value })}
                  className="sm:col-span-2 px-3 py-2   rounded-lg bg-white"
                />
                <div className="grid grid-cols-3 gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={newAddressForm.city}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                    className="px-2 py-2   rounded-lg bg-white"
                  />
                  <select
                    value={newAddressForm.state_code}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, state_code: e.target.value })}
                    className="px-2 py-2   rounded-lg bg-white"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.code}>{s.code}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="PIN"
                    value={newAddressForm.postal_code}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, postal_code: e.target.value })}
                    className="px-2 py-2   rounded-lg bg-white"
                  />
                </div>
                <button
                  type="submit"
                  style={{ backgroundColor: primaryColor }}
                  className="sm:col-span-3 py-2 rounded-lg text-white font-bold cursor-pointer"
                >
                  + Save Delivery Warehouse Address
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl   p-6 sm:p-8 ">
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Retailer Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Apply for Wholesale Buyer Account
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleCustomerLogin} className="space-y-4 text-xs max-w-md">
                {import.meta.env.DEV && (
                  <div className="p-3.5 rounded-xl bg-blue-50 text-blue-900">
                    <strong>Seeded Retailer Account (dev only):</strong>{' '}
                    <code className="tnum">procurement@metroretailers.in</code> /{' '}
                    <code className="tnum">Retailer@123</code>
                  </div>
                )}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business Email</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5   rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5   rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  style={{ backgroundColor: primaryColor }}
                  className="px-6 py-3 rounded-xl text-white font-extrabold text-xs cursor-pointer"
                >
                  Sign In to Wholesale Account
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleCustomerRegister}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs"
              >
                <input
                  type="text"
                  required
                  placeholder="Contact Person Full Name *"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="px-3.5 py-2.5   rounded-xl"
                />
                <input
                  type="text"
                  required
                  placeholder="Registered Firm / Company Name *"
                  value={regForm.company_name}
                  onChange={(e) => setRegForm({ ...regForm, company_name: e.target.value })}
                  className="px-3.5 py-2.5   rounded-xl"
                />
                <input
                  type="email"
                  required
                  placeholder="Business Email *"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="px-3.5 py-2.5   rounded-xl"
                />
                <input
                  type="text"
                  required
                  placeholder="Mobile / WhatsApp *"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className="px-3.5 py-2.5   rounded-xl"
                />
                <input
                  type="text"
                  placeholder="15-Digit GSTIN (Optional)"
                  value={regForm.gstin}
                  onChange={(e) => setRegForm({ ...regForm, gstin: e.target.value })}
                  className="px-3.5 py-2.5   rounded-xl tnum"
                />
                <input
                  type="password"
                  required
                  placeholder="Create Password *"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  className="px-3.5 py-2.5   rounded-xl"
                />
                <button
                  type="submit"
                  style={{ backgroundColor: accentColor }}
                  className="sm:col-span-2 py-3 rounded-xl text-white font-extrabold cursor-pointer"
                >
                  Register Wholesale Buyer Account
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}
