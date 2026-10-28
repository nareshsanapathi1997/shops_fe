import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Check,
  ExternalLink,
  LayoutDashboard,
  Plus,
  ShieldCheck,
  Store,
} from 'lucide-react';
import {
  MERCHANT_TOKEN_KEY,
  PLATFORM_BASE_DOMAIN,
  api,
  extractApiError,
  formatINR,
  resolveMediaUrl,
  setActiveShopSlug,
} from '../../lib/api';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import type { DirectoryShop, Plan } from '../../types/api';

interface HeroSimSku {
  sku: string;
  name: string;
  hsn: string;
  unit: string;
  packLabel: string;
  imageUrl: string;
  moq: number;
  step: number;
  tiers: { min: number; max: number | null; rate: number }[];
}

const HERO_SIM_SKUS: HeroSimSku[] = [
  {
    sku: 'ACME-MCB-32A-SPN',
    name: 'Acme ProGuard 32A SPN C-Curve MCB (10kA)',
    hsn: '853620',
    unit: 'pcs',
    packLabel: 'DIN-Rail Breaker · Box of 10 Pcs',
    imageUrl: '/uploads/demo/acme-mcb-primary.jpg',
    moq: 10,
    step: 10,
    tiers: [
      { min: 10, max: 49, rate: 215 },
      { min: 50, max: 199, rate: 192 },
      { min: 200, max: null, rate: 175 },
    ],
  },
  {
    sku: 'ACME-CBL-2.5FR-90M',
    name: 'Acme CopperFlex 2.5 sq.mm FR PVC Coil (90m)',
    hsn: '854449',
    unit: 'coil',
    packLabel: '90m Electrolytic Copper Coil',
    imageUrl: '/uploads/demo/acme-cable-primary.jpg',
    moq: 5,
    step: 5,
    tiers: [
      { min: 5, max: 24, rate: 1850 },
      { min: 25, max: 99, rate: 1740 },
      { min: 100, max: null, rate: 1650 },
    ],
  },
  {
    sku: 'ACME-LED-150W-HB',
    name: 'Acme UltraBay 150W IP66 Industrial LED Highbay',
    hsn: '940542',
    unit: 'pcs',
    packLabel: '150W Die-Cast UFO Luminaire',
    imageUrl: '/uploads/demo/acme-led-primary.jpg',
    moq: 4,
    step: 4,
    tiers: [
      { min: 4, max: 19, rate: 4400 },
      { min: 20, max: 49, rate: 3980 },
      { min: 50, max: null, rate: 3680 },
    ],
  },
];

const DEFAULT_DIRECTORY_SHOPS: DirectoryShop[] = [
  {
    id: 1,
    name: 'Acme Industrial & Electrical Supplies',
    slug: 'acme',
    legal_name: 'Acme Industrial Supplies Pvt. Ltd.',
    gstin: '36AABCA1234F1Z5',
    city: 'Hyderabad',
    state_code: 'TG',
    min_order_value: 5000,
    products_count: 3,
    primary_color: '#181817',
    accent_color: '#0d5c3a',
    logo_url: '/uploads/demo/acme-logo.png',
    banner_url: '/uploads/demo/acme-hero-banner.jpg',
    hero_title: 'Industrial Switchgear, FRLS Cables & High-Bay LEDs at Factory-Direct Slab Rates',
    hero_subtitle:
      'ISO-9001 certified electrical & industrial distributor in Hyderabad. Tiered carton pricing, verified retailer credit lines, and 100% GST ITC invoices.',
    canonical_domain: 'acme.platform-domain.com',
  },
  {
    id: 2,
    name: 'FreshFoods Agro & HoReCa Wholesale',
    slug: 'freshfoods',
    legal_name: 'FreshFoods Agro Commodities LLP',
    gstin: '27AABCF9876D1Z9',
    city: 'Navi Mumbai',
    state_code: 'MH',
    min_order_value: 3000,
    products_count: 2,
    primary_color: '#181817',
    accent_color: '#0d5c3a',
    logo_url: '/uploads/demo/freshfoods-logo.png',
    banner_url: '/uploads/demo/freshfoods-hero-banner.jpg',
    hero_title: 'Export-Grade Staples, Cold-Pressed Oils & Spices for Supermarkets & HoReCa',
    hero_subtitle:
      'Direct APMC Vashi bulk commodity supplier for supermarkets, hotels, and catering contractors across Maharashtra & Western India.',
    canonical_domain: 'freshfoods.platform-domain.com',
  },
];

