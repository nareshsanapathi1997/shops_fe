import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SetPasswordPage } from '../pages/merchant/SetPasswordPage';
import { CartSection } from '../pages/storefront/sections/CartSection';
import { StorefrontContext } from '../pages/storefront/StorefrontContext';
import type { StorefrontValue } from '../pages/storefront/useStorefrontState';
import { OrdersHistory } from '../pages/storefront/components/OrdersHistory';
import { merchantPathForTab, merchantTabFromPath } from '../pages/merchant/shared';
import type { CartSummary, WholesaleOrder } from '../types/api';

const postMock = vi.fn();

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');
  return {
    ...actual,
    api: { post: (...args: unknown[]) => postMock(...args), get: vi.fn() },
  };
});

function cartWith(overrides: Partial<CartSummary>): CartSummary {
  return {
    lines: [],
    subtotal: 12000,
    discount_total: 0,
    tax_total: 2160,
    cgst_total: 1080,
    sgst_total: 1080,
    igst_total: 0,
    shipping_total: 0,
    grand_total: 14160,
    min_order_value: 5000,
    meets_min_order_value: true,
    is_inter_state: false,
    supply_state_code: 'TG',
    ...overrides,
  };
}

const line = {
  product_id: 7,
  variant_id: null,
  product_name: 'ProGuard 32A MCB',
  sku: 'ACME-MCB-32A',
  hsn_code: '8536',
  unit: 'pcs',
  pack_size: 1,
  quantity: 100,
  base_unit_price: 120,
  unit_price: 120,
  pricing_rule: 'base',
  line_subtotal: 12000,
  discount_amount: 0,
  taxable_amount: 12000,
  gst_rate: 18,
  is_inter_state: false,
  cgst_amount: 1080,
  sgst_amount: 1080,
  igst_amount: 0,
  tax_amount: 2160,
  line_total: 14160,
};

function renderCart(summary: CartSummary) {
  const value = { cartSummary: summary, goToPage: vi.fn(), accentColor: '#0f172a' } as unknown as StorefrontValue;
  return render(
    <StorefrontContext.Provider value={value}>
      <CartSection />
    </StorefrontContext.Provider>
  );
}

describe('Round two: payments, invitations, credit notes and cart safety', () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it('maps merchant console sections to URLs and back', () => {
    expect(merchantPathForTab('overview')).toBe('/merchant/dashboard');
    expect(merchantTabFromPath('/merchant/orders')).toBe('orders');
    expect(merchantTabFromPath('/merchant')).toBe('overview');
    expect(merchantTabFromPath('/merchant/not-a-section')).toBeNull();
  });

  it('blocks checkout and shows the reason when a cart line can no longer be priced', () => {
    renderCart(
      cartWith({
        lines: [{ ...line, error: 'This product is no longer available.' }],
        has_errors: true,
      })
    );
    expect(screen.getByText('This product is no longer available.')).toBeTruthy();
    const proceed = screen.getByRole('button', { name: /Proceed to B2B GST Checkout/i }) as HTMLButtonElement;
    expect(proceed.disabled).toBe(true);
  });

  it('allows checkout when every cart line is valid', () => {
    renderCart(cartWith({ lines: [line], has_errors: false }));
    const proceed = screen.getByRole('button', { name: /Proceed to B2B GST Checkout/i }) as HTMLButtonElement;
    expect(proceed.disabled).toBe(false);
  });

  it('sets a password from an invitation link', async () => {
    postMock.mockResolvedValue({ data: { message: 'Password updated.' } });
    render(
      <MemoryRouter initialEntries={['/merchant/set-password?token=tok123&email=clerk%40acmesupplies.in']}>
        <Routes>
          <Route path="/merchant/set-password" element={<SetPasswordPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('clerk@acmesupplies.in');
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'Warehouse2026' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'Warehouse2026' } });
    fireEvent.click(screen.getByRole('button', { name: 'Set password' }));

    await waitFor(() => expect(screen.getByText('Your password has been set.')).toBeTruthy());
    expect(postMock).toHaveBeenCalledWith('/auth/password/reset', {
      email: 'clerk@acmesupplies.in',
      token: 'tok123',
      password: 'Warehouse2026',
      password_confirmation: 'Warehouse2026',
    });
  });

  it('rejects mismatched passwords without calling the API', () => {
    render(
      <MemoryRouter initialEntries={['/merchant/set-password?token=tok123&email=a%40b.in']}>
        <Routes>
          <Route path="/merchant/set-password" element={<SetPasswordPage />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'Warehouse2026' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'Different2026' } });
    fireEvent.click(screen.getByRole('button', { name: 'Set password' }));
    expect(screen.getByText('The two passwords do not match.')).toBeTruthy();
    expect(postMock).not.toHaveBeenCalled();
  });

  it('lists credit notes, the e-way bill and a Pay now action on an unpaid online order', () => {
    const order = {
      id: 41,
      shop_id: 1,
      customer_id: 9,
      order_number: 'ACME-1042',
      status: 'pending_confirmation',
      payment_status: 'pending',
      payment_method: 'online',
      subtotal: 60000,
      discount_total: 0,
      tax_total: 10800,
      cgst_total: 5400,
      sgst_total: 5400,
      igst_total: 0,
      shipping_total: 0,
      grand_total: 70800,
      is_inter_state: false,
      supply_state_code: 'TG',
      placed_at: '2026-10-27T10:00:00Z',
      eway_bill_number: '331000123456',
      credit_notes: [
        {
          id: 3,
          credit_note_number: 'CN-26-27/1001',
          reason: 'Short supply',
          taxable_total: 1000,
          cgst_total: 90,
          sgst_total: 90,
          igst_total: 0,
          grand_total: 1180,
          issued_at: '2026-10-27T12:00:00Z',
          status: 'issued',
        },
      ],
    } as WholesaleOrder;
    const onViewCreditNote = vi.fn();
    const onRetryPayment = vi.fn();

    render(
      <OrdersHistory
        orders={[order]}
        pendingPayment={null}
        payingOrderId={null}
        documentPreview={null}
        onReorder={vi.fn()}
        onViewInvoice={vi.fn()}
        onViewCreditNote={onViewCreditNote}
        onRetryPayment={onRetryPayment}
        onDismissPendingPayment={vi.fn()}
        onClosePreview={vi.fn()}
      />
    );

    expect(screen.getByText('331000123456')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'View credit note' }));
    expect(onViewCreditNote).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByRole('button', { name: 'Pay now' }));
    expect(onRetryPayment).toHaveBeenCalledWith(41);
  });
});
