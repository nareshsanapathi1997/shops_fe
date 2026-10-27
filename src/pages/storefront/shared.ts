import { getActiveShopSlug } from '../../lib/api';
import type { Category, Product, Shop } from '../../types/api';

export const getCustomerToken = () => localStorage.getItem(`ws_customer_token_${getActiveShopSlug()}`);
export const setCustomerToken = (token: string | null) => {
  const slug = getActiveShopSlug();
  if (token) localStorage.setItem(`ws_customer_token_${slug}`, token);
  else localStorage.removeItem(`ws_customer_token_${slug}`);
};

export type StorefrontTab =
  | 'home'
  | 'catalog'
  | 'product'
  | 'bulk-order'
  | 'about'
  | 'contact'
  | 'policies'
  | 'cart'
  | 'checkout'
  | 'account'
  | 'orders';

export const INDIAN_STATES = [
  { code: 'TG', name: 'Telangana (TG)' },
  { code: 'MH', name: 'Maharashtra (MH)' },
  { code: 'KA', name: 'Karnataka (KA)' },
  { code: 'TN', name: 'Tamil Nadu (TN)' },
  { code: 'DL', name: 'Delhi NCR (DL)' },
  { code: 'GJ', name: 'Gujarat (GJ)' },
  { code: 'AP', name: 'Andhra Pradesh (AP)' },
  { code: 'UP', name: 'Uttar Pradesh (UP)' },
  { code: 'WB', name: 'West Bengal (WB)' },
  { code: 'RJ', name: 'Rajasthan (RJ)' },
];


export const DEMO_SEED_SLUGS = ['acme', 'freshfoods'];

