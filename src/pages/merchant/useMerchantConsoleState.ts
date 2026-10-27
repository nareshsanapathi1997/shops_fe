import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AUTH_EXPIRED_EVENT, MERCHANT_TOKEN_KEY, api, extractApiError, getActiveShopSlug, getMerchantToken, setActiveShopSlug } from '../../lib/api';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { useLocation, useNavigate } from 'react-router-dom';
import { IS_DEV, buildSettingsForm, type MerchantTab, merchantPathForTab, merchantTabFromPath } from './shared';

/**
 * All merchant console state, queries and mutations. The portal shell and every section read
 * from this through MerchantConsoleContext.
 */
export function useMerchantConsoleState() {
  useDocumentTitle('Merchant Console · Wholesale SaaS');
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(getMerchantToken());
  const [shopSlug, setShopSlug] = useState<string>(getActiveShopSlug());
  const location = useLocation();
  const navigate = useNavigate();
  // The active section lives in the URL (/merchant/orders, ...) so refresh and back/forward work.
  const routeTab = merchantTabFromPath(location.pathname);
  const activeTab: MerchantTab = routeTab ?? 'overview';
  const isUnknownSection = routeTab === null;
  const setActiveTab = (tab: MerchantTab) => navigate(merchantPathForTab(tab));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState(IS_DEV ? 'owner@acmesupplies.in' : '');
  const [loginPassword, setLoginPassword] = useState(IS_DEV ? 'Merchant@123' : '');
  const [forgotPending, setForgotPending] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    owner_password: '',
    shop_name: '',
    legal_name: '',
    slug: '',
    gstin: '',
    city: 'Hyderabad',
    state_code: 'TG',
    min_order_value: 5000,
    primary_color: '#0f172a',
    plan_slug: 'growth',
  });
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [staffInvite, setStaffInvite] = useState<{ email: string; sent: boolean; url: string | null } | null>(null);

  // Forms
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    hsn_code: '8536',
    unit: 'pcs',
    pack_size: 10,
    base_price: 120,
    min_order_qty: 10,
    order_qty_step: 10,
    initial_stock: 200,
    tier1_qty: 50,
    tier1_price: 105,
    tier2_qty: 200,
    tier2_price: 92,
    primary_image_url: '/uploads/demo/acme-mcb-primary.jpg',
  });

  const [newCategory, setNewCategory] = useState({ name: '', description: '', image_url: '/uploads/demo/cat-switchgear.jpg' });
  const [newTaxCat, setNewTaxCat] = useState({ name: '', hsn_code: '', gst_rate: 18 });
  const [newWarehouse, setNewWarehouse] = useState({ name: '', code: '', city: 'Hyderabad', state_code: 'TG' });
  const [newGroup, setNewGroup] = useState({ name: '', code: '', discount_percentage: 5 });
  const [newPriceList, setNewPriceList] = useState({ name: '', product_id: 0, fixed_unit_price: 95, customer_id: 0 });
  const [newShippingMethod, setNewShippingMethod] = useState({
    name: '',
    code: '',
    carrier_name: 'VRL B2B Surface Cargo',
    base_charge: 350,
    free_shipping_threshold: 25000,
    estimated_days_min: 2,
    estimated_days_max: 4,
  });
  const [documentPreview, setDocumentPreview] = useState<{ title: string; html: string } | null>(null);
  const [rfqQuoteInputs, setRfqQuoteInputs] = useState<Record<number, { price: string; notes: string }>>({});
  const [stockAdjust, setStockAdjust] = useState({
    product_id: 0,
    quantity_delta: 50,
    movement_type: 'restock',
    notes: 'Warehouse replenishment batch',
  });
  const [newDomainHost, setNewDomainHost] = useState('');
  const [staffForm, setStaffForm] = useState({ name: '', email: '', role_slug: 'merchant_manager' });
  const [newShopForm, setNewShopForm] = useState({
    name: '',
    slug: '',
    gstin: '',
    city: 'Hyderabad',
    state_code: 'TG',
    min_order_value: 5000,
  });

  const [settingsForm, setSettingsForm] = useState({
    name: '',
    legal_name: '',
    gstin: '',
    pan: '',
    hero_title: '',
    hero_subtitle: '',
    about_html: '',
    primary_color: '#0f172a',
    accent_color: '#2563eb',
    min_order_value: 5000,
    support_email: '',
    support_phone: '',
    whatsapp_number: '',
    address_line1: '',
    city: '',
    state_code: 'TG',
    postal_code: '',
    shipping_policy: '',
    return_policy: '',
    terms_policy: '',
    privacy_policy: '',
    bank_name: '',
    account_name: '',
    account_number: '',
    ifsc: '',
    announcement_text: '',
    announcement_enabled: true,
    dispatch_sla_hours: 24,
    logo_url: '',
    banner_url: '',
    about_image_url: '',
    theme_preset: 'classic_smart',
  });

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: 'success' | 'error', text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setNotice({ type, text });
    toastTimerRef.current = setTimeout(() => setNotice(null), type === 'error' ? 7000 : 4000);
  };

  useEffect(() => {
    const onExpired = (e: Event) => {
      if ((e as CustomEvent).detail?.surface === 'merchant') {
        setToken(null);
        queryClient.clear();
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setNotice({ type: 'error', text: 'Your session has expired. Please sign in again.' });
      }
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [queryClient]);

  /** Run an async action with an error toast instead of an unhandled rejection. */
  const runSafely = async (action: () => Promise<unknown>, failureMessage: string): Promise<boolean> => {
    try {
      await action();
      return true;
    } catch (err) {
      showToast('error', extractApiError(err, failureMessage));
      return false;
    }
  };

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
      return res.data;
    },
    onSuccess: (data) => {
      localStorage.setItem(MERCHANT_TOKEN_KEY, data.token);
      setToken(data.token);
      if (data.user?.shops?.[0]?.slug) {
        setActiveShopSlug(data.user.shops[0].slug);
        setShopSlug(data.user.shops[0].slug);
      }
      queryClient.invalidateQueries();
      showToast('success', `Welcome back, ${data.user.name}`);
    },
    onError: (err: any) => {
      showToast('error', extractApiError(err, 'Merchant login failed.'));
    },
  });

  const registerAndLaunchMutation = useMutation({
    mutationFn: async () => {
      // Single atomic call: creates the owner account and provisions the shop together.
      const res = await api.post('/onboarding/shops', {
        owner_name: registerForm.owner_name,
        owner_email: registerForm.owner_email.trim().toLowerCase(),
        owner_phone: registerForm.owner_phone || undefined,
        password: registerForm.owner_password,
        shop_name: registerForm.shop_name,
        slug: registerForm.slug.toLowerCase().trim() || undefined,
        legal_name: registerForm.legal_name || registerForm.shop_name,
        gstin: registerForm.gstin || undefined,
        city: registerForm.city,
        state_code: registerForm.state_code,
        minimum_order_amount: Number(registerForm.min_order_value) || 0,
        primary_color: registerForm.primary_color,
        plan_slug: registerForm.plan_slug,
      });
      return { token: res.data.token as string, shop: res.data.shop };
    },
    onSuccess: ({ token: newToken, shop }) => {
      localStorage.setItem(MERCHANT_TOKEN_KEY, newToken);
      setToken(newToken);
      setActiveShopSlug(shop.slug);
      setShopSlug(shop.slug);
      queryClient.invalidateQueries();
      showToast('success', `Storefront ${shop.slug}.platform-domain.com launched!`);
    },
    onError: (err: any) => {
      showToast('error', extractApiError(err, 'Could not register merchant storefront.'));
    },
  });

  const meQuery = useQuery({
    queryKey: ['merchant-me', token],
    enabled: Boolean(token),
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.user;
    },
  });

  const dashboardQuery = useQuery({
    queryKey: ['merchant-dashboard', shopSlug, token],
    enabled: Boolean(token),
    queryFn: async () => {
      const res = await api.get('/merchant/dashboard');
      return res.data;
    },
  });

  // Initialise the settings form once per shop. Re-copying on every dashboard refetch
  // (e.g. after a logo upload) would silently discard the merchant's unsaved edits.
  const [settingsShopId, setSettingsShopId] = useState<number | null>(null);
  const dashboardShop = dashboardQuery.data?.shop;
  if (dashboardShop && dashboardShop.id !== settingsShopId) {
    setSettingsShopId(dashboardShop.id);
    setSettingsForm(buildSettingsForm(dashboardShop));
  }

  const productsQuery = useQuery({
    queryKey: ['merchant-products', shopSlug, token],
    enabled: Boolean(token && (activeTab === 'products' || activeTab === 'inventory' || activeTab === 'pricing')),
    queryFn: async () => {
      const res = await api.get('/merchant/products');
      return res.data.data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ['merchant-categories', shopSlug, token],
    enabled: Boolean(token && (activeTab === 'categories' || activeTab === 'products')),
    queryFn: async () => {
      const res = await api.get('/merchant/categories');
      return res.data;
    },
  });

  const mediaQuery = useQuery({
    queryKey: ['merchant-media', shopSlug, token],
    enabled: Boolean(token && (activeTab === 'settings' || activeTab === 'products' || activeTab === 'categories')),
    queryFn: async () => {
      const res = await api.get('/merchant/media');
      return res.data.media || [];
    },
  });

  const handleFileUpload = async (
    file: File,
    options?: {
      category?: string;
      assign_to?: 'shop_logo' | 'shop_banner' | 'shop_about_image' | 'product_image' | 'category_image';
      target_id?: number;
      onUploadedUrl?: (url: string) => void;
    }
  ) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (options?.category) fd.append('category', options.category);
      if (options?.assign_to) fd.append('assign_to', options.assign_to);
      if (options?.target_id) fd.append('target_id', String(options.target_id));

      const res = await api.post('/merchant/media/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = res.data.url;
      if (options?.onUploadedUrl) {
        options.onUploadedUrl(uploadedUrl);
      }
      queryClient.invalidateQueries({ queryKey: ['merchant-media'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-products'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-categories'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-dashboard'] });
      showToast('success', `Uploaded ${file.name} dynamically to database & media storage!`);
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Image upload failed.');
    }
  };

  const inventoryQuery = useQuery({
    queryKey: ['merchant-inventory', shopSlug, token],
    enabled: Boolean(token && activeTab === 'inventory'),
    queryFn: async () => {
      const res = await api.get('/merchant/inventory');
      return res.data;
    },
  });

  const customersQuery = useQuery({
    queryKey: ['merchant-customers', shopSlug, token],
    enabled: Boolean(token && (activeTab === 'customers' || activeTab === 'pricing')),
    queryFn: async () => {
      const res = await api.get('/merchant/customers');
      return res.data.customers;
    },
  });

  const pricingListsQuery = useQuery({
    queryKey: ['merchant-pricing-lists', shopSlug, token],
    enabled: Boolean(token && activeTab === 'pricing'),
    queryFn: async () => {
      const res = await api.get('/merchant/price-lists');
      return res.data;
    },
  });

  const rfqsQuery = useQuery({
    queryKey: ['merchant-rfqs', shopSlug, token],
    enabled: Boolean(token && activeTab === 'rfqs'),
    queryFn: async () => {
      const res = await api.get('/merchant/rfqs');
      return res.data.rfqs || [];
    },
  });

  const shippingMethodsQuery = useQuery({
    queryKey: ['merchant-shipping-methods', shopSlug, token],
    enabled: Boolean(token && activeTab === 'shipping'),
    queryFn: async () => {
      const res = await api.get('/merchant/shipping-methods');
      return res.data.shipping_methods || [];
    },
  });

  const notificationsQuery = useQuery({
    queryKey: ['merchant-notifications', shopSlug, token],
    enabled: Boolean(token && activeTab === 'notifications'),
    queryFn: async () => {
      const res = await api.get('/merchant/notifications');
      return res.data;
    },
  });

  const auditLogsQuery = useQuery({
    queryKey: ['merchant-audit-logs', shopSlug, token],
    enabled: Boolean(token && activeTab === 'audit-logs'),
    queryFn: async () => {
      const res = await api.get('/merchant/audit-logs');
      return res.data.audit_logs || [];
    },
  });

  const ordersQuery = useQuery({
    queryKey: ['merchant-orders', shopSlug, token],
    enabled: Boolean(token && activeTab === 'orders'),
    queryFn: async () => {
      const res = await api.get('/merchant/orders');
      return res.data.orders;
    },
  });

  const invoicesQuery = useQuery({
    queryKey: ['merchant-invoices', shopSlug, token],
    enabled: Boolean(token && activeTab === 'invoices'),
    queryFn: async () => {
      const res = await api.get('/merchant/invoices');
      return res.data.invoices;
    },
  });

  const domainsQuery = useQuery({
    queryKey: ['merchant-domains', shopSlug, token],
    enabled: Boolean(token && activeTab === 'domains'),
    queryFn: async () => {
      const res = await api.get('/merchant/domains');
      return res.data.domains;
    },
  });

  const staffQuery = useQuery({
    queryKey: ['merchant-staff', shopSlug, token],
    enabled: Boolean(token && activeTab === 'staff'),
    queryFn: async () => {
      const res = await api.get('/merchant/staff');
      return res.data;
    },
  });

  const subscriptionQuery = useQuery({
    queryKey: ['merchant-subscription', shopSlug, token],
    enabled: Boolean(token && activeTab === 'subscription'),
    queryFn: async () => {
      const res = await api.get('/merchant/subscription');
      return res.data;
    },
  });

  const reportsQuery = useQuery({
    queryKey: ['merchant-reports', shopSlug, token],
    enabled: Boolean(token && activeTab === 'reports'),
    queryFn: async () => {
      const res = await api.get('/merchant/reports');
      return res.data;
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/merchant/products', {
        name: newProduct.name,
        sku: newProduct.sku,
        hsn_code: newProduct.hsn_code,
        unit: newProduct.unit,
        pack_size: newProduct.pack_size,
        base_price: newProduct.base_price,
        min_order_qty: newProduct.min_order_qty,
        order_qty_step: newProduct.order_qty_step,
        initial_stock: newProduct.initial_stock,
        primary_image_url: newProduct.primary_image_url || undefined,
        image_url: newProduct.primary_image_url || undefined,
        price_tiers: [
          { min_qty: newProduct.min_order_qty, max_qty: newProduct.tier1_qty - 1, unit_price: newProduct.base_price },
          { min_qty: newProduct.tier1_qty, max_qty: newProduct.tier2_qty - 1, unit_price: newProduct.tier1_price },
          { min_qty: newProduct.tier2_qty, max_qty: null, unit_price: newProduct.tier2_price },
        ],
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-products'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-dashboard'] });
      setNewProduct({ ...newProduct, name: '', sku: '' });
      showToast('success', 'Wholesale product & tier pricing published.');
    },
    onError: (err: any) => {
      showToast('error', err?.response?.data?.message || 'Could not create product.');
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/merchant/categories', newCategory);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-categories'] });
      setNewCategory({ name: '', description: '', image_url: '/uploads/demo/cat-switchgear.jpg' });
      showToast('success', 'Category created.');
    },
    onError: (err: any) => showToast('error', extractApiError(err, 'Could not save category.')),
  });

  const adjustInventoryMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/merchant/inventory/adjust', stockAdjust);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-dashboard'] });
      showToast('success', 'Inventory movement recorded.');
    },
    onError: (err: any) => {
      showToast('error', err?.response?.data?.message || 'Stock adjustment failed.');
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async (payload: { id: number; approval_status: string; credit_limit?: number }) => {
      const res = await api.put(`/merchant/customers/${payload.id}/approval`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-customers'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-dashboard'] });
      showToast('success', 'Customer approval status updated.');
    },
    onError: (err: any) => showToast('error', extractApiError(err, 'Could not update customer.')),
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async (payload: {
      id: number;
      status: string;
      payment_status?: string;
      tracking_number?: string;
      eway_bill_number?: string;
    }) => {
      const res = await api.put(`/merchant/orders/${payload.id}/status`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-orders'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-dashboard'] });
      showToast('success', 'Order & fulfillment status updated.');
    },
    onError: (err: any) => showToast('error', extractApiError(err, 'Could not update order status.')),
  });

  const addDomainMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/merchant/domains', { hostname: newDomainHost });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-domains'] });
      setNewDomainHost('');
      showToast('success', 'Custom domain registered. Configure DNS TXT token to verify.');
    },
    onError: (err: any) => {
      showToast('error', err?.response?.data?.message || 'Domain registration failed.');
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (payload: { id: number; token?: string }) => {
      const res = await api.post(`/merchant/domains/${payload.id}/verify`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-domains'] });
      const verified = data.domain?.verification_status === 'verified';
      showToast(
        verified ? 'success' : 'error',
        verified
          ? `${data.domain.hostname} verified.`
          : data.domain?.failure_reason || data.message || 'DNS TXT record not found yet. DNS changes can take up to 48 hours.'
      );
    },
    onError: (err: any) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-domains'] });
      showToast('error', extractApiError(err, 'Domain verification failed.'));
    },
  });

  const inviteStaffMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/merchant/staff', staffForm);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-staff'] });
      setStaffInvite({
        email: staffForm.email,
        sent: Boolean(data?.invitation_sent),
        url: data?.invitation_url ?? null,
      });
      setStaffForm({ name: '', email: '', role_slug: 'merchant_manager' });
      showToast(
        'success',
        data?.invitation_sent ? `Invitation email sent to ${staffForm.email}.` : 'Staff member added to shop.'
      );
    },
    onError: (err: any) => showToast('error', extractApiError(err, 'Could not add staff member.')),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/merchant/settings', {
        ...settingsForm,
        bank_account_details_json: {
          bank_name: settingsForm.bank_name,
          account_name: settingsForm.account_name,
          account_number: settingsForm.account_number,
          ifsc: settingsForm.ifsc,
        },
        logo_url: settingsForm.logo_url || null,
        banner_url: settingsForm.banner_url || null,
        merchant_settings: {
          theme_preset: settingsForm.theme_preset || 'classic_smart',
          about_image_url: settingsForm.about_image_url || null,
          announcement_bar: {
            enabled: settingsForm.announcement_enabled,
            text: settingsForm.announcement_text,
          },
          dispatch_sla_hours: Number(settingsForm.dispatch_sla_hours) || 24,
        },
      });
      return res.data.shop;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['storefront-config'] });
      queryClient.invalidateQueries({ queryKey: ['directory-shops'] });
      showToast('success', 'Merchant Business Page & Storefront branding updated live!');
    },
    onError: (err: any) => {
      showToast('error', err?.response?.data?.message || 'Failed to update settings.');
    },
  });

  const createShopMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/shops', newShopForm);
      return res.data.shop;
    },
    onSuccess: (createdShop) => {
      setActiveShopSlug(createdShop.slug);
      setShopSlug(createdShop.slug);
      queryClient.invalidateQueries();
      setActiveTab('overview');
      showToast('success', `Launched new wholesale shop: ${createdShop.slug}.platform-domain.com`);
    },
    onError: (err: any) => {
      showToast('error', err?.response?.data?.message || 'Shop onboarding failed.');
    },
  });

  const metrics = dashboardQuery.data?.metrics;

  return {
    queryClient,
    token,
    setToken,
    shopSlug,
    setShopSlug,
    activeTab,
    setActiveTab,
    mobileNavOpen,
    setMobileNavOpen,
    authMode,
    setAuthMode,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    forgotPending,
    setForgotPending,
    registerForm,
    setRegisterForm,
    notice,
    setNotice,
    staffInvite,
    setStaffInvite,
    newProduct,
    setNewProduct,
    newCategory,
    setNewCategory,
    newTaxCat,
    setNewTaxCat,
    newWarehouse,
    setNewWarehouse,
    newGroup,
    setNewGroup,
    newPriceList,
    setNewPriceList,
    newShippingMethod,
    setNewShippingMethod,
    documentPreview,
    setDocumentPreview,
    rfqQuoteInputs,
    setRfqQuoteInputs,
    stockAdjust,
    setStockAdjust,
    newDomainHost,
    setNewDomainHost,
    staffForm,
    setStaffForm,
    newShopForm,
    setNewShopForm,
    settingsForm,
    setSettingsForm,
    toastTimerRef,
    showToast,
    runSafely,
    loginMutation,
    registerAndLaunchMutation,
    meQuery,
    dashboardQuery,
    settingsShopId,
    setSettingsShopId,
    dashboardShop,
    productsQuery,
    categoriesQuery,
    mediaQuery,
    handleFileUpload,
    inventoryQuery,
    customersQuery,
    pricingListsQuery,
    rfqsQuery,
    shippingMethodsQuery,
    notificationsQuery,
    auditLogsQuery,
    ordersQuery,
    invoicesQuery,
    domainsQuery,
    staffQuery,
    subscriptionQuery,
    reportsQuery,
    createProductMutation,
    createCategoryMutation,
    adjustInventoryMutation,
    updateCustomerMutation,
    updateOrderStatusMutation,
    addDomainMutation,
    verifyDomainMutation,
    inviteStaffMutation,
    updateSettingsMutation,
    createShopMutation,
    metrics,
    isUnknownSection,
  };
}

export type MerchantConsoleValue = ReturnType<typeof useMerchantConsoleState>;