export const PlatformBusinessPage: React.FC = () => {
  useDocumentTitle('BharatWholesale Cloud — Multi-Tenant B2B Commerce SaaS Platform');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string>('growth');
  const [simSkuIdx, setSimSkuIdx] = useState<number>(0);
  const [simQty, setSimQty] = useState<number>(60);
  const [simSupplyMode, setSimSupplyMode] = useState<'intra' | 'inter'>('intra');
  const [activeWorkflowStage, setActiveWorkflowStage] = useState<number>(0);

  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopSlug, setShopSlug] = useState('');
  const [legalName, setLegalName] = useState('');
  const [gstin, setGstin] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [stateCode, setStateCode] = useState('TG');
  const [minOrderValue, setMinOrderValue] = useState('5000');
  const [primaryColor, setPrimaryColor] = useState('#141413');
  const [accentColor, setAccentColor] = useState('#0d5c3a');
  const [heroTitle, setHeroTitle] = useState('Authorized Factory-Direct Wholesale Supply Portal');
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [launchedShop, setLaunchedShop] = useState<{ name: string; slug: string; domain: string } | null>(null);

  const directoryQuery = useQuery({
    queryKey: ['platform-directory-shops'],
    queryFn: async () => {
      const res = await api.get('/directory/shops');
      return res.data as {
        shops: DirectoryShop[];
        plans: Plan[];
        platform_settings?: Record<string, any>;
        platform_metrics?: {
          active_tenants?: number;
          total_wholesale_skus?: number;
          b2b_orders_processed?: number;
          verified_retailers?: number;
        };
      };
    },
  });

  const shops: DirectoryShop[] =
    directoryQuery.data?.shops && directoryQuery.data.shops.length > 0
      ? directoryQuery.data.shops
      : DEFAULT_DIRECTORY_SHOPS;
  const platformSettings = directoryQuery.data?.platform_settings || {};
  const plans: Plan[] =
    directoryQuery.data?.plans && directoryQuery.data.plans.length > 0
      ? directoryQuery.data.plans
      : [
          { id: 1, name: 'Starter Wholesale', slug: 'starter', price_monthly: 2499, price_yearly: 24990, max_products: 500, max_staff: 3, custom_domain_allowed: false, b2b_tier_pricing_allowed: true },
          { id: 2, name: 'Growth Distributor', slug: 'growth', price_monthly: 5999, price_yearly: 59990, max_products: 5000, max_staff: 15, custom_domain_allowed: true, b2b_tier_pricing_allowed: true },
          { id: 3, name: 'Enterprise Industrial', slug: 'enterprise', price_monthly: 14999, price_yearly: 149990, max_products: 50000, max_staff: 100, custom_domain_allowed: true, b2b_tier_pricing_allowed: true },
        ];

  const activeSimSku = HERO_SIM_SKUS[simSkuIdx] || HERO_SIM_SKUS[0];
  const matchedTier =
    activeSimSku.tiers.find((t) => simQty >= t.min && (t.max === null || simQty <= t.max)) ||
    activeSimSku.tiers[0];
  const baseRate = activeSimSku.tiers[0].rate;
  const activeRate = matchedTier.rate;
  const taxableTotal = activeRate * simQty;
  const unitSaving = Math.max(0, baseRate - activeRate);
  const totalSaving = unitSaving * simQty;
  const cgstAmount = simSupplyMode === 'intra' ? Math.round(taxableTotal * 0.09) : 0;
  const sgstAmount = simSupplyMode === 'intra' ? Math.round(taxableTotal * 0.09) : 0;
  const igstAmount = simSupplyMode === 'inter' ? Math.round(taxableTotal * 0.18) : 0;
  const grandTotal = taxableTotal + cgstAmount + sgstAmount + igstAmount;

  const openMerchantStorefront = (slug: string) => {
    setActiveShopSlug(slug);
    queryClient.invalidateQueries();
    navigate(`/store/${slug}`);
  };

  const handleShopNameChange = (val: string) => {
    setShopName(val);
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28);
    setShopSlug(autoSlug);
    if (!legalName) setLegalName(val ? `${val} Pvt. Ltd.` : '');
  };

  const handleLaunchStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLaunchError(null);
    setLaunching(true);
    if (ownerPassword.length < 8) {
      setLaunchError('Password must be at least 8 characters.');
      setLaunching(false);
      return;
    }
    try {
      // The wizard collects the owner's own credentials, so it always creates a new owner
      // account and the shop atomically. Never attach the shop to whatever token happens
      // to be in localStorage (e.g. an admin or a different merchant).
      const selectedPlan = plans.find((p) => p.slug === selectedPlanSlug) || plans[1] || plans[0];
      const res = await api.post('/onboarding/shops', {
        owner_name: ownerName,
        owner_email: ownerEmail.trim().toLowerCase(),
        owner_phone: ownerPhone || undefined,
        password: ownerPassword,
        shop_name: shopName,
        slug: shopSlug || undefined,
        legal_name: legalName || `${shopName} Pvt. Ltd.`,
        gstin: gstin || undefined,
        city,
        state_code: stateCode,
        minimum_order_amount: Number(minOrderValue) || 0,
        primary_color: primaryColor,
        accent_color: accentColor,
        hero_title: heroTitle,
        plan_slug: selectedPlan?.slug,
      });
      if (res.data?.token) localStorage.setItem(MERCHANT_TOKEN_KEY, res.data.token);
      const createdShop = res.data?.shop;
      const finalSlug = createdShop?.slug || shopSlug;
      setActiveShopSlug(finalSlug);
      await queryClient.invalidateQueries({ queryKey: ['platform-directory-shops'] });
      setLaunchedShop({ name: createdShop?.name || shopName, slug: finalSlug, domain: `${finalSlug}.${PLATFORM_BASE_DOMAIN}` });
    } catch (err: any) {
      setLaunchError(
        extractApiError(err, 'Unable to provision store. Check that the subdomain slug or email is unique.')
      );
    } finally {
      setLaunching(false);
    }
  };

  const selectedPlanObj = plans.find((p) => p.slug === selectedPlanSlug) || plans[1] || plans[0];
  const selectedPlanMonthly = Number(selectedPlanObj?.monthly_price ?? selectedPlanObj?.price_monthly ?? 5999);
  const selectedPlanYearly = Number(selectedPlanObj?.yearly_price ?? selectedPlanObj?.price_yearly ?? 59990);
  const selectedPlanDisplayPrice = billingCycle === 'monthly' ? selectedPlanMonthly : selectedPlanYearly;

  return (
    <div className="min-h-svh bg-white text-[#181817] font-display-platform flex flex-col">
      <header className="bg-[#181817] text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#a1ffcb] text-[#181817] flex items-center justify-center font-bold text-sm">
              BW
            </div>
            <div>
              <div className="text-[16px] font-semibold tracking-tight leading-none">
                {platformSettings.platform_name || 'BharatWholesale Cloud'}
              </div>
              <div className="text-[13px] text-[#a3a29d] mt-0.5">
                Multi-Tenant B2B Commerce & GST Engine
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-[15px] text-[#d4d3ce]">
            <a href="#live-stores" className="hover:text-white transition-colors">Live Merchant Stores</a>
            <a href="#launch-wizard" className="hover:text-white transition-colors">Provision Store</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Architecture</a>
            <a href="#pricing" className="hover:text-white transition-colors">Plans</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/merchant')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#262624] hover:bg-[#32322f] text-[#f3f3f1] text-[14px] font-medium cursor-pointer transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-[#a1ffcb]" />
              <span>Merchant Sign In</span>
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-[#262624] hover:bg-[#32322f] text-[#c7c6c1] text-[14px] font-medium cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#a1ffcb]" />
              <span>Super-Admin</span>
            </button>
          </div>
        </div>
      </header>

      <section className="bg-[#181817] text-white pt-12 pb-20 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 pt-2 taste-enter">
            <h1 className="text-[clamp(2.5rem,4.4vw,4.1rem)] font-semibold tracking-[-0.03em] leading-[0.96] text-white">
              Wholesale infrastructure
              <br />
              that calculates every lot.
            </h1>

            <p className="mt-7 text-[17px] text-[#c7c6c1] leading-[1.55] max-w-[40ch]">
              Launch Your Own Branded B2B Wholesale Business Website in 60 Seconds. Dedicated tenant isolation, live quantity-break pricing, and statutory CGST/SGST/IGST invoicing for Indian manufacturers and distributors.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#launch-wizard"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#a1ffcb] hover:bg-[#8ef5bc] text-[#181817] font-semibold text-[15px] transition-transform duration-200 ease-out active:scale-98"
              >
                <span>Provision Storefront</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#live-stores"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-[#262624] hover:bg-[#32322f] text-white font-medium text-[15px] transition-colors"
              >
                <Store className="w-4 h-4 text-[#a1ffcb]" />
                <span>Inspect Live Tenant Stores ({shops.length || 2})</span>
              </a>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 pt-6 bg-[#20201e] p-5 tnum">
              <div>
                <div className="text-[26px] font-semibold text-white leading-none">
                  {directoryQuery.data?.platform_metrics?.active_tenants ?? (shops.length || 2)}
                </div>
                <div className="text-[13px] text-[#a3a29d] mt-1.5">Active Tenant Stores</div>
              </div>
              <div>
                <div className="text-[26px] font-semibold text-[#a1ffcb] leading-none">18%</div>
                <div className="text-[13px] text-[#a3a29d] mt-1.5">Automated GST Split</div>
              </div>
              <div>
                <div className="text-[26px] font-semibold text-white leading-none">100%</div>
                <div className="text-[13px] text-[#a3a29d] mt-1.5">Shop ID Scoped</div>
              </div>
            </div>
          </div>

          <div
            data-ui="hero-pricing-workbench"
            className="lg:col-span-7 bg-[#f3f3f1] text-[#181817] p-6 sm:p-8 taste-shutter"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <div>
                <div className="text-[15px] font-semibold text-[#181817]">
                  Live Wholesale Lot & GST Slab Engine
                </div>
                <div className="text-[13px] text-[#666560]">
                  Select a SKU, adjust order lot quantity, and inspect real-time tier & tax settlement
                </div>
              </div>
              <div className="inline-flex bg-[#e5e4e0] p-1 text-[13px] font-medium">
                <button
                  type="button"
                  onClick={() => setSimSupplyMode('intra')}
                  className={`px-3 py-1 cursor-pointer ${
                    simSupplyMode === 'intra'
                      ? 'bg-[#181817] text-white'
                      : 'text-[#52514d] hover:text-[#181817]'
                  }`}
                >
                  Intra-State (TG to TG)
                </button>
                <button
                  type="button"
                  onClick={() => setSimSupplyMode('inter')}
                  className={`px-3 py-1 cursor-pointer ${
                    simSupplyMode === 'inter'
                      ? 'bg-[#181817] text-white'
                      : 'text-[#52514d] hover:text-[#181817]'
                  }`}
                >
                  Inter-State (TG to MH)
                </button>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {HERO_SIM_SKUS.map((item, idx) => {
                const isSelected = idx === simSkuIdx;
                return (
                  <button
                    key={item.sku}
                    type="button"
                    onClick={() => {
                      setSimSkuIdx(idx);
                      setSimQty(item.tiers[1]?.min || item.moq);
                    }}
                    className={`text-left p-2.5 flex items-center gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#181817] text-white'
                        : 'bg-white text-[#181817] hover:bg-[#e8e7e3]'
                    }`}
                  >
                    <img
                      src={resolveMediaUrl(item.imageUrl)}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="w-12 h-12 object-cover shrink-0 bg-white"
                    />
                    <div className="min-w-0">
                      <div className="text-[12px] opacity-75 tnum truncate">{item.sku}</div>
                      <div className="text-[13px] font-semibold leading-snug mt-0.5 line-clamp-2">
                        {item.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5 tnum">
              {activeSimSku.tiers.map((tier, i) => {
                const isActive = matchedTier.min === tier.min;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSimQty(tier.min)}
                    className={`p-3.5 text-left cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[#a1ffcb] text-[#181817]'
                        : 'bg-white text-[#181817] hover:bg-[#e8e7e3]'
                    }`}
                  >
                    <div className="text-[13px] font-medium text-[#52514d]">
                      {tier.max ? `${tier.min} to ${tier.max} ${activeSimSku.unit}` : `${tier.min}+ ${activeSimSku.unit}`}
                    </div>
                    <div className="text-[22px] font-semibold mt-1 leading-none">
                      {formatINR(tier.rate)}
                    </div>
                    <div className="text-[13px] mt-1 text-[#3d3c38]">
                      {isActive ? 'Unlocked Slab' : `Click for ${tier.min} ${activeSimSku.unit}`}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 bg-white p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center tnum">
              <div className="md:col-span-5">
                <label className="block text-[13px] font-medium text-[#52514d] mb-2">
                  Order Lot Quantity ({activeSimSku.unit}) · MOQ {activeSimSku.moq}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSimQty((q) => Math.max(activeSimSku.moq, q - activeSimSku.step))
                    }
                    className="w-10 h-10 bg-[#f3f3f1] hover:bg-[#e5e4e0] text-[#181817] font-semibold text-lg cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={activeSimSku.moq}
                    step={activeSimSku.step}
                    value={simQty}
                    onChange={(e) =>
                      setSimQty(Math.max(activeSimSku.moq, Number(e.target.value) || activeSimSku.moq))
                    }
                    className="w-24 h-10 text-center bg-[#f3f3f1] text-[#181817] font-semibold text-[16px]"
                  />
                  <button
                    type="button"
                    onClick={() => setSimQty((q) => q + activeSimSku.step)}
                    className="w-10 h-10 bg-[#f3f3f1] hover:bg-[#e5e4e0] text-[#181817] font-semibold text-lg cursor-pointer"
                  >
                    +
                  </button>
                </div>
                {totalSaving > 0 && (
                  <div className="mt-2.5 text-[13px] font-semibold text-[#0d5c3a]">
                    Volume Slab Saving: {formatINR(totalSaving)} ({formatINR(unitSaving)}/{activeSimSku.unit} off)
                  </div>
                )}
              </div>

              <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#f3f3f1] p-4">
                <div>
                  <div className="text-[13px] text-[#666560]">Taxable Value</div>
                  <div className="text-[17px] font-semibold text-[#181817] mt-0.5">
                    {formatINR(taxableTotal)}
                  </div>
                </div>
                <div>
                  <div className="text-[13px] text-[#666560]">
                    {simSupplyMode === 'intra' ? 'CGST 9% + SGST 9%' : 'IGST 18% (Inter-State)'}
                  </div>
                  <div className="text-[17px] font-semibold text-[#181817] mt-0.5">
                    {simSupplyMode === 'intra'
                      ? `${formatINR(cgstAmount)} + ${formatINR(sgstAmount)}`
                      : formatINR(igstAmount)}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-[13px] text-[#666560]">Net Invoice Total</div>
                  <div className="text-[20px] font-semibold text-[#0d5c3a] mt-0.5">
                    {formatINR(grandTotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="live-stores" className="py-20 px-5 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
            <div className="lg:col-span-7">
              <h2 className="text-[clamp(2rem,3.3vw,3.1rem)] font-semibold tracking-[-0.025em] leading-[1.02] text-[#181817]">
                Standalone merchant storefronts,
                <br />
                isolated to the database row.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-[17px] text-[#52514d] leading-[1.55]">
                Every wholesaler receives an independent, white-labeled B2B portal with its own custom domain, GST ledger, dynamic product gallery, and buyer login. Open any live merchant website below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shops.map((shop) => {
              const domain = shop.canonical_domain || `${shop.slug}.platform-domain.com`;
              const isFresh = shop.slug === 'freshfoods';
              const bannerUrl =
                resolveMediaUrl(shop.banner_url) ||
                (isFresh ? '/uploads/demo/freshfoods-hero-banner.jpg' : '/uploads/demo/acme-hero-banner.jpg');
              const logoUrl =
                resolveMediaUrl(shop.logo_url) ||
                (isFresh ? '/uploads/demo/freshfoods-logo.png' : '/uploads/demo/acme-logo.png');
              const sampleProducts = isFresh
                ? [
                    { label: '1121 Basmati 25kg Sack', img: '/uploads/demo/ff-basmati-primary.jpg' },
                    { label: '15L Cold-Pressed Oil Tin', img: '/uploads/demo/ff-oil-primary.jpg' },
                    { label: 'APMC Bulk Grain Lots', img: '/uploads/demo/cat-grains.jpg' },
                  ]
                : [
                    { label: '32A C-Curve MCB (10kA)', img: '/uploads/demo/acme-mcb-primary.jpg' },
                    { label: '90m CopperFlex Wire Coil', img: '/uploads/demo/acme-cable-primary.jpg' },
                    { label: '150W IP66 UFO Highbay', img: '/uploads/demo/acme-led-primary.jpg' },
                  ];
              return (
                <div
                  key={shop.id}
                  data-ui="tenant-showcase-card"
                  className="bg-[#f3f3f1] flex flex-col justify-between overflow-hidden group"
                >
                  <div className="relative h-52 bg-[#181817] overflow-hidden">
                    <img
                      src={bannerUrl}
                      alt={shop.name}
                      width={800}
                      height={360}
                      loading="lazy"
                      className="w-full h-full object-cover object-center opacity-85 transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[#181817]/45 p-6 flex flex-col justify-between text-white">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 bg-[#181817] text-[#a1ffcb] text-[13px] font-medium tnum">
                          {domain}
                        </span>
                        <span className="px-2.5 py-1 bg-[#181817] text-white text-[13px] font-medium">
                          {shop.city || 'India'}, {shop.state_code || 'TG'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5">
                        <img
                          src={logoUrl}
                          alt={shop.name}
                          width={56}
                          height={56}
                          loading="lazy"
                          className="w-14 h-14 object-contain bg-white p-1 shrink-0"
                        />
                        <div>
                          <h3 className="text-[20px] font-semibold text-white leading-tight">
                            {shop.name}
                          </h3>
                          <div className="text-[13px] text-[#e4e3de] mt-0.5">
                            {shop.legal_name || shop.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[16px] text-[#454440] leading-[1.5]">
                        {shop.hero_title ||
                          `Direct wholesale catalogue and tiered B2B ordering portal for ${shop.name}.`}
                      </p>

                      <div className="mt-4 grid grid-cols-3 gap-2.5">
                        {sampleProducts.map((sp) => (
                          <div key={sp.label} className="bg-white p-2">
                            <img
                              src={sp.img}
                              alt={sp.label}
                              width={240}
                              height={160}
                              loading="lazy"
                              className="w-full h-20 object-cover"
                            />
                            <div className="text-[12px] font-medium text-[#181817] mt-1.5 truncate">
                              {sp.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3 bg-white p-4 tnum">
                        <div>
                          <div className="text-[13px] text-[#666560]">GSTIN</div>
                          <div className="text-[14px] font-semibold text-[#181817] truncate mt-0.5">
                            {shop.gstin || '36AABCA1234F1Z5'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[13px] text-[#666560]">Min Order</div>
                          <div className="text-[14px] font-semibold text-[#181817] mt-0.5">
                            {formatINR(shop.min_order_value || 5000)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[13px] text-[#666560]">Active SKUs</div>
                          <div className="text-[14px] font-semibold text-[#0d5c3a] mt-0.5">
                            {shop.products_count ?? 3} Wholesale Lots
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openMerchantStorefront(shop.slug)}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#181817] hover:bg-[#2b2b29] text-white font-semibold text-[14px] cursor-pointer transition-colors"
                      >
                        <span>Open Merchant Website</span>
                        <ExternalLink className="w-4 h-4 text-[#a1ffcb]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveShopSlug(shop.slug);
                          navigate(`/merchant?shop=${shop.slug}`);
                        }}
                        className="py-3 px-4 bg-white hover:bg-[#e5e4e0] text-[#181817] font-medium text-[14px] cursor-pointer transition-colors"
                      >
                        Manage Console
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="capabilities" className="py-20 px-5 sm:px-8 bg-[#f3f3f1]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <h2 className="text-[clamp(1.85rem,3vw,2.75rem)] font-semibold tracking-[-0.025em] leading-[1.04] text-[#181817]">
              Engineered for high-volume Indian B2B trade.
            </h2>
            <p className="mt-3 text-[16px] text-[#52514d] leading-[1.5]">
              Select any operational stage below to inspect the live engine state on the right.
            </p>

            <div className="mt-8 space-y-3">
              {[
                {
                  title: 'Verify custom domain DNS TXT & issue SSL.',
                  desc: 'Every tenant maps either slug.platform-domain.com or their own corporate hostname with automated TXT token verification.',
                },
                {
                  title: 'Contract price lists override public quantity slabs.',
                  desc: 'Assign approved retail syndicates to VIP or Distributor price lists with net-30 credit limits and custom MOQ rules.',
                },
                {
                  title: 'Reserve warehouse stock & generate GST tax invoices.',
                  desc: 'Idempotent checkout locks batch inventory across regional warehouses and prints HSN-level CGST/SGST or IGST tax invoices.',
                },
              ].map((item, idx) => {
                const active = activeWorkflowStage === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveWorkflowStage(idx)}
                    className={`w-full text-left p-5 cursor-pointer transition-colors ${
                      active ? 'bg-[#181817] text-white' : 'bg-white text-[#181817] hover:bg-[#e8e7e3]'
                    }`}
                  >
                    <div className="text-[18px] font-semibold leading-snug">{item.title}</div>
                    <p
                      className={`mt-2 text-[15px] leading-[1.5] ${
                        active ? 'text-[#d4d3ce]' : 'text-[#52514d]'
                      }`}
                    >
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            data-ui="capability-stage-preview"
            className="lg:col-span-7 bg-[#181817] text-white p-7 sm:p-9 min-h-[420px] flex flex-col justify-between"
          >
            {activeWorkflowStage === 0 && (
              <div>
                <div className="flex items-center justify-between pb-4">
                  <span className="text-[15px] font-semibold text-[#a1ffcb]">
                    Tenant Domain & Routing Resolver
                  </span>
                  <span className="px-2.5 py-1 bg-[#0d5c3a] text-white text-[13px] font-medium">
                    SSL Active
                  </span>
                </div>
                <div className="mt-4 space-y-4 tnum">
                  <div className="bg-[#242422] p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[13px] text-[#a3a29d]">Primary Subdomain</div>
                      <div className="text-[16px] font-semibold text-white mt-0.5">
                        acme.platform-domain.com
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-[#a1ffcb] text-[#181817] text-[13px] font-semibold">
                      Verified Primary
                    </span>
                  </div>
                  <div className="bg-[#242422] p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[13px] text-[#a3a29d]">Custom Corporate Hostname</div>
                      <div className="text-[16px] font-semibold text-white mt-0.5">
                        b2b.acmesupplies.in
                      </div>
                      <div className="text-[13px] text-[#a1ffcb] mt-1">
                        TXT _bharatwholesale-verify = bw-verify-acme-99412a
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-[#2e2e2b] text-[#e4e3de] text-[13px]">
                      DNS Verified
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeWorkflowStage === 1 && (
              <div>
                <div className="flex items-center justify-between pb-4">
                  <span className="text-[15px] font-semibold text-[#a1ffcb]">
                    Precedence Engine: Contract Price List vs Public Tier
                  </span>
                  <span className="px-2.5 py-1 bg-[#242422] text-[#a1ffcb] text-[13px] font-medium">
                    Net-30 Credit Eligible
                  </span>
                </div>
                <div className="mt-4 space-y-3 tnum">
                  <div className="bg-[#242422] p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[13px] text-[#a3a29d]">Retailer Account</div>
                      <div className="text-[16px] font-semibold text-white">
                        Srinivasa Electricals & Hardware Syndicate
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] text-[#a3a29d]">Approved Credit Limit</div>
                      <div className="text-[16px] font-semibold text-[#a1ffcb]">₹2,50,000.00</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#242422] p-4">
                      <div className="text-[13px] text-[#a3a29d]">Public 100+ Slab Rate</div>
                      <div className="text-[20px] font-semibold text-white mt-1">₹90.00 / pcs</div>
                    </div>
                    <div className="bg-[#a1ffcb] text-[#181817] p-4">
                      <div className="text-[13px] font-medium">VIP Contract Override</div>
                      <div className="text-[20px] font-semibold mt-1">₹78.00 / pcs</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeWorkflowStage === 2 && (
              <div>
                <div className="flex items-center justify-between pb-4">
                  <span className="text-[15px] font-semibold text-[#a1ffcb]">
                    Multi-Warehouse Stock Lock & GST Tax Invoice
                  </span>
                  <span className="px-2.5 py-1 bg-[#a1ffcb] text-[#181817] text-[13px] font-semibold tnum">
                    ACME-INV-26-27/1001
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 tnum">
                  <div className="bg-[#242422] p-4">
                    <div className="text-[13px] text-[#a3a29d]">IDA Cherlapally Hub</div>
                    <div className="text-[18px] font-semibold text-white mt-1">1,450 On Hand</div>
                    <div className="text-[13px] text-[#a1ffcb] mt-0.5">100 Reserved</div>
                  </div>
                  <div className="bg-[#242422] p-4">
                    <div className="text-[13px] text-[#a3a29d]">Bhiwandi Logistics</div>
                    <div className="text-[18px] font-semibold text-white mt-1">820 On Hand</div>
                    <div className="text-[13px] text-[#a3a29d] mt-0.5">0 Reserved</div>
                  </div>
                  <div className="bg-[#242422] p-4">
                    <div className="text-[13px] text-[#a3a29d]">HSN 853620 Tax</div>
                    <div className="text-[18px] font-semibold text-[#a1ffcb] mt-1">CGST 9% + SGST 9%</div>
                    <div className="text-[13px] text-white mt-0.5">100% ITC Eligible</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-4 bg-[#242422] px-4 py-3 flex items-center justify-between text-[13px] text-[#a3a29d]">
              <span>Strict GlobalScope Tenant Isolation (shop_id enforced on every query)</span>
              <span className="text-[#a1ffcb] font-medium">Idempotency-Key Protected</span>
            </div>
          </div>
        </div>
      </section>

      <section id="launch-wizard" className="py-20 px-5 sm:px-8 bg-[#a1ffcb] text-[#181817]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <h2 className="text-[clamp(2.25rem,4vw,3.6rem)] font-semibold tracking-[-0.03em] leading-[0.95] text-[#181817]">
                Name your store.
                <br />
                Go live now.
              </h2>
              <p className="mt-5 text-[17px] text-[#242422] leading-[1.55]">
                Self-Service Tenant Provisioning creates your dedicated merchant workspace, primary subdomain, default warehouse, and storefront theme in one atomic transaction.
              </p>
            </div>

            <div className="mt-8 space-y-3 bg-[#181817] text-white p-6">
              <div className="text-[15px] font-semibold text-[#a1ffcb]">
                Provisioned automatically on submit:
              </div>
              <ul className="space-y-2 text-[14px] text-[#e4e3de]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#a1ffcb] shrink-0" />
                  <span>Standalone storefront at /store/your-slug & your-slug.platform-domain.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#a1ffcb] shrink-0" />
                  <span>Primary fulfilment warehouse & inventory ledger</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#a1ffcb] shrink-0" />
                  <span>Dynamic Media Library & Classic/Smart UI preset</span>
                </li>
              </ul>
            </div>
          </div>

          <div data-ui="tenant-provision-dialog" className="lg:col-span-7 bg-white text-[#181817] p-6 sm:p-8">
            {launchedShop ? (
              <div className="py-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#181817] text-[#a1ffcb] text-[13px] font-semibold">
                  Storefront Provisioned & Active
                </div>
                <h3 className="mt-4 text-[26px] font-semibold text-[#181817]">
                  {launchedShop.name} is live!
                </h3>
                <p className="mt-2 text-[15px] text-[#52514d] tnum">
                  Canonical Hostname: <strong>{launchedShop.domain}</strong>
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => openMerchantStorefront(launchedShop.slug)}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#181817] text-white font-semibold text-[14px] cursor-pointer"
                  >
                    <span>Open Live Storefront</span>
                    <ExternalLink className="w-4 h-4 text-[#a1ffcb]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/merchant?shop=${launchedShop.slug}`)}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#f3f3f1] text-[#181817] font-semibold text-[14px] cursor-pointer"
                  >
                    <span>Open Merchant Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLaunchStore} className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <div className="text-[18px] font-semibold text-[#181817]">
                    Create Wholesale Storefront Workspace
                  </div>
                  <span className="text-[13px] font-medium text-[#52514d] tnum">
                    Plan: {selectedPlanObj?.name || 'Growth'}
                  </span>
                </div>

                {launchError && (
                  <div className="p-3.5 bg-[#ffedea] text-[#831c1e] text-[14px] font-medium">
                    {launchError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#52514d] mb-1">Owner Full Name *</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Vikramaditya Reddy"
                      className="w-full px-3.5 py-2.5 bg-[#f3f3f1] text-[#181817] text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#52514d] mb-1">Business Email *</label>
                    <input
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="founder@deccanpolymers.in"
                      className="w-full px-3.5 py-2.5 bg-[#f3f3f1] text-[#181817] text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#52514d] mb-1">Phone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="+91 98490 11223"
                      className="w-full px-3.5 py-2.5 bg-[#f3f3f1] text-[#181817] text-[14px] tnum"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#52514d] mb-1">Console Password *</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full px-3.5 py-2.5 bg-[#f3f3f1] text-[#181817] text-[14px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[13px] font-medium text-[#52514d] mb-1">Wholesale Brand / Store Name *</label>
                    <input
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => handleShopNameChange(e.target.value)}
                      placeholder="Deccan Industrial Polymers"
                      className="w-full px-3.5 py-2.5 bg-[#f3f3f1] text-[#181817] text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#52514d] mb-1">Subdomain Slug *</label>
                    <div className="flex items-center bg-[#f3f3f1]">
                      <input
                        type="text"
                        required
                        value={shopSlug}
                        onChange={(e) => setShopSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="deccan"
                        className="w-full px-3.5 py-2.5 bg-transparent text-[#181817] text-[14px] font-semibold"
                      />
                      <span className="pr-3 text-[13px] text-[#666560] whitespace-nowrap">.platform-domain.com</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#52514d] mb-1">Seller GSTIN *</label>
                    <input
                      type="text"
                      required
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 bg-[#f3f3f1] text-[#181817] text-[14px] tnum"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[13px] font-medium text-[#52514d] mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#f3f3f1] text-[#181817] text-[14px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[#52514d] mb-1">State & MOV (₹)</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          maxLength={2}
                          value={stateCode}
                          onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                          className="w-12 px-2 py-2.5 bg-[#f3f3f1] text-[#181817] text-[14px] text-center font-semibold"
                        />
                        <input
                          type="number"
                          value={minOrderValue}
                          onChange={(e) => setMinOrderValue(e.target.value)}
                          className="w-full px-2.5 py-2.5 bg-[#f3f3f1] text-[#181817] text-[14px] tnum"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="sm:col-span-2">
                    <label className="block text-[13px] font-medium text-[#52514d] mb-1">Storefront Hero Headline</label>
                    <input
                      type="text"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#f3f3f1] text-[#181817] text-[14px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[13px] font-medium text-[#52514d] mb-1">Primary</label>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full h-10 bg-[#f3f3f1] cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[#52514d] mb-1">Accent</label>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-full h-10 bg-[#f3f3f1] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={launching}
                  className="w-full py-3.5 px-6 bg-[#181817] hover:bg-[#2c2c29] text-white font-semibold text-[15px] cursor-pointer transition-colors disabled:opacity-50"
                >
                  {launching
                    ? 'Provisioning Isolated Storefront & Database Scope...'
                    : 'Provision & Launch Wholesale Storefront'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-5 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-[clamp(2rem,3.3vw,3rem)] font-semibold tracking-[-0.025em] leading-[1.02] text-[#181817]">
                Transparent SaaS plans.
              </h2>
              <p className="mt-2 text-[16px] text-[#52514d]">
                Select a tier on the left to inspect its live capacity and commercial entitlements.
              </p>
            </div>
            <div data-ui="billing-cycle-switch" className="inline-flex bg-[#f3f3f1] p-1 text-[14px] font-medium">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-[#181817] text-white' : 'text-[#52514d]'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 cursor-pointer ${
                  billingCycle === 'yearly' ? 'bg-[#181817] text-white' : 'text-[#52514d]'
                }`}
              >
                Annual Billing (2 Months Free)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-6 space-y-3">
              {plans.map((plan) => {
                const isSelected = plan.slug === selectedPlanObj?.slug;
                const mPrice = Number(plan.monthly_price ?? plan.price_monthly ?? 2499);
                const yPrice = Number(plan.yearly_price ?? plan.price_yearly ?? 24990);
                const pPrice = billingCycle === 'monthly' ? mPrice : yPrice;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanSlug(plan.slug)}
                    className={`w-full text-left p-6 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#181817] text-white'
                        : 'bg-[#f3f3f1] text-[#52514d] hover:bg-[#e7e6e2] hover:text-[#181817]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`w-3 h-3 ${isSelected ? 'bg-[#a1ffcb]' : 'bg-[#c5c4be]'}`} />
                      <div>
                        <div className="text-[clamp(1.5rem,2.4vw,2.2rem)] font-semibold leading-none">
                          {plan.name}
                        </div>
                        <div className={`text-[14px] mt-1.5 tnum ${isSelected ? 'text-[#c7c6c1]' : 'text-[#666560]'}`}>
                          Up to {(plan.max_products || 500).toLocaleString('en-IN')} SKUs ·{' '}
                          {plan.custom_domain_allowed ? 'Custom Domain SSL' : 'Subdomain Included'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right tnum">
                      <div className="text-[20px] font-semibold">{formatINR(pPrice)}</div>
                      <div className="text-[13px] opacity-75">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div data-ui="plan-stage-readout" className="lg:col-span-6 bg-[#f3f3f1] p-8 sm:p-10 tnum">
              <div className="text-[14px] font-semibold text-[#0d5c3a]">Selected Tier Specification</div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-[clamp(2.75rem,5vw,4.5rem)] font-semibold leading-none text-[#181817]">
                  {formatINR(selectedPlanDisplayPrice)}
                </span>
                <span className="text-[17px] text-[#52514d]">
                  per {billingCycle === 'monthly' ? 'month' : 'year'} + 18% GST
                </span>
              </div>

              <p className="mt-5 text-[16px] text-[#454440] leading-[1.55]">
                Includes full tenant database isolation, unlimited quantity-break price tiers, customer-group contract price lists, and automated GST tax invoicing for up to{' '}
                <strong>{(selectedPlanObj?.max_products || 5000).toLocaleString('en-IN')} wholesale SKUs</strong>.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 bg-white p-4">
                <div>
                  <div className="text-[13px] text-[#666560]">Catalogue Capacity</div>
                  <div className="text-[17px] font-semibold text-[#181817] mt-0.5">
                    {(selectedPlanObj?.max_products || 5000).toLocaleString('en-IN')} SKUs
                  </div>
                </div>
                <div>
                  <div className="text-[13px] text-[#666560]">Custom Corporate Domain</div>
                  <div className="text-[17px] font-semibold text-[#181817] mt-0.5">
                    {selectedPlanObj?.custom_domain_allowed ? 'Included + Auto SSL' : 'Subdomain Only'}
                  </div>
                </div>
              </div>

              <a
                href="#launch-wizard"
                className="mt-7 w-full inline-flex items-center justify-center gap-2 py-4 px-6 bg-[#181817] hover:bg-[#2c2c29] text-white font-semibold text-[15px] transition-colors"
              >
                <span>Provision with {selectedPlanObj?.name}</span>
                <ArrowRight className="w-4 h-4 text-[#a1ffcb]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 px-5 sm:px-8 bg-[#f3f3f1]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <h2 className="text-[clamp(2rem,3.2vw,3rem)] font-semibold tracking-[-0.025em] leading-[1.02] text-[#181817]">
              Common questions.
            </h2>
            <p className="mt-3 text-[16px] text-[#52514d]">
              Architecture, multi-tenancy, GST compliance, and custom domain routing.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-2.5">
            {[
              {
                q: 'How are merchant storefronts isolated from the SaaS platform and other merchants?',
                a: 'Every tenant table carries a mandatory shop_id foreign key enforced by an Eloquent GlobalScope and ResolveTenantMiddleware. A merchant storefront at /store/:slug or custom hostname never exposes SaaS navigation or another merchant’s products, customers, or invoices.',
              },
              {
                q: 'How does wholesale pricing precedence work between contract lists and quantity slabs?',
                a: 'When an approved retailer signs in, WholesalePricingService first checks if their customer group has an active Contract Price List override for that SKU. If none exists, it evaluates the public quantity-break slab tiers (e.g., 10 to 49, 50 to 199, 200+) and falls back to base_price.',
              },
              {
                q: 'How are Intra-State (CGST + SGST) and Inter-State (IGST) taxes calculated?',
                a: 'At checkout and quote calculation, the engine compares the merchant’s registered seller state_code against the buyer’s shipping state_code. Same-state supplies split the SKU’s GST rate equally into CGST and SGST; cross-state supplies levy full IGST.',
              },
              {
                q: 'Can merchants upload their own product photos, technical spec blueprints, and hero banners?',
                a: 'Yes. Every merchant console includes a full Media Library and multi-image Product Gallery uploader stored in file_assets and product_images, plus selectable Classic & Smart storefront UI presets.',
              },
            ].map((item, idx) => (
              <details
                key={idx}
                name="platform-faq"
                open={idx === 0}
                className="group bg-white open:bg-[#a1ffcb] text-[#181817] transition-colors"
              >
                <summary className="list-none cursor-pointer px-6 py-5 flex items-center justify-between gap-4 text-[18px] font-semibold">
                  <span>{item.q}</span>
                  <Plus className="w-5 h-5 shrink-0 transition-transform group-open:rotate-45" />
                </summary>
                <div className="px-6 pb-6 text-[16px] text-[#242422] leading-[1.55] max-w-[62ch]">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-white p-3 sm:p-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-2.5">
          <div className="md:col-span-5 bg-[#f3f3f1] p-6 flex flex-col justify-between min-h-[180px]">
            <p className="text-[19px] font-semibold text-[#181817] leading-snug max-w-[32ch]">
              Multi-tenant B2B wholesale commerce, tiered slab pricing, and GST invoicing infrastructure.
            </p>
            <div className="text-[13px] text-[#666560] mt-6">
              © 2026 BharatWholesale Cloud SaaS. All rights reserved.
            </div>
          </div>

          <div className="md:col-span-4 bg-[#f3f3f1] p-6 flex flex-col justify-between min-h-[180px]">
            <div className="text-[14px] font-semibold text-[#181817]">Platform Portals</div>
            <div className="space-y-2 text-[15px] mt-3">
              <div>
                <button
                  type="button"
                  onClick={() => openMerchantStorefront('acme')}
                  className="text-[#181817] hover:underline cursor-pointer font-medium"
                >
                  Acme Industrial Storefront (acme.platform-domain.com)
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => openMerchantStorefront('freshfoods')}
                  className="text-[#181817] hover:underline cursor-pointer font-medium"
                >
                  FreshFoods Agro Storefront (freshfoods.platform-domain.com)
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => navigate('/merchant')}
                  className="text-[#52514d] hover:text-[#181817] cursor-pointer"
                >
                  Merchant Back-Office Console (/merchant)
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="text-[#52514d] hover:text-[#181817] cursor-pointer"
                >
                  SaaS Super-Admin Governance (/admin)
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 bg-[#181817] text-white p-6 flex flex-col justify-between min-h-[180px]">
            <div>
              <div className="text-[13px] text-[#a1ffcb] font-medium">Enterprise Desk</div>
              <div className="text-[18px] font-semibold mt-1">
                {platformSettings.support_email || 'enterprise@platform-domain.com'}
              </div>
              <div className="text-[14px] text-[#c7c6c1] mt-1 tnum">
                {platformSettings.support_phone || '+91 40 6600 9000'}
              </div>
            </div>
            <a
              href="#launch-wizard"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-[#a1ffcb] text-[#181817] font-semibold text-[14px] mt-6"
            >
              <span>Launch Store</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
