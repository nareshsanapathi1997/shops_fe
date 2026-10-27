export interface DomainRecord {
  id: number;
  shop_id: number;
  hostname: string;
  type: 'subdomain' | 'custom';
  is_primary: boolean;
  verification_token: string;
  expected_txt_record?: string | null;
  expected_cname_target?: string | null;
  verification_status: 'pending_verification' | 'verified' | 'failed';
  ssl_status: 'pending' | 'provisioning' | 'active' | 'failed';
  failure_reason?: string | null;
  verified_at?: string | null;
}

export interface WarehouseRecord {
  id: number;
  shop_id: number;
  name: string;
  code: string;
  city?: string | null;
  state_code?: string | null;
  is_default?: boolean;
  is_primary?: boolean;
  is_active?: boolean;
}

export interface PlanRecord {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price_monthly?: number;
  price_yearly?: number;
  monthly_price?: number;
  yearly_price?: number;
  currency?: string;
  max_products: number;
  max_staff_users?: number;
  max_staff?: number;
  custom_domain_allowed: boolean;
  b2b_price_lists_allowed?: boolean;
  b2b_tier_pricing_allowed?: boolean;
  credit_limit_allowed?: boolean;
  features_json?: string[];
  audit_log_retention_days?: number;
}

export interface DirectoryShop {
  id: number;
  name: string;
  slug: string;
  legal_name?: string | null;
  business_type?: string | null;
  gstin?: string | null;
  city: string;
  state_code: string;
  logo_url?: string | null;
  banner_url?: string | null;
  primary_color?: string | null;
  accent_color?: string | null;
  merchant_settings?: any;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  min_order_value?: number | null;
  support_email?: string | null;
  support_phone?: string | null;
  whatsapp_number?: string | null;
  products_count?: number;
  canonical_domain?: string | null;
  domains?: DomainRecord[];
}

export type Plan = PlanRecord;

export interface ShopConfig {
  id: number;
  name: string;
  slug: string;
  legal_name?: string;
  business_type?: string;
  gstin?: string;
  pan?: string;
  support_email?: string;
  support_phone?: string;
  whatsapp_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_code: string;
  postal_code?: string;
  currency?: string;
  status?: string;
  min_order_value: number;
  require_customer_approval: boolean;
  hide_prices_for_guests: boolean;
  tax_inclusive_pricing: boolean;
  cod_enabled: boolean;
  bank_transfer_enabled: boolean;
  online_payment_enabled: boolean;
  bank_details?: {
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    ifsc?: string;
  } | null;
  bank_account_details_json?: {
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    ifsc?: string;
  } | null;
  logo_url?: string | null;
  banner_url?: string | null;
  primary_color: string;
  accent_color: string;
  hero_title?: string;
  hero_subtitle?: string;
  about_html?: string;
  shipping_policy?: string;
  return_policy?: string;
  privacy_policy?: string;
  terms_policy?: string;
  seo_title?: string;
  seo_description?: string;
  canonical_domain?: string;
  domains?: DomainRecord[];
  warehouses?: WarehouseRecord[];
  merchant_settings?: {
    theme_preset?: 'classic_smart' | 'classic' | 'smart' | string;
    about_image_url?: string | null;
    hero_slides?: {
      id: string;
      eyebrow?: string;
      title: string;
      subtitle?: string;
      cta_label?: string;
      badge?: string;
      image_url?: string;
    }[];
    announcement_bar?: any;
    dispatch_sla_hours?: number;
    hero_badges?: string[];
    dealer_testimonials?: { business_name: string; city: string; quote: string; rating?: number }[];
    notification_preferences?: {
      email_on_new_order?: boolean;
      email_on_low_stock?: boolean;
      email_on_buyer_signup?: boolean;
      email_on_rfq?: boolean;
      whatsapp_alerts_enabled?: boolean;
      webhook_url?: string;
    };
  };
}

export interface Category {
  id: number;
  shop_id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order: number;
  is_active: boolean;
  products_count?: number;
}

export interface ProductPriceTier {
  id?: number;
  min_qty: number;
  max_qty?: number | null;
  unit_price: number;
  customer_group_id?: number | null;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  sku: string;
  base_price?: number | null;
  min_order_qty?: number | null;
  pack_size: number;
  unit: string;
  is_active: boolean;
}

export interface InventoryBalance {
  id: number;
  product_id: number;
  variant_id?: number | null;
  on_hand_qty: number;
  reserved_qty: number;
  low_stock_threshold: number;
  product?: Product;
  variant?: ProductVariant | null;
}

export interface Product {
  id: number;
  shop_id: number;
  category_id?: number | null;
  name: string;
  slug: string;
  sku: string;
  barcode?: string | null;
  hsn_code?: string | null;
  brand?: string | null;
  unit: string;
  pack_size: number;
  short_description?: string | null;
  description?: string | null;
  base_price: number;
  mrp_price?: number | null;
  mrp?: number | null;
  tax_category?: { id: number; name: string; hsn_code: string; gst_rate: number } | null;
  min_order_qty: number;
  order_qty_step: number;
  max_order_qty?: number | null;
  tax_rate_percent?: number | null;
  allow_backorder: boolean;
  is_featured: boolean;
  status: 'draft' | 'active' | 'archived';
  primary_image_url?: string | null;
  attributes_json?: Record<string, string> | null;
  category?: Category | null;
  variants?: ProductVariant[];
  images?: { id: number; url: string; alt_text?: string; is_primary?: boolean; sort_order?: number }[];
  price_tiers?: ProductPriceTier[];
  inventory_balances?: InventoryBalance[];
}

