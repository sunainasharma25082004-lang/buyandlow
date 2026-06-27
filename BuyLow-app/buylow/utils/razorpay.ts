import { Platform } from 'react-native';

export type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type OpenRazorpayOptions = {
  keyId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  onSuccess: (payload: RazorpaySuccess) => void;
  onDismiss?: () => void;
  onError?: (message: string) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  if (typeof document === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      existing.addEventListener('load', () => resolve(!!window.Razorpay));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(!!window.Razorpay);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const supportsWebRazorpay = Platform.OS === 'web';

export async function openRazorpayOnWeb(options: OpenRazorpayOptions): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    options.onError?.('Failed to load Razorpay. Check your internet connection.');
    return;
  }

  const rzp = new window.Razorpay({
    key: options.keyId,
    amount: options.amount,
    currency: options.currency,
    name: 'BuyLow India',
    description: 'Order Payment',
    order_id: options.razorpayOrderId,
    prefill: {
      name: options.userName || '',
      email: options.userEmail || '',
      contact: options.userPhone || '',
    },
    theme: { color: '#1565C0' },
    handler: (response: RazorpaySuccess) => options.onSuccess(response),
    modal: {
      ondismiss: () => options.onDismiss?.(),
    },
  });

  rzp.on('payment.failed', (response) => {
    options.onError?.(response.error?.description || 'Payment failed');
  });

  rzp.open();
}