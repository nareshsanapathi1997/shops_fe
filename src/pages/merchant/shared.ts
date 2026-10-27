export const IS_DEV = import.meta.env.DEV;
/** Consignments above this value need an e-way bill before dispatch (GST rule 138). */
export const EWAY_BILL_THRESHOLD = 50000;

export function buildSettingsForm(s: any) {
  const bank = s.bank_account_details_json || {};
  return {
    name: s.name || '',
    legal_name: s.legal_name || '',
    gstin: s.gstin || '',
    pan: s.pan || '',
    hero_title: s.hero_title || '',
    hero_subtitle: s.hero_subtitle || '',
    about_html: s.about_html || '',
    primary_color: s.primary_color || '#0f172a',
    accent_color: s.accent_color || '#2563eb',
    min_order_value: Number(s.min_order_value || 0),
    support_email: s.support_email || '',
    support_phone: s.support_phone || '',
    whatsapp_number: s.whatsapp_number || '',
    address_line1: s.address_line1 || '',
    city: s.city || '',
    state_code: s.state_code || 'TG',
    postal_code: s.postal_code || '',
    shipping_policy: s.shipping_policy || '',
    return_policy: s.return_policy || '',
    terms_policy: s.terms_policy || '',
    privacy_policy: s.privacy_policy || '',
    // Never fall back to placeholder bank details: they would be printed on GST invoices.
    bank_name: bank.bank_name || '',
    account_name: bank.account_name || s.legal_name || s.name || '',
    account_number: bank.account_number || '',
    ifsc: bank.ifsc || '',
    announcement_text: s.merchant_settings?.announcement_bar?.text || '',
    announcement_enabled: s.merchant_settings?.announcement_bar?.enabled ?? true,
    dispatch_sla_hours: s.merchant_settings?.dispatch_sla_hours || 24,
    logo_url: s.logo_url || '',
    banner_url: s.banner_url || '',
    about_image_url: s.merchant_settings?.about_image_url || '',
    theme_preset: s.merchant_settings?.theme_preset || 'classic_smart',
  };
}

export type MerchantTab =
  | 'overview'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'pricing'
  | 'customers'
  | 'rfqs'
  | 'orders'
  | 'invoices'
  | 'shipping'
  | 'domains'
  | 'staff'
  | 'subscription'
  | 'notifications'
  | 'settings'
  | 'reports'
  | 'audit-logs'
  | 'new-shop';

/** URL segment for each console section (/merchant/<segment>). */
const SECTION_SEGMENTS: Record<MerchantTab, string> = {
  overview: 'dashboard',
  settings: 'settings',
  products: 'products',
  categories: 'categories',
  inventory: 'inventory',
  pricing: 'pricing',
  customers: 'customers',
  rfqs: 'rfqs',
  orders: 'orders',
  invoices: 'invoices',
  shipping: 'shipping',
  domains: 'domains',
  staff: 'staff',
  subscription: 'subscription',
  notifications: 'notifications',
  reports: 'reports',
  'audit-logs': 'audit-logs',
  'new-shop': 'new-shop',
};

export function merchantPathForTab(tab: MerchantTab): string {
  return `/merchant/${SECTION_SEGMENTS[tab]}`;
}

/** Resolve the active section from the URL; `null` means the segment is not a known section. */
export function merchantTabFromPath(pathname: string): MerchantTab | null {
  const segment = pathname.replace(/^\/merchant\/?/, '').split('/')[0];
  if (!segment) return 'overview';
  const match = (Object.keys(SECTION_SEGMENTS) as MerchantTab[]).find((t) => SECTION_SEGMENTS[t] === segment);
  return match ?? null;
}
