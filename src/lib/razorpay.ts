import { api } from './api';

/** Checkout parameters returned by the backend when the order is paid online. */
export interface RazorpayCheckoutParams {
  key_id: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

export type RazorpayOutcome =
  | { status: 'paid'; order: any }
  | { status: 'dismissed' }
  | { status: 'failed'; message: string };

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (resp: any) => void) => void;
    };
  }
}

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptPromise: Promise<void> | null = null;

/** Inject Razorpay's checkout.js once per page load. */
export function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Could not load the Razorpay payment window. Check your connection and retry.'));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Open the Razorpay modal for one of our orders and verify the signed result server-side.
 * Resolves with the outcome; never throws.
 */
export async function payWithRazorpay(orderId: number, params: RazorpayCheckoutParams): Promise<RazorpayOutcome> {
  try {
    await loadRazorpayScript();
  } catch (err: any) {
    return { status: 'failed', message: err?.message || 'Payment window unavailable.' };
  }
  if (!window.Razorpay) {
    return { status: 'failed', message: 'Payment window unavailable.' };
  }

  return new Promise<RazorpayOutcome>((resolve) => {
    let settled = false;
    const finish = (outcome: RazorpayOutcome) => {
      if (settled) return;
      settled = true;
      resolve(outcome);
    };

    // Razorpay keeps the modal open after a declined attempt so the buyer can retry;
    // remember the reason and report it only if they close the window without paying.
    let lastFailure: string | null = null;
    const rzp = new window.Razorpay!({
      key: params.key_id,
      order_id: params.order_id,
      amount: params.amount,
      currency: params.currency,
      name: params.name,
      description: params.description,
      prefill: params.prefill,
      handler: async (resp: RazorpaySuccessResponse) => {
        try {
          const res = await api.post('/storefront/payments/razorpay/verify', {
            order_id: orderId,
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          });
          finish({ status: 'paid', order: res.data.order });
        } catch (err: any) {
          finish({
            status: 'failed',
            message: err?.response?.data?.message || 'Payment received but verification failed. Contact the supplier with your payment ID.',
          });
        }
      },
      modal: {
        ondismiss: () =>
          finish(lastFailure ? { status: 'failed', message: lastFailure } : { status: 'dismissed' }),
      },
    });
    rzp.on('payment.failed', (resp: any) => {
      lastFailure = resp?.error?.description || 'Payment was declined by the bank.';
    });
    rzp.open();
  });
}