export interface LinePriceQuote {
  item_id?: number;
  product_id: number;
  variant_id?: number | null;
  product_name?: string;
  name?: string;
  sku: string;
  hsn_code: string;
  unit: string;
  pack_size: number;
  quantity: number;
  base_unit_price: number;
  unit_price: number;
  pricing_rule?: string;
  rule_applied?: string;
  line_subtotal: number;
  discount_amount: number;
  line_discount?: number;
  taxable_amount: number;
  gst_rate: number;
  is_inter_state: boolean;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  tax_amount: number;
  tax?: {
    rate_percent: number;
    total_tax: number;
    is_inter_state?: boolean;
  };
  line_total: number;
  /** Set when the line can no longer be priced (archived product, MOQ changed, ...). */
  error?: string | null;
}

export interface CartSummary {
  lines: LinePriceQuote[];
  currency?: string;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  cgst_total: number;
  sgst_total: number;
  igst_total: number;
  shipping_total: number;
  grand_total: number;
  min_order_value: number;
  shortfall_amount?: number;
  meets_min_order_value: boolean;
  is_inter_state: boolean;
  supply_state_code: string;
  /** True when at least one cart line has an `error`; checkout must be blocked. */
  has_errors?: boolean;
}

export interface CustomerProfile {
  id: number;
  shop_id: number;
  business_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  gstin?: string | null;
  city?: string | null;
  state_code: string;
  approval_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  credit_limit: number;
  credit_used?: number;
  credit_balance?: number;
  group?: { id: number; name: string; discount_percentage?: number; default_discount_percent?: number } | null;
  addresses?: CustomerAddressRecord[];
  credit_ledger?: CreditLedgerRecord[];
  rfqs?: WholesaleRfqRecord[];
}

export interface CreditNoteRecord {
  id: number;
  credit_note_number: string;
  reason?: string | null;
  taxable_total: number;
  cgst_total: number;
  sgst_total: number;
  igst_total: number;
  grand_total: number;
  issued_at: string;
  status: string;
}

export interface OrderRecord {
  id: number;
  shop_id: number;
  customer_id: number;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  cgst_total: number;
  sgst_total: number;
  igst_total: number;
  shipping_total: number;
  grand_total: number;
  is_inter_state: boolean;
  supply_state_code: string;
  purchase_order_number?: string | null;
  customer_notes?: string | null;
  placed_at: string;
  eway_bill_number?: string | null;
  credit_notes?: CreditNoteRecord[];
  customer?: CustomerProfile;
  invoice?: {
    id: number;
    invoice_number: string;
    financial_year?: string;
    status?: string;
    grand_total?: number;
    issued_at?: string;
  } | null;
  invoices?: {
    id: number;
    invoice_number: string;
    financial_year: string;
    status: string;
    grand_total: number;
    issued_at: string;
  }[];
  payments?: {
    id: number;
    provider: string;
    method: string;
    status: string;
    amount: number;
    provider_order_id?: string;
  }[];
}

export interface ShippingMethod {
  id: number;
  shop_id?: number;
  name: string;
  code: string;
  flat_rate: number;
  free_shipping_threshold?: number | null;
  estimated_days?: string | null;
}

export type Shop = ShopConfig;

export interface Customer extends CustomerProfile {
  name?: string;
  company_name?: string;
}

export type WholesaleOrder = OrderRecord;

export interface WholesaleRfqRecord {
  id: number;
  shop_id: number;
  customer_id?: number | null;
  product_id?: number | null;
  rfq_number: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  gstin?: string | null;
  city?: string | null;
  state_code?: string | null;
  inquiry_type: string;
  product_requirement: string;
  target_quantity: number;
  target_unit_price?: number | null;
  quoted_unit_price?: number | null;
  status: 'new' | 'quoted' | 'accepted' | 'rejected';
  notes?: string | null;
  merchant_response?: string | null;
  responded_at?: string | null;
  created_at?: string;
  product?: Product | null;
}

export interface CreditLedgerRecord {
  id: number;
  shop_id: number;
  customer_id: number;
  order_id?: number | null;
  entry_type: string;
  amount: number;
  balance_after: number;
  notes?: string | null;
  created_at?: string;
}

export interface CustomerAddressRecord {
  id: number;
  shop_id: number;
  customer_id: number;
  label: string;
  type: string;
  recipient_name: string;
  company_name?: string | null;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state_code: string;
  postal_code: string;
  gstin?: string | null;
  is_default: boolean;
}

export interface FileAssetRecord {
  id: number;
  shop_id: number;
  disk: string;
  path: string;
  url: string;
  original_name: string;
  alt_text?: string | null;
  mime_type: string;
  size_bytes: number;
  category?: string;
  created_at?: string;
}
