import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// TODO: Move this to environment variable
export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51SRwkb2ZtM9M31YYqLIU1GZK04IjUO1f8AEBYCLENR18wkKSXi8Sa9D4LAmAT9eQb56QVniEfnr52tPvs4yDNcf0004fJhqPeD'
);
