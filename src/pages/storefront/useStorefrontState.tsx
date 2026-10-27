import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AUTH_EXPIRED_EVENT, api, formatINR, extractApiError, generateIdempotencyKey, getActiveShopSlug, getCartSessionToken, resolveMediaUrl, setActiveShopSlug } from '../../lib/api';
import { payWithRazorpay } from '../../lib/razorpay';
import type { RazorpayCheckoutParams } from '../../lib/razorpay';
import { ProductVisual } from '../../components/ProductVisual';
import type { CartSummary, Category, Customer, LinePriceQuote, Product, ShippingMethod, Shop, WholesaleOrder } from '../../types/api';
import { getCustomerToken, setCustomerToken, type StorefrontTab, getInitialStorefrontSeed } from './shared';

/**
 * All storefront state, data loading and handlers for one tenant. The portal shell and every
 * tab section read from this through StorefrontContext.
 */
export function useStorefrontState(forcedSlug?: string) {
  const { shopSlug } = useParams<{ shopSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const resolvedSlug = forcedSlug || shopSlug || getActiveShopSlug() || 'acme';
  // Derived from the route; App remounts this component per slug so tenant state never leaks.
  const activeSlug = resolvedSlug;
  const basePath = forcedSlug ? '' : `/store/${activeSlug}`;

  const initialSeed = useMemo(() => getInitialStorefrontSeed(resolvedSlug), [resolvedSlug]);
  const [storeLoadError, setStoreLoadError] = useState<string | null>(null);
  const loadSeqRef = useRef(0);
  const checkoutKeyRef = useRef<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  // Online order whose payment window was closed or declined; offers a retry.
  const [pendingPayment, setPendingPayment] = useState<{ orderId: number; orderNumber: string; message: string } | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);
  const [shop, setShop] = useState<Shop | null>(initialSeed.shop);
  const [categories, setCategories] = useState<Category[]>(initialSeed.categories);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [products, setProducts] = useState<Product[]>(initialSeed.products);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('featured');
  const [catalogViewMode, setCatalogViewMode] = useState<'grid' | 'table'>('grid');
  const [activeTab, setActiveTab] = useState<StorefrontTab>('home');
  const [activePolicySection, setActivePolicySection] = useState<'shipping' | 'returns' | 'terms' | 'privacy'>('shipping');
  const [designPreset, setDesignPreset] = useState<'classic_smart' | 'classic' | 'smart'>('classic_smart');
  const [activeHeroSlideIdx, setActiveHeroSlideIdx] = useState<number>(0);
  const [activeProductImageIdx, setActiveProductImageIdx] = useState<number>(0);
  const [cardImageIndices, setCardImageIndices] = useState<Record<number, number>>({});

  // Selected product for deep-dive & live tier quote calculator
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quoteQty, setQuoteQty] = useState<number>(10);
  const [quoteStateCode, setQuoteStateCode] = useState<string>('TG');
  const [priceQuote, setPriceQuote] = useState<LinePriceQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string>('');

  // Cart & Checkout state
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [productQuantities, setProductQuantities] = useState<Record<number, number>>({});
  const [bulkQuantities, setBulkQuantities] = useState<Record<number, number>>({});
  const [bulkSearchFilter, setBulkSearchFilter] = useState<string>('');

  // Customer Auth State
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState(import.meta.env.DEV ? 'procurement@metroretailers.in' : '');
  const [loginPassword, setLoginPassword] = useState(import.meta.env.DEV ? 'Retailer@123' : '');
  const [regForm, setRegForm] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    password: '',
    gstin: '',
    pan: '',
    billing_address: '',
    shipping_address: '',
    city: 'Hyderabad',
    state_code: 'TG',
    postal_code: '500032',
  });

  // Contact / B2B RFQ Inquiry State
  const [rfqForm, setRfqForm] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    gstin: '',
    product_name: '',
    target_quantity: 100,
    target_unit_price: '',
    estimated_monthly_volume: '₹1,00,000 – ₹5,00,000',
    message: '',
  });
  const [rfqSubmitted, setRfqSubmitted] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [newAddressForm, setNewAddressForm] = useState({
    label: 'Warehouse Dock',
    recipient_name: '',
    phone: '',
    line1: '',
    city: 'Hyderabad',
    state_code: 'TG',
    postal_code: '500037',
    is_default: true,
  });

  // Checkout Form State
  const [checkoutForm, setCheckoutForm] = useState({
    payment_method: 'online_gateway',
    shipping_method_id: 0,
    destination_state_code: 'TG',
    shipping_address: '',
    billing_address: '',
    purchase_order_number: '',
    notes: '',
  });

  // Orders & Printable Invoice State
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [documentPreview, setDocumentPreview] = useState<{ title: string; html: string } | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: 'success' | 'error', text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, text });
    toastTimerRef.current = setTimeout(() => setToast(null), type === 'error' ? 7000 : 4500);
  };

  useEffect(() => {
    const onExpired = (e: Event) => {
      if ((e as CustomEvent).detail?.surface === 'customer') {
        setCustomer(null);
        setOrders([]);
        setSavedAddresses([]);
      }
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Navigate within the merchant's own website and update URL cleanly
  const goToPage = (tab: StorefrontTab, productSlugOverride?: string) => {
    setActiveTab(tab);
    const subPath =
      tab === 'home'
        ? ''
        : tab === 'product' && (productSlugOverride || selectedProduct?.slug)
        ? `/product/${productSlugOverride || selectedProduct?.slug}`
        : `/${tab}`;
    const targetUrl = `${basePath}${subPath}` || '/';
    if (location.pathname !== targetUrl) {
      navigate(targetUrl);
    }
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Synchronize URL sub-route with activeTab
  useEffect(() => {
    const relative = location.pathname.replace(new RegExp(`^/store/${activeSlug}`), '').replace(/^\/+/, '');
    if (!relative) {
      if (activeTab !== 'product') setActiveTab('home');
      return;
    }
    const [segment, subSegment] = relative.split('/');
    if (segment === 'product' && subSegment) {
      const found = products.find((p) => p.slug === subSegment);
      if (found) {
        setSelectedProduct(found);
        setSelectedVariantId(null);
        setQuoteQty(found.min_order_qty || 1);
      }
      setActiveTab('product');
    } else if (
      ['catalog', 'bulk-order', 'about', 'contact', 'policies', 'cart', 'checkout', 'account', 'orders'].includes(
        segment
      )
    ) {
      setActiveTab(segment as StorefrontTab);
    }
  }, [location.pathname, activeSlug, products]);

  /** The backend reports unpriceable lines per item and a top-level `has_errors` flag. */
  const applyCartResponse = (data: any) => {
    const summary = data?.summary;
    if (!summary) {
      setCartSummary(summary ?? null);
      return;
    }
    const lines: CartSummary['lines'] = summary.lines || [];
    setCartSummary({
      ...summary,
      has_errors: Boolean(data.has_errors ?? summary.has_errors ?? lines.some((l) => l.error)),
    });
  };

  const loadStorefront = async (slugToLoad: string) => {
    // Only the most recent load may write state; older responses (e.g. from a quick
    // category/sort switch) are discarded instead of overwriting newer data.
    const seq = ++loadSeqRef.current;
    const isStale = () => seq !== loadSeqRef.current;
    setLoading(true);
    setActiveShopSlug(slugToLoad);
    getCartSessionToken();

    try {
      const [configRes, prodRes, cartRes] = await Promise.all([
        api.get('/storefront/config', { headers: { 'X-Shop-Slug': slugToLoad } }),
        api.get('/storefront/products', {
          params: {
            category_slug: selectedCategory || undefined,
            search: searchQuery || undefined,
            sort: sortOption,
          },
          headers: { 'X-Shop-Slug': slugToLoad },
        }),
        api.get('/storefront/cart', { headers: { 'X-Shop-Slug': slugToLoad } }),
      ]);
      if (isStale()) return;

      const loadedShop: Shop = configRes.data.shop;
      setStoreLoadError(null);
      setShop(loadedShop);
      if (loadedShop?.merchant_settings?.theme_preset) {
        const tp = loadedShop.merchant_settings.theme_preset as any;
        if (['classic_smart', 'classic', 'smart'].includes(tp)) {
          setDesignPreset(tp);
        }
      }
      setCategories(configRes.data.categories || []);
      const methods: ShippingMethod[] = configRes.data.shipping_methods || [];
      setShippingMethods(methods);
      if (methods.length > 0 && !checkoutForm.shipping_method_id) {
        setCheckoutForm((prev) => ({ ...prev, shipping_method_id: methods[0].id }));
      }
      setQuoteStateCode(loadedShop.state_code || 'TG');
      setCheckoutForm((prev) => ({ ...prev, destination_state_code: loadedShop.state_code || 'TG' }));

      if (typeof document !== 'undefined') {
        document.title = loadedShop.seo_title || `${loadedShop.name} · Official Wholesale Business Portal`;
      }

      const items: Product[] = prodRes.data.data || [];
      setProducts(items);

      const initialQty: Record<number, number> = {};
      const initialBulk: Record<number, number> = {};
      items.forEach((p) => {
        initialQty[p.id] = p.min_order_qty || 1;
        initialBulk[p.id] = 0;
      });
      setProductQuantities(initialQty);
      setBulkQuantities(initialBulk);

      if (items.length > 0 && !selectedProduct) {
        setSelectedProduct(items[0]);
        setQuoteQty(items[0].min_order_qty || 1);
      }

      applyCartResponse(cartRes.data);

      if (getCustomerToken()) {
        try {
          const meRes = await api.get('/storefront/customers/me', {
            headers: { 'X-Shop-Slug': slugToLoad },
          });
          setCustomer(meRes.data.customer);
          setSavedAddresses(meRes.data.customer?.addresses || []);
          const ordRes = await api.get('/storefront/orders', {
            headers: { 'X-Shop-Slug': slugToLoad },
          });
          if (isStale()) return;
          setOrders(ordRes.data.data || ordRes.data.orders || []);
        } catch {
          if (!isStale()) setCustomer(null);
        }
      }
    } catch (err: any) {
      if (isStale()) return;
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || 'Failed to load wholesale storefront.';
      // Never leave placeholder catalogue data on screen when the real store failed to load.
      setStoreLoadError(
        status === 404 || status === 403 || status === 423
          ? 'This wholesale store was not found or is currently unavailable.'
          : msg
      );
      showToast('error', msg);
    } finally {
      if (!isStale()) setLoading(false);
    }
  };

  useEffect(() => {
    loadStorefront(activeSlug);
  }, [activeSlug, selectedCategory, sortOption]);

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const prodRes = await api.get('/storefront/products', {
        params: {
          category_slug: selectedCategory || undefined,
          search: searchQuery || undefined,
          sort: sortOption,
        },
      });
      setProducts(prodRes.data.data || []);
      if (activeTab === 'home' && searchQuery.trim()) {
        goToPage('catalog');
      }
    } catch {
      showToast('error', 'Failed to filter products');
    }
  };

  const fetchLivePriceQuote = async (
    product: Product,
    qty: number,
    stateCode: string,
    variantId: number | null | undefined,
    isStale: () => boolean
  ) => {
    setQuoteError('');
    try {
      const res = await api.post('/storefront/pricing/quote', {
        product_id: product.id,
        variant_id: variantId || undefined,
        quantity: qty,
        destination_state_code: stateCode,
      });
      if (isStale()) return;
      setPriceQuote(res.data.quote);
    } catch (err: any) {
      if (isStale()) return;
      const msg =
        err?.response?.data?.errors?.quantity?.[0] ||
        err?.response?.data?.message ||
        'Quantity does not meet MOQ or step rules.';
      setQuoteError(msg);
      setPriceQuote(null);
    }
  };

  // Debounced so typing a quantity doesn't fire a request per keystroke, and
  // out-of-order responses can't show the price for a stale quantity.
  useEffect(() => {
    if (!selectedProduct || quoteQty <= 0) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      fetchLivePriceQuote(selectedProduct, quoteQty, quoteStateCode, selectedVariantId, () => cancelled);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedProduct, quoteQty, quoteStateCode, selectedVariantId]);

  const handleAddToCart = async (product: Product, quantity: number, variantId?: number | null) => {
    try {
      const res = await api.post('/storefront/cart/items', {
        product_id: product.id,
        variant_id: variantId || undefined,
        quantity,
        destination_state_code: checkoutForm.destination_state_code,
      });
      applyCartResponse(res.data);
      showToast('success', `${product.name} (${quantity} ${product.unit}) added to wholesale cart.`);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.errors?.quantity?.[0] ||
        err?.response?.data?.message ||
        'Could not add item to cart.';
      showToast('error', errMsg);
    }
  };

  const handleBulkOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemsToSubmit = Object.entries(bulkQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([prodId, qty]) => ({
        product_id: Number(prodId),
        quantity: Number(qty),
      }));

    if (itemsToSubmit.length === 0) {
      showToast('error', 'Enter quantities for at least one SKU in the Bulk Order Sheet.');
      return;
    }

    try {
      const res = await api.post('/storefront/cart/bulk', {
        items: itemsToSubmit,
      });
      applyCartResponse(res.data);
      showToast('success', `Bulk added ${itemsToSubmit.length} SKU lines to your wholesale cart!`);
      goToPage('cart');
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Bulk order validation failed.');
    }
  };

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/storefront/customers/login', {
        email: loginEmail,
        password: loginPassword,
      });
      setCustomerToken(res.data.token);
      setCustomer(res.data.customer);
      showToast('success', `Signed in as ${res.data.customer.company_name}`);

      const [cartRes, ordRes, addrRes] = await Promise.all([
        api.get('/storefront/cart'),
        api.get('/storefront/orders'),
        api.get('/storefront/customers/addresses').catch(() => ({ data: { addresses: [] } })),
      ]);
      applyCartResponse(cartRes.data);
      setOrders(ordRes.data.data || ordRes.data.orders || []);
      setSavedAddresses(addrRes.data.addresses || res.data.customer?.addresses || []);
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Invalid retailer credentials.');
    }
  };

  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/storefront/customers/register', regForm);
      if (res.data.token) {
        setCustomerToken(res.data.token);
      }
      setCustomer(res.data.customer);
      showToast('success', res.data.message || 'Trade buyer account registered!');
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Registration failed.');
    }
  };

  const handleCustomerLogout = () => {
    setCustomerToken(null);
    setCustomer(null);
    setOrders([]);
    showToast('success', 'Logged out of retailer trade account.');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) {
      showToast('error', 'Please sign in with your verified Retailer B2B Account before placing an order.');
      goToPage('account');
      return;
    }

    if (placingOrder) return;
    if (cartSummary?.has_errors) {
      showToast('error', 'Some cart items can no longer be ordered. Review your cart first.');
      goToPage('cart');
      return;
    }
    setPlacingOrder(true);
    // Reuse the same key until the outcome is known, so a retry after a timeout
    // or a double-click can never place the order twice.
    if (!checkoutKeyRef.current) checkoutKeyRef.current = generateIdempotencyKey('ord');
    try {
      const res = await api.post('/storefront/checkout', checkoutForm, {
        headers: { 'Idempotency-Key': checkoutKeyRef.current },
      });
      checkoutKeyRef.current = null;
      const placedOrder = res.data.order;
      const razorpayParams: RazorpayCheckoutParams | null = res.data.razorpay ?? null;
      if (razorpayParams) {
        await runOnlinePayment(placedOrder, razorpayParams);
      } else if (placedOrder.payment_method === 'online') {
        showToast('success', `Order ${placedOrder.order_number} placed — payment pending.`);
      } else {
        showToast('success', `Order ${placedOrder.order_number} & GST Tax Invoice generated!`);
      }
      const [cartRes, ordRes] = await Promise.all([
        api.get('/storefront/cart'),
        api.get('/storefront/orders'),
      ]);
      applyCartResponse(cartRes.data);
      setOrders(ordRes.data.data || []);
      goToPage('orders');
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.order?.[0] ||
        err?.response?.data?.errors?.customer?.[0] ||
        err?.response?.data?.errors?.credit?.[0] ||
        err?.response?.data?.errors?.inventory?.[0] ||
        err?.response?.data?.message ||
        'Checkout failed.';
      const status = err?.response?.status;
      // A definite rejection (validation, stock, credit) means no order exists: the next
      // attempt is a new checkout. Network errors / 5xx keep the key for a safe retry.
      if (status && status >= 400 && status < 500) checkoutKeyRef.current = null;
      showToast('error', msg);
    } finally {
      setPlacingOrder(false);
    }
  };

  const runOnlinePayment = async (order: { id: number; order_number: string }, params: RazorpayCheckoutParams) => {
    const outcome = await payWithRazorpay(order.id, params);
    if (outcome.status === 'paid') {
      setPendingPayment(null);
      showToast('success', `Payment received for order ${order.order_number}. Thank you!`);
    } else if (outcome.status === 'dismissed') {
      setPendingPayment({
        orderId: order.id,
        orderNumber: order.order_number,
        message: 'Payment not completed — you can retry from My Orders.',
      });
    } else {
      setPendingPayment({ orderId: order.id, orderNumber: order.order_number, message: outcome.message });
      showToast('error', outcome.message);
    }
  };

  const handleRetryPayment = async (orderId: number) => {
    if (payingOrderId) return;
    setPayingOrderId(orderId);
    try {
      const res = await api.post(`/storefront/orders/${orderId}/pay`);
      if (!res.data.razorpay) {
        showToast('error', 'Online payment is not available for this store right now. Please contact the supplier.');
        return;
      }
      await runOnlinePayment(res.data.order, res.data.razorpay);
      const ordRes = await api.get('/storefront/orders');
      setOrders(ordRes.data.data || []);
    } catch (err: any) {
      showToast('error', extractApiError(err, 'Could not start the payment.'));
    } finally {
      setPayingOrderId(null);
    }
  };

  const handleReorder = async (orderId: number) => {
    try {
      const res = await api.post(`/storefront/orders/${orderId}/reorder`);
      applyCartResponse(res.data);
      showToast('success', 'All order items restored to your cart at live wholesale rates!');
      goToPage('cart');
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Could not reorder.');
    }
  };

  const handleViewInvoice = async (invoiceId: number) => {
    try {
      const res = await api.get(`/storefront/invoices/${invoiceId}`);
      setDocumentPreview({ title: 'Printable Statutory GST Tax Invoice', html: res.data.printable_html });
    } catch {
      showToast('error', 'Failed to load GST tax invoice.');
    }
  };

  const handleViewCreditNote = async (creditNoteId: number) => {
    try {
      const res = await api.get(`/storefront/credit-notes/${creditNoteId}`);
      setDocumentPreview({
        title: `GST Credit Note ${res.data.credit_note?.credit_note_number ?? ''}`.trim(),
        html: res.data.printable_html,
      });
    } catch (err: any) {
      showToast('error', extractApiError(err, 'Failed to load credit note.'));
    }
  };

  /** Returns null when the merchant hasn't published inventory data (never invent a number). */
  const getAvailableStock = (product: Product): number | null => {
    if (!product.inventory_balances || product.inventory_balances.length === 0) return null;
    return product.inventory_balances.reduce(
      (sum, b) => sum + Math.max(0, Number(b.on_hand_qty) - Number(b.reserved_qty)),
      0
    );
  };

  const getResolvedTierUnitPrice = (product: Product, qty: number): number => {
    if (!qty || qty <= 0) return Number(product.base_price);
    const tiers = [...(product.price_tiers || [])].sort((a, b) => b.min_qty - a.min_qty);
    const matched = tiers.find((t) => qty >= t.min_qty && (!t.max_qty || qty <= t.max_qty));
    return matched ? Number(matched.unit_price) : Number(product.base_price);
  };

  const getMaxSavingsPercent = (product: Product): number => {
    const base = Number(product.base_price);
    if (!base || !product.price_tiers || product.price_tiers.length === 0) return 0;
    const lowest = Math.min(...product.price_tiers.map((t) => Number(t.unit_price)));
    if (lowest >= base) return 0;
    return Math.round(((base - lowest) / base) * 100);
  };

  const bulkRunningTotals = useMemo(() => {
    let skuCount = 0;
    let totalUnits = 0;
    let estimatedSubtotal = 0;
    products.forEach((p) => {
      const q = bulkQuantities[p.id] || 0;
      if (q > 0) {
        skuCount += 1;
        totalUnits += q;
        estimatedSubtotal += q * getResolvedTierUnitPrice(p, q);
      }
    });
    return { skuCount, totalUnits, estimatedSubtotal };
  }, [products, bulkQuantities]);

  const primaryColor = shop?.primary_color || '#0f172a';
  const accentColor = shop?.accent_color || '#2563eb';
  const cartLineCount = cartSummary?.lines?.length || 0;

  const renderProductCard = (product: Product) => {
    const qty = productQuantities[product.id] ?? product.min_order_qty;
    const stock = getAvailableStock(product);
    const maxSavings = getMaxSavingsPercent(product);
    const activeUnitRate = getResolvedTierUnitPrice(product, qty);
    const gallery =
      product.images && product.images.length > 0
        ? product.images
        : product.primary_image_url
        ? [{ id: 0, url: product.primary_image_url, alt_text: product.name }]
        : [];
    const selectedGalleryIdx = cardImageIndices[product.id] ?? 0;
    const activeCardImageUrl =
      gallery[selectedGalleryIdx]?.url || product.primary_image_url || gallery[0]?.url;

    return (
      <div
        key={product.id}
        data-ui="product-card" className="group bg-[#f5f4f0] hover:bg-[#eceae3] transition-colors duration-200 flex flex-col overflow-hidden"
      >
        <div className="p-3 pb-0 relative">
          <div
            onClick={() => {
              setSelectedProduct(product);
              setSelectedVariantId(null);
              setActiveProductImageIdx(selectedGalleryIdx);
              setQuoteQty(product.min_order_qty || 1);
              goToPage('product', product.slug);
            }}
            className="cursor-pointer"
          >
            <ProductVisual
              sku={product.sku}
              name={product.name}
              categoryName={product.category?.name}
              brand={product.brand}
              unit={product.unit}
              packSize={product.pack_size}
              hsnCode={product.hsn_code}
              imageUrl={activeCardImageUrl}
              galleryCount={gallery.length || 1}
              primaryColor={primaryColor}
              accentColor={accentColor}
              className="h-52 rounded-xl group-hover:scale-[1.01] transition-transform"
            />
          </div>
          {maxSavings > 0 && (
            <span className="absolute top-6 right-6 z-20 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold ">
              Save up to {maxSavings}%
            </span>
          )}
          {gallery.length > 1 && (
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {gallery.slice(0, 3).map((img, gIdx) => {
                const isSelectedImg = selectedGalleryIdx === gIdx;
                const viewLabels = ['Studio Photo', 'Close-Up View', 'Wholesale Pack'];
                return (
                  <button
                    key={img.id || gIdx}
                    type="button"
                    onClick={() =>
                      setCardImageIndices((prev) => ({
                        ...prev,
                        [product.id]: gIdx,
                      }))
                    }
                    className={`flex items-center gap-1.5 p-1 rounded-lg text-left transition cursor-pointer ${
                      isSelectedImg
                        ? 'bg-slate-900 text-white'
                        : 'bg-white/80 hover:bg-white text-slate-700'
                    }`}
                  >
                    <img
                      src={resolveMediaUrl(img.url)}
                      alt={img.alt_text || `${product.name} view ${gIdx + 1}`}
                      loading="lazy"
                      className="w-8 h-7 rounded object-cover shrink-0 bg-white"
                    />
                    <span className="text-[10px] font-bold truncate leading-tight">
                      {viewLabels[gIdx] || `Photo ${gIdx + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
              <span className="font-semibold text-slate-600">
                {product.category?.name || 'Wholesale Supply'}
              </span>
              {stock === null ? (
                <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  Stock on request
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
                    stock > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {stock > 0 ? `${stock} ${product.unit} Ready` : 'Out of stock'}
                </span>
              )}
            </div>

            <h3
              onClick={() => {
                setSelectedProduct(product);
                setSelectedVariantId(null);
                setQuoteQty(product.min_order_qty || 1);
                goToPage('product', product.slug);
              }}
              className="text-base font-bold text-slate-900 group-hover:text-blue-700 cursor-pointer leading-snug"
            >
              {product.name}
            </h3>

            <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
              {product.short_description}
            </p>

            {/* Price Header */}
            <div className="mt-4 pt-3   flex items-baseline justify-between">
              <div>
                <div className="text-[11px] tracking-tight font-semibold text-slate-400">
                  Active Wholesale Rate
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {formatINR(activeUnitRate)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ {product.unit}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400 line-through">
                  MRP {formatINR(product.mrp)}
                </div>
                <div className="text-[11px] font-bold text-blue-700">
                  +{product.tax_category?.gst_rate ?? 18}% GST
                </div>
              </div>
            </div>

            {/* Volume Tier Pricing Table */}
            {product.price_tiers && product.price_tiers.length > 0 && (
              <div className="mt-3 bg-slate-50 rounded-xl p-2.5  ">
                <div className="flex items-center justify-between text-[10px] font-bold tracking-tight text-slate-500 mb-1.5 px-1">
                  <span>Quantity Slab</span>
                  <span>Net Rate / {product.unit}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {product.price_tiers.map((tier) => {
                    const isCurrentSlab =
                      qty >= tier.min_qty && (!tier.max_qty || qty <= tier.max_qty);
                    return (
                      <button
                        type="button"
                        key={tier.id}
                        onClick={() =>
                          setProductQuantities((prev) => ({
                            ...prev,
                            [product.id]: tier.min_qty,
                          }))
                        }
                        className={`text-left p-2 rounded-lg  transition cursor-pointer ${
                          isCurrentSlab
                            ? 'bg-blue-600 text-white  '
                            : 'bg-white text-slate-800  '
                        }`}
                      >
                        <div
                          className={`text-[10px] font-bold ${
                            isCurrentSlab ? 'text-blue-100' : 'text-slate-500'
                          }`}
                        >
                          {tier.min_qty}
                          {tier.max_qty ? `–${tier.max_qty}` : '+'} {product.unit}
                        </div>
                        <div className="text-xs font-extrabold mt-0.5">
                          {formatINR(tier.unit_price)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800   font-semibold">
                MOQ: {product.min_order_qty} {product.unit}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                Step: {product.order_qty_step} {product.unit}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                Master Pack: {product.pack_size}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3   space-y-2.5">
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px]">
              <span className="text-slate-300 font-medium">
                Smart Lot ({qty} {product.unit}): <strong className="text-white">{formatINR(qty * activeUnitRate)}</strong>
              </span>
              {Number(product.base_price) > activeUnitRate ? (
                <span className="text-emerald-400 font-extrabold">
                  Save {formatINR(qty * (Number(product.base_price) - activeUnitRate))}
                </span>
              ) : (
                <span className="text-amber-300 font-semibold">Select higher slab to save</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setProductQuantities((prev) => ({
                      ...prev,
                      [product.id]: Math.max(
                        product.min_order_qty,
                        (prev[product.id] ?? product.min_order_qty) - product.order_qty_step
                      ),
                    }))
                  }
                  aria-label={`Decrease quantity of ${product.name}`}
                  className="px-2.5 py-2 text-slate-700 hover:bg-slate-200 font-bold text-xs cursor-pointer"
                >
                  −
                </button>
                <input
                  type="number"
                  min={product.min_order_qty}
                  step={product.order_qty_step}
                  value={qty}
                  onChange={(e) =>
                    setProductQuantities((prev) => ({
                      ...prev,
                      [product.id]: Number(e.target.value),
                    }))
                  }
                  className="w-16 text-center bg-white py-2 text-xs font-bold text-slate-900 border-0 focus-visible:outline-2 focus-visible:outline-blue-600"
                  aria-label={`Quantity for ${product.name}`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setProductQuantities((prev) => ({
                      ...prev,
                      [product.id]:
                        (prev[product.id] ?? product.min_order_qty) + product.order_qty_step,
                    }))
                  }
                  aria-label={`Increase quantity of ${product.name}`}
                  className="px-2.5 py-2 text-slate-700 hover:bg-slate-200 font-bold text-xs cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleAddToCart(product, qty)}
                style={{ backgroundColor: accentColor }}
                className="flex-1 text-white text-xs font-bold py-2.5 px-3 rounded-xl hover:opacity-95 transition  cursor-pointer"
              >
                Add to Wholesale Cart
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedProduct(product);
                setSelectedVariantId(null);
                setQuoteQty(qty);
                goToPage('product', product.slug);
              }}
              className="w-full py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg   transition cursor-pointer"
            >
              Inspect Technical Specs, Variants & GST Split →
            </button>
          </div>
        </div>
      </div>
    );
  };


  return {
    shopSlug,
    navigate,
    location,
    resolvedSlug,
    activeSlug,
    basePath,
    initialSeed,
    storeLoadError,
    setStoreLoadError,
    loadSeqRef,
    checkoutKeyRef,
    placingOrder,
    setPlacingOrder,
    pendingPayment,
    setPendingPayment,
    payingOrderId,
    setPayingOrderId,
    shop,
    setShop,
    categories,
    setCategories,
    shippingMethods,
    setShippingMethods,
    products,
    setProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    catalogViewMode,
    setCatalogViewMode,
    activeTab,
    setActiveTab,
    activePolicySection,
    setActivePolicySection,
    designPreset,
    setDesignPreset,
    activeHeroSlideIdx,
    setActiveHeroSlideIdx,
    activeProductImageIdx,
    setActiveProductImageIdx,
    selectedProduct,
    setSelectedProduct,
    selectedVariantId,
    setSelectedVariantId,
    quoteQty,
    setQuoteQty,
    quoteStateCode,
    setQuoteStateCode,
    priceQuote,
    setPriceQuote,
    quoteError,
    setQuoteError,
    cartSummary,
    setCartSummary,
    productQuantities,
    setProductQuantities,
    bulkQuantities,
    setBulkQuantities,
    bulkSearchFilter,
    setBulkSearchFilter,
    customer,
    setCustomer,
    authMode,
    setAuthMode,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    regForm,
    setRegForm,
    rfqForm,
    setRfqForm,
    rfqSubmitted,
    setRfqSubmitted,
    savedAddresses,
    setSavedAddresses,
    newAddressForm,
    setNewAddressForm,
    checkoutForm,
    setCheckoutForm,
    orders,
    setOrders,
    documentPreview,
    setDocumentPreview,
    toast,
    setToast,
    loading,
    setLoading,
    toastTimerRef,
    showToast,
    goToPage,
    applyCartResponse,
    loadStorefront,
    handleSearchSubmit,
    fetchLivePriceQuote,
    handleAddToCart,
    handleBulkOrderSubmit,
    handleCustomerLogin,
    handleCustomerRegister,
    handleCustomerLogout,
    handleCheckout,
    runOnlinePayment,
    handleRetryPayment,
    handleReorder,
    handleViewInvoice,
    handleViewCreditNote,
    getAvailableStock,
    getResolvedTierUnitPrice,
    getMaxSavingsPercent,
    bulkRunningTotals,
    primaryColor,
    accentColor,
    cartLineCount,
    renderProductCard,
  };
}

export type StorefrontValue = ReturnType<typeof useStorefrontState>;
