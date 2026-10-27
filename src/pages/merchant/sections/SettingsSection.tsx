import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { resolveMediaUrl } from '../../../lib/api';
import { useMerchantConsole } from '../MerchantConsoleContext';

export function SettingsSection() {
  const {
    shopSlug,
    settingsForm,
    setSettingsForm,
    handleFileUpload,
    updateSettingsMutation,
  } = useMerchantConsole();

  return (
    <>
      <div className="bg-white p-6 rounded-2xl   space-y-6 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-4   pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Merchant Business Page & Storefront Branding Settings
            </h2>
            <p className="text-slate-500 mt-0.5">
              Customize your public B2B Business Website at{' '}
              <strong className="tnum text-blue-600">{shopSlug}.platform-domain.com</strong> (`/store/{shopSlug}`).
            </p>
          </div>
          <Link
            to={`/store/${shopSlug}`}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1.5"
          >
            <span>Preview Live Merchant Business Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Public Brand / Store Name</label>
            <input
              value={settingsForm.name}
              onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
              className="w-full   rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Registered Legal Entity Name</label>
            <input
              value={settingsForm.legal_name}
              onChange={(e) => setSettingsForm({ ...settingsForm, legal_name: e.target.value })}
              className="w-full   rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">15-Digit GSTIN</label>
            <input
              value={settingsForm.gstin}
              onChange={(e) => setSettingsForm({ ...settingsForm, gstin: e.target.value.toUpperCase() })}
              className="w-full   rounded-lg px-3 py-2 tnum"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Minimum Order Value (MOV in INR)</label>
            <input
              type="number"
              value={settingsForm.min_order_value}
              onChange={(e) => setSettingsForm({ ...settingsForm, min_order_value: Number(e.target.value) })}
              className="w-full   rounded-lg px-3 py-2 font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Primary Brand Color (Hex)</label>
            <input
              value={settingsForm.primary_color}
              onChange={(e) => setSettingsForm({ ...settingsForm, primary_color: e.target.value })}
              className="w-full   rounded-lg px-3 py-2 tnum"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Accent Color (Hex)</label>
            <input
              value={settingsForm.accent_color}
              onChange={(e) => setSettingsForm({ ...settingsForm, accent_color: e.target.value })}
              className="w-full   rounded-lg px-3 py-2 tnum"
            />
          </div>
          <div className="md:col-span-3 bg-slate-50   rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Storefront UI Design Preset &amp; Dynamic Brand Media Assets
                </h3>
                <p className="text-[11px] text-slate-500">
                  Choose between Classic Executive Heritage, Smart High-Velocity Modern, or Classic &amp; Smart Hybrid, and upload your live Shop Logo, Hero Banner, and Warehouse Showcase images.
                </p>
              </div>
              <select
                value={settingsForm.theme_preset}
                onChange={(e) => setSettingsForm({ ...settingsForm, theme_preset: e.target.value })}
                className="px-3 py-2 rounded-lg   bg-white font-bold text-slate-900"
              >
                <option value="classic_smart"> Classic &amp; Smart Hybrid (Default)</option>
                <option value="classic">Classic Executive Heritage</option>
                <option value="smart">Smart High-Velocity Modern</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Shop Logo Uploader */}
              <div className="bg-white p-3 rounded-xl   space-y-2">
                <label className="block font-bold text-slate-700">Shop Logo (`logo_url`)</label>
                {settingsForm.logo_url && (
                  <img
                    src={resolveMediaUrl(settingsForm.logo_url)}
                    alt="Shop Logo Preview"
                    className="w-16 h-16 rounded-xl object-cover  "
                  />
                )}
                <input
                  value={settingsForm.logo_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, logo_url: e.target.value })}
                  placeholder="/uploads/demo/acme-logo.svg or https://..."
                  className="w-full   rounded px-2.5 py-1.5 tnum text-[11px]"
                />
                <label className="inline-block px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-[11px] cursor-pointer">
                  ↑ Upload Logo File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        handleFileUpload(f, {
                          category: 'logo',
                          assign_to: 'shop_logo',
                          onUploadedUrl: (url) => setSettingsForm((prev) => ({ ...prev, logo_url: url })),
                        });
                      }
                    }}
                  />
                </label>
              </div>

              {/* Hero Banner Uploader */}
              <div className="bg-white p-3 rounded-xl   space-y-2">
                <label className="block font-bold text-slate-700">Hero Banner (`banner_url`)</label>
                {settingsForm.banner_url && (
                  <img
                    src={resolveMediaUrl(settingsForm.banner_url)}
                    alt="Hero Banner Preview"
                    className="w-full h-16 rounded-lg object-cover  "
                  />
                )}
                <input
                  value={settingsForm.banner_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, banner_url: e.target.value })}
                  placeholder="/uploads/demo/acme-hero-banner.svg"
                  className="w-full   rounded px-2.5 py-1.5 tnum text-[11px]"
                />
                <label className="inline-block px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-[11px] cursor-pointer">
                  ↑ Upload Hero Banner
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        handleFileUpload(f, {
                          category: 'banner',
                          assign_to: 'shop_banner',
                          onUploadedUrl: (url) => setSettingsForm((prev) => ({ ...prev, banner_url: url })),
                        });
                      }
                    }}
                  />
                </label>
              </div>

              {/* Warehouse / About Image Uploader */}
              <div className="bg-white p-3 rounded-xl   space-y-2">
                <label className="block font-bold text-slate-700">Warehouse / About Photo (`about_image_url`)</label>
                {settingsForm.about_image_url && (
                  <img
                    src={resolveMediaUrl(settingsForm.about_image_url)}
                    alt="Warehouse Preview"
                    className="w-full h-16 rounded-lg object-cover  "
                  />
                )}
                <input
                  value={settingsForm.about_image_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, about_image_url: e.target.value })}
                  placeholder="/uploads/demo/acme-warehouse.svg"
                  className="w-full   rounded px-2.5 py-1.5 tnum text-[11px]"
                />
                <label className="inline-block px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] cursor-pointer">
                  ↑ Upload Warehouse Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        handleFileUpload(f, {
                          category: 'banner',
                          assign_to: 'shop_about_image',
                          onUploadedUrl: (url) => setSettingsForm((prev) => ({ ...prev, about_image_url: url })),
                        });
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            <label className="block font-bold text-slate-700 mb-1">Hero Banner Headline</label>
            <input
              value={settingsForm.hero_title}
              onChange={(e) => setSettingsForm({ ...settingsForm, hero_title: e.target.value })}
              className="w-full   rounded-lg px-3 py-2 font-bold"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block font-bold text-slate-700 mb-1">Hero Banner Subtitle</label>
            <input
              value={settingsForm.hero_subtitle}
              onChange={(e) => setSettingsForm({ ...settingsForm, hero_subtitle: e.target.value })}
              className="w-full   rounded-lg px-3 py-2"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block font-bold text-slate-700 mb-1">About the Business (HTML / Company Profile)</label>
            <textarea
              rows={3}
              value={settingsForm.about_html}
              onChange={(e) => setSettingsForm({ ...settingsForm, about_html: e.target.value })}
              className="w-full   rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Wholesale Desk Email</label>
            <input
              value={settingsForm.support_email}
              onChange={(e) => setSettingsForm({ ...settingsForm, support_email: e.target.value })}
              className="w-full   rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Wholesale Helpline Phone</label>
            <input
              value={settingsForm.support_phone}
              onChange={(e) => setSettingsForm({ ...settingsForm, support_phone: e.target.value })}
              className="w-full   rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">City & State Code</label>
            <div className="flex gap-2">
              <input
                value={settingsForm.city}
                onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                placeholder="City"
                className="flex-1   rounded-lg px-3 py-2"
              />
              <input
                value={settingsForm.state_code}
                onChange={(e) => setSettingsForm({ ...settingsForm, state_code: e.target.value.toUpperCase() })}
                placeholder="State"
                className="w-20   rounded-lg px-3 py-2 tnum"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Warehouse Dispatch SLA (Hours)</label>
            <input
              type="number"
              value={settingsForm.dispatch_sla_hours}
              onChange={(e) => setSettingsForm({ ...settingsForm, dispatch_sla_hours: Number(e.target.value) })}
              className="w-full   rounded-lg px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Announcement Bar Text (Public Storefront)</label>
            <input
              value={settingsForm.announcement_text}
              onChange={(e) => setSettingsForm({ ...settingsForm, announcement_text: e.target.value })}
              placeholder="e.g. Festive Bulk Offer: Extra 4% off on 50+ cartons!"
              className="w-full   rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">NEFT/RTGS Bank Name</label>
            <input
              value={settingsForm.bank_name}
              onChange={(e) => setSettingsForm({ ...settingsForm, bank_name: e.target.value })}
              className="w-full   rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Account Number</label>
            <input
              value={settingsForm.account_number}
              onChange={(e) => setSettingsForm({ ...settingsForm, account_number: e.target.value })}
              className="w-full   rounded-lg px-3 py-2 tnum"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
            <input
              value={settingsForm.ifsc}
              onChange={(e) => setSettingsForm({ ...settingsForm, ifsc: e.target.value.toUpperCase() })}
              className="w-full   rounded-lg px-3 py-2 tnum"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block font-bold text-slate-700 mb-1">Shipping & Dispatch Policy</label>
            <textarea
              rows={2}
              value={settingsForm.shipping_policy}
              onChange={(e) => setSettingsForm({ ...settingsForm, shipping_policy: e.target.value })}
              className="w-full   rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Return & Claims Policy</label>
            <textarea
              rows={2}
              value={settingsForm.return_policy}
              onChange={(e) => setSettingsForm({ ...settingsForm, return_policy: e.target.value })}
              className="w-full   rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Trade Terms & Conditions</label>
            <textarea
              rows={2}
              value={settingsForm.terms_policy}
              onChange={(e) => setSettingsForm({ ...settingsForm, terms_policy: e.target.value })}
              className="w-full   rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">B2B Data Privacy Policy</label>
            <textarea
              rows={2}
              value={settingsForm.privacy_policy}
              onChange={(e) => setSettingsForm({ ...settingsForm, privacy_policy: e.target.value })}
              className="w-full   rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <button
          disabled={updateSettingsMutation.isPending}
          onClick={() => updateSettingsMutation.mutate()}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
        >
          {updateSettingsMutation.isPending ? 'Saving Business Page...' : 'Save & Publish Merchant Business Page Changes'}
        </button>
      </div>
    </>
  );
}
