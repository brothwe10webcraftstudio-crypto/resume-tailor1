import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { CreditCard, Loader2, Check, AlertCircle, Zap, Shield, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

export function CheckoutPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Sign in to Upgrade
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Please create an account or sign in to upgrade to Pro
        </p>
        <Link
          to="/auth"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (profile?.subscription_tier === 'pro') {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          You're Already a Pro!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Thanks for being a Pro member. You have unlimited resume tailors.
        </p>
        <Link
          to="/dashboard"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold inline-block"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
        setError('Payment system is not configured. Please contact support.');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            priceId: 'price_pro_monthly',
            successUrl: `${window.location.origin}/dashboard?checkout=success`,
            cancelUrl: `${window.location.origin}/checkout?checkout=canceled`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (stripe) {
        const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
        if (stripeError) {
          throw new Error(stripeError.message);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Upgrade to Pro</h2>
              <p className="text-emerald-100">Unlimited resume tailors for $12/month</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-4 mb-8">
            {[
              'Unlimited resume tailors',
              'Priority AI processing',
              'Advanced keyword matching',
              'Full tailoring history',
              'Priority email support',
              'Cancel anytime'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-slate-700 dark:text-slate-300">{feature}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                <Link to="/pricing" className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-2 inline-block">
                  View all plans
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between py-4 border-t border-slate-200 dark:border-slate-700 mb-6">
            <span className="text-slate-700 dark:text-slate-300">Monthly subscription</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">$12</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Continue to Payment
              </>
            )}
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Shield className="w-4 h-4" />
            Secure payment powered by Stripe
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
        By subscribing, you agree to our Terms of Service. You can cancel anytime from your account.
        No refunds for partial months.
      </p>
    </div>
  );
}
