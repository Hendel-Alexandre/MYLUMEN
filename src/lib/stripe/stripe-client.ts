import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
    if (!key) {
      console.error('Missing NEXT_PUBLIC_STRIPE_PUBLIC_KEY');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};