export function getInitialStorefrontSeed(slug: string): { shop: Shop | null; categories: Category[]; products: Product[] } {
  // Placeholder catalogue only for the seeded demo tenants in development builds. Any other
  // tenant (or any production build) starts empty and waits for the real API response.
  if (!import.meta.env.DEV || !DEMO_SEED_SLUGS.includes(slug)) {
    return { shop: null, categories: [], products: [] };
  }
  if (slug === "freshfoods") {
    return {
      shop: {
        id: 2,
        name: "FreshFoods Agro & HoReCa Wholesale",
        slug: "freshfoods",
        legal_name: "FreshFoods Agro Commodities LLP",
        business_type: "distributor",
        gstin: "27AABCF9876D1Z8",
        pan: "AABCF9876D",
        support_email: "desk@freshfoods.in",
        support_phone: "+91 22 4455 6677",
        whatsapp_number: "+91 98201 44556",
        address_line1: "Sector 19, APMC Wholesale Market, Vashi",
        city: "Navi Mumbai",
        state_code: "MH",
        postal_code: "400703",
        currency: "INR",
        min_order_value: 3000,
        require_customer_approval: false,
        hide_prices_for_guests: false,
        tax_inclusive_pricing: false,
        cod_enabled: true,
        bank_transfer_enabled: true,
        online_payment_enabled: true,
        logo_url: "/uploads/demo/freshfoods-logo.svg",
        banner_url: "/uploads/demo/freshfoods-hero-banner.svg",
        primary_color: "#065f46",
        accent_color: "#10b981",
        merchant_settings: {
          theme_preset: "classic_smart",
          about_image_url: "/uploads/demo/freshfoods-warehouse.svg",
          hero_slides: [
            {
              id: "ff-slide-1",
              eyebrow: "APMC Vashi Commodity Desk",
              title: "Farm-Grade Staple Grains, Cold-Pressed Oils & Spices for Supermarkets & HoReCa",
              subtitle: "Direct APMC Vashi bulk sourcing with FSSAI batch traceability, tiered sack rates, and automated GST e-invoicing.",
              cta_label: "Explore HoReCa Catalogue",
              badge: "Metric Ton Pallet Slabs Available",
              image_url: "/uploads/demo/freshfoods-hero-banner.svg",
            },
            {
              id: "ff-slide-2",
              eyebrow: "Institutional Kitchen Contracts",
              title: "Monthly Rate Contracts for Hotel Chains, Cloud Kitchens & Supermarkets",
              subtitle: "Guaranteed single-origin 1121 Steam Basmati and 15L commercial oil tins with moisture-tested batch certificates.",
              cta_label: "Request Custom Commodity RFQ",
              badge: "Next-Day Cold-Chain Dispatch",
              image_url: "/uploads/demo/freshfoods-warehouse.svg",
            },
          ],
        },
        hero_title: "Farm-Grade Staple Grains, Cold-Pressed Oils & Spices for Supermarkets & HoReCa",
        hero_subtitle: "Direct APMC Vashi bulk sourcing with FSSAI batch traceability, tiered sack rates, and automated GST e-invoicing.",
      },
      categories: [
        { id: 4, shop_id: 2, name: "Staple Grains & Aged Basmati Rice", slug: "staple-grains", description: "Export-grade 25kg & 50kg PP woven sacks", image_url: "/uploads/demo/cat-grains.svg", sort_order: 1, is_active: true, products_count: 8 },
        { id: 5, shop_id: 2, name: "Cold-Pressed Edible Oils & Ghee", slug: "edible-oils", description: "15L commercial HoReCa tins & pouches", image_url: "/uploads/demo/cat-oils.svg", sort_order: 2, is_active: true, products_count: 6 },
      ],
      products: [
        {
          id: 201,
          shop_id: 2,
          name: "Royal Harvest 1121 Steam Basmati Rice (25kg Export Sack)",
          slug: "royal-harvest-1121-basmati-25kg",
          sku: "FF-RICE-1121-25KG",
          primary_image_url: "/uploads/demo/ff-basmati-primary.svg",
          images: [
            { id: 2011, url: "/uploads/demo/ff-basmati-primary.svg", alt_text: "25kg Basmati Sack · Studio View", is_primary: true },
            { id: 2012, url: "/uploads/demo/ff-basmati-spec.svg", alt_text: "25kg Basmati · Grain Lab Spec Sheet", is_primary: false },
            { id: 2013, url: "/uploads/demo/ff-basmati-carton.svg", alt_text: "25kg Basmati · Pallet Load View", is_primary: false },
          ],
          brand: "Royal Harvest",
          hsn_code: "100630",
          unit: "bags",
          pack_size: 1,
          short_description: "Extra-long grain aged 24 months 1121 steam basmati rice in moisture-proof 25kg BOPP sack.",
          base_price: 2250,
          mrp: 2750,
          min_order_qty: 2,
          order_qty_step: 2,
          allow_backorder: false,
          is_featured: true,
          status: "active",
          tax_category: { id: 2, name: "GST 5%", hsn_code: "1006", gst_rate: 5 },
          price_tiers: [
            { id: 21, min_qty: 2, max_qty: 9, unit_price: 2250 },
            { id: 22, min_qty: 10, max_qty: 39, unit_price: 2120 },
            { id: 23, min_qty: 40, max_qty: null, unit_price: 1980 },
          ],
        },
        {
          id: 202,
          shop_id: 2,
          name: "PureGold Kachi Ghani Mustard Oil (15L Commercial Tin)",
          slug: "puregold-mustard-oil-15l-tin",
          sku: "FF-OIL-MUST-15L",
          primary_image_url: "/uploads/demo/ff-oil-primary.svg",
          images: [
            { id: 2021, url: "/uploads/demo/ff-oil-primary.svg", alt_text: "15L Commercial Oil Tin · Studio View", is_primary: true },
            { id: 2022, url: "/uploads/demo/ff-oil-spec.svg", alt_text: "15L Commercial Oil Tin · FSSAI Spec Sheet", is_primary: false },
            { id: 2023, url: "/uploads/demo/ff-oil-carton.svg", alt_text: "15L Commercial Oil Tin · Pallet View", is_primary: false },
          ],
          brand: "PureGold Agro",
          hsn_code: "151491",
          unit: "tins",
          pack_size: 1,
          short_description: "100% cold-pressed Agmark Grade-1 pungent mustard oil in heavy-duty 15-litre tin with spout.",
          base_price: 2100,
          mrp: 2490,
          min_order_qty: 2,
          order_qty_step: 1,
          allow_backorder: false,
          is_featured: true,
          status: "active",
          tax_category: { id: 2, name: "GST 5%", hsn_code: "1514", gst_rate: 5 },
          price_tiers: [
            { id: 24, min_qty: 2, max_qty: 9, unit_price: 2100 },
            { id: 25, min_qty: 10, max_qty: 29, unit_price: 1990 },
            { id: 26, min_qty: 30, max_qty: null, unit_price: 1890 },
          ],
        },
      ],
    };
  }

  return {
    shop: {
      id: 1,
      name: "Acme Industrial & Electrical Supplies",
      slug: "acme",
      legal_name: "Acme Industrial & Electrical Supplies Pvt. Ltd.",
      business_type: "wholesaler",
      gstin: "36AABCA8821K1Z5",
      pan: "AABCA8821K",
      support_email: "sales@acmesupplies.in",
      support_phone: "+91 40 6677 8899",
      whatsapp_number: "+91 98490 66778",
      address_line1: "Plot 42, IDA Jeedimetla Industrial Area",
      city: "Hyderabad",
      state_code: "TG",
      postal_code: "500055",
      currency: "INR",
      min_order_value: 5000,
      require_customer_approval: false,
      hide_prices_for_guests: false,
      tax_inclusive_pricing: false,
      cod_enabled: true,
      bank_transfer_enabled: true,
      online_payment_enabled: true,
      logo_url: "/uploads/demo/acme-logo.svg",
      banner_url: "/uploads/demo/acme-hero-banner.svg",
      primary_color: "#0f172a",
      accent_color: "#2563eb",
      merchant_settings: {
        theme_preset: "classic_smart",
        about_image_url: "/uploads/demo/acme-warehouse.svg",
        hero_slides: [
          {
            id: "acme-slide-1",
            eyebrow: "Factory-Direct Switchgear & Luminaires",
            title: "Industrial Switchgear at Factory-Direct Bulk Rates",
            subtitle: "ISO-9001 certified electrical distributor serving 1,400+ electrical contractors, OEM panel builders & hardware retailers.",
            cta_label: "Explore Full Wholesale Catalogue",
            badge: "Save up to 20% on 200+ Lot Slabs",
            image_url: "/uploads/demo/acme-hero-banner.svg",
          },
          {
            id: "acme-slide-2",
            eyebrow: "Central Cherlapally Fulfillment Hub",
            title: "Annual Rate Contracts (ARC) & Approved Dealer Net-30 Trade Credit",
            subtitle: "Lock in quarterly contract pricing on MCBs, High-Bay LEDs, and FRLS copper coils with serialized GS1 pallet dispatch.",
            cta_label: "Request Custom Lot Quote (RFQ)",
            badge: "24h Same-Day Surface Dispatch",
            image_url: "/uploads/demo/acme-warehouse.svg",
          },
        ],
      },
      hero_title: "Industrial Switchgear at Factory-Direct Bulk Rates",
      hero_subtitle: "ISO-9001 certified electrical distributor serving 1,400+ electrical contractors, OEM panel builders & hardware retailers.",
    },
    categories: [
      { id: 1, shop_id: 1, name: "Industrial Switchgear & MCBs", slug: "industrial-switchgear", description: "IS/IEC 60898-1 10kA C-Curve Breakers & Isolators", image_url: "/uploads/demo/cat-switchgear.svg", sort_order: 1, is_active: true, products_count: 14 },
      { id: 2, shop_id: 1, name: "Armoured Power Cables & Wires", slug: "power-cables", description: "1.1kV XLPE & FR-LSH Copper/Aluminium Drums", image_url: "/uploads/demo/cat-cables.svg", sort_order: 2, is_active: true, products_count: 19 },
      { id: 3, shop_id: 1, name: "Commercial & High-Bay LED Lighting", slug: "led-lighting", description: "IP66 Die-Cast Warehouse & Factory Luminaires", image_url: "/uploads/demo/cat-lighting.svg", sort_order: 3, is_active: true, products_count: 11 },
    ],
    products: [
      {
        id: 101,
        shop_id: 1,
        name: "Acme ProGuard 32A SPN C-Curve MCB (10kA)",
        slug: "acme-proguard-32a-spn-mcb",
        sku: "ACME-MCB-32A-SPN",
        primary_image_url: "/uploads/demo/acme-mcb-primary.svg",
        attributes_json: {
          "Breaking Capacity": "10kA (IS/IEC 60898-1)",
          "Rated Voltage": "240V / 415V AC 50Hz",
          "Tripping Curve": "C-Curve Magnetic-Thermal",
          "Master Carton": "100 Units (10 Boxes x 10 Pcs)",
        },
        images: [
          { id: 1011, url: "/uploads/demo/acme-mcb-primary.svg", alt_text: "Acme ProGuard MCB · Studio Commercial View", is_primary: true },
          { id: 1012, url: "/uploads/demo/acme-mcb-spec.svg", alt_text: "Acme ProGuard MCB · Technical Specification Sheet", is_primary: false },
          { id: 1013, url: "/uploads/demo/acme-mcb-carton.svg", alt_text: "Acme ProGuard MCB · Master Carton Packaging", is_primary: false },
        ],
        brand: "Acme ProGuard",
        hsn_code: "853620",
        unit: "pcs",
        pack_size: 10,
        short_description: "ISI Marked 10kA Din-Rail Miniature Circuit Breaker for industrial distribution boards.",
        base_price: 100,
        mrp: 145,
        min_order_qty: 10,
        order_qty_step: 10,
        allow_backorder: false,
        is_featured: true,
        status: "active",
        category: { id: 1, shop_id: 1, name: "Industrial Switchgear & MCBs", slug: "industrial-switchgear", sort_order: 1, is_active: true },
        tax_category: { id: 1, name: "GST 18%", hsn_code: "8536", gst_rate: 18 },
        price_tiers: [
          { id: 1, min_qty: 1, max_qty: 49, unit_price: 100 },
          { id: 2, min_qty: 50, max_qty: 199, unit_price: 90 },
          { id: 3, min_qty: 200, max_qty: null, unit_price: 80 },
        ],
      },
      {
        id: 102,
        shop_id: 1,
        name: "Acme PolyCab 4-Core 16 sq.mm XLPE Armoured Cable (100m)",
        slug: "acme-4c-16sqmm-xlpe-cable",
        sku: "ACME-CBL-4C16-XLPE",
        primary_image_url: "/uploads/demo/acme-cable-primary.svg",
        attributes_json: {
          "Conductor Material": "99.97% Electrolytic Copper",
          "Insulation Grade": "IS 694:2010 FRLS Flame Retardant",
          "Master Carton": "12 Coils / Shrink-Wrapped Crate",
        },
        images: [
          { id: 1021, url: "/uploads/demo/acme-cable-primary.svg", alt_text: "Acme CopperFlex Coil · Studio View", is_primary: true },
          { id: 1022, url: "/uploads/demo/acme-cable-spec.svg", alt_text: "Acme CopperFlex Coil · Technical Blueprint", is_primary: false },
          { id: 1023, url: "/uploads/demo/acme-cable-carton.svg", alt_text: "Acme CopperFlex Coil · Master Crate View", is_primary: false },
        ],
        brand: "Acme PowerLine",
        hsn_code: "854460",
        unit: "coils",
        pack_size: 1,
        short_description: "Heavy-duty 1.1kV aluminium conductor galvanized steel strip armoured underground power cable.",
        base_price: 4200,
        mrp: 5400,
        min_order_qty: 2,
        order_qty_step: 1,
        allow_backorder: false,
        is_featured: true,
        status: "active",
        category: { id: 2, shop_id: 1, name: "Armoured Power Cables & Wires", slug: "power-cables", sort_order: 2, is_active: true },
        tax_category: { id: 1, name: "GST 18%", hsn_code: "8544", gst_rate: 18 },
        price_tiers: [
          { id: 4, min_qty: 1, max_qty: 4, unit_price: 4200 },
          { id: 5, min_qty: 5, max_qty: 19, unit_price: 3950 },
          { id: 6, min_qty: 20, max_qty: null, unit_price: 3690 },
        ],
      },
      {
        id: 103,
        shop_id: 1,
        name: "Acme LuminaMax 150W IP66 Industrial High-Bay LED Fixture",
        slug: "acme-luminamax-150w-highbay-led",
        sku: "ACME-LED-HB150W",
        primary_image_url: "/uploads/demo/acme-led-primary.svg",
        attributes_json: {
          "Luminous Efficacy": "140 lm/W (5700K Daylight)",
          "Ingress Protection": "IP66 Weatherproof & Dustproof",
          "Surge Protection": "6kV Built-in Industrial Driver",
        },
        images: [
          { id: 1031, url: "/uploads/demo/acme-led-primary.svg", alt_text: "Acme LuminaMax Highbay LED · Studio View", is_primary: true },
          { id: 1032, url: "/uploads/demo/acme-led-spec.svg", alt_text: "Acme LuminaMax Highbay LED · Spec Sheet", is_primary: false },
          { id: 1033, url: "/uploads/demo/acme-led-carton.svg", alt_text: "Acme LuminaMax Highbay LED · Export Carton", is_primary: false },
        ],
        brand: "Acme LuminaMax",
        hsn_code: "940540",
        unit: "pcs",
        pack_size: 4,
        short_description: "150 lm/W die-cast aluminium warehouse high-bay luminaire with 6kV surge protection.",
        base_price: 1850,
        mrp: 2600,
        min_order_qty: 4,
        order_qty_step: 4,
        allow_backorder: false,
        is_featured: true,
        status: "active",
        category: { id: 3, shop_id: 1, name: "Commercial & High-Bay LED Lighting", slug: "led-lighting", sort_order: 3, is_active: true },
        tax_category: { id: 1, name: "GST 18%", hsn_code: "9405", gst_rate: 18 },
        price_tiers: [
          { id: 7, min_qty: 1, max_qty: 19, unit_price: 1850 },
          { id: 8, min_qty: 20, max_qty: 49, unit_price: 1680 },
          { id: 9, min_qty: 50, max_qty: null, unit_price: 1520 },
        ],
      },
    ],
  };
}

export interface StorefrontPortalProps {
  forcedSlug?: string;
}
