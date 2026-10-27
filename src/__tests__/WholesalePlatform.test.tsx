import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { formatINR, getActiveShopSlug, setActiveShopSlug } from '../lib/api';
import { PlatformBusinessPage } from '../pages/platform/PlatformBusinessPage';
import { StorefrontPortal } from '../pages/storefront/StorefrontPortal';
import { MerchantPortal } from '../pages/merchant/MerchantPortal';

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');
  return {
    ...actual,
    api: {
      get: vi.fn((url: string) => {
        if (url === '/directory/shops') {
          return Promise.resolve({
            data: {
              shops: [
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
                },
              ],
              plans: [
                {
                  id: 1,
                  name: 'Starter Wholesale',
                  slug: 'starter',
                  price_monthly: 1999,
                  price_yearly: 19990,
                  max_products: 250,
                  max_staff: 3,
                  custom_domain_allowed: false,
                  b2b_Tier_pricing_allowed: true,
                },
              ],
            },
          });
        }
        if (url === '/storefront/config') {
          return Promise.resolve({
            data: {
              shop: {
                id: 1,
                name: 'Acme Industrial & Electrical Supplies',
                slug: 'acme',
                legal_name: 'Acme Industrial Supplies Pvt. Ltd.',
                gstin: '36AABCA1234F1Z5',
                city: 'Hyderabad',
                state_code: 'TG',
                currency: 'INR',
                min_order_value: 5000,
                primary_color: '#0f172a',
                accent_color: '#2563eb',
                hero_title: 'Industrial Switchgear at Factory-Direct Bulk Rates',
                hero_subtitle: 'ISO-9001 certified electrical distributor',
                canonical_domain: 'acme.platform-domain.com',
              },
              categories: [
                { id: 10, shop_id: 1, name: 'Industrial Switchgear & MCBs', slug: 'industrial-switchgear', sort_order: 1, is_active: true },
              ],
            },
          });
        }
        if (url === '/storefront/products') {
          return Promise.resolve({
            data: {
              data: [
                {
                  id: 101,
                  shop_id: 1,
                  name: 'Acme ProGuard 32A SPN C-Curve MCB (10kA)',
                  slug: 'acme-proguard-32a-spn-mcb',
                  sku: 'ACME-MCB-32A-SPN',
                  hsn_code: '853620',
                  unit: 'pcs',
                  pack_size: 10,
                  base_price: 100,
                  min_order_qty: 10,
                  order_qty_step: 10,
                  price_tiers: [
                    { min_qty: 1, max_qty: 49, unit_price: 100 },
                    { min_qty: 50, max_qty: 199, unit_price: 90 },
                    { min_qty: 200, max_qty: null, unit_price: 80 },
                  ],
                },
              ],
            },
          });
        }
        if (url === '/storefront/cart') {
          return Promise.resolve({
            data: {
              cart_id: 1,
              summary: {
                lines: [],
                currency: 'INR',
                subtotal: 0,
                discount_total: 0,
                tax_total: 0,
                cgst_total: 0,
                sgst_total: 0,
                igst_total: 0,
                shipping_total: 0,
                grand_total: 0,
                min_order_value: 5000,
                meets_min_order_value: false,
                is_inter_state: false,
                supply_state_code: 'TG',
              },
            },
          });
        }
        return Promise.resolve({ data: {} });
      }),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe('Wholesale SaaS Frontend Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('formats Indian Rupee currency accurately for B2B wholesale totals', () => {
    expect(formatINR(9000)).toContain('9,000.00');
  });

  it('persists and resolves active tenant shop slug', () => {
    setActiveShopSlug('freshfoods');
    expect(getActiveShopSlug()).toBe('freshfoods');
  });

  it('renders Application Business Page (SaaS Home) with live merchant directory & store launch wizard', async () => {
    const qc = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <PlatformBusinessPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await vi.waitFor(() => {
      expect(container.textContent).toContain('BharatWholesale Cloud');
      expect(container.textContent).toContain('Acme Industrial & Electrical Supplies');
    });

    expect(container.textContent).toContain('Launch Your Own Branded B2B Wholesale Business Website in 60 Seconds');
    expect(container.textContent).toContain('Self-Service Tenant Provisioning');
  });

  it('renders Merchant Business Page with merchant branding, GSTIN, products, and quantity break tiers', async () => {
    const qc = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <StorefrontPortal />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await vi.waitFor(() => {
      expect(container.textContent).toContain('Acme Industrial & Electrical Supplies');
    });

    expect(container.textContent).toContain('Industrial Switchgear at Factory-Direct Bulk Rates');
    expect(container.textContent).toContain('Acme ProGuard 32A SPN C-Curve MCB');

    // Strictly verify ZERO main SaaS application links or SaaS branding on the Merchant Business Page
    expect(container.textContent).not.toContain('BharatWholesale Cloud');
    expect(container.textContent).not.toContain('SaaS Super-Admin');
    expect(container.querySelector('a[href="/platform"]')).toBeNull();
    expect(container.querySelector('a[href="/merchant"]')).toBeNull();
    expect(container.querySelector('a[href="/admin"]')).toBeNull();
  });

  it('protects merchant dashboard behind authentication when no token is present', () => {
    const qc = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <MerchantPortal />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(container.textContent).toContain('Merchant Back-Office Console');
  });
});
