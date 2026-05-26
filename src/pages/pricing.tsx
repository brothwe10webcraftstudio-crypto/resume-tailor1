import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { Check, Sparkles, Zap } from 'lucide-react';

export function PricingPage() {
  const { user, profile } = useAuth();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for trying out',
      features: [
        '3 resume tailors per month',
        'All AI features included',
        'PDF download',
        'Email support'
      ],
      cta: user ? (profile?.subscription_tier === 'free' ? 'Current Plan' : 'Downgrade') : 'Get Started Free',
      link: user ? '/dashboard' : '/auth',
      highlighted: false,
      current: profile?.subscription_tier === 'free'
    },
    {
      name: 'Pro',
      price: '$12',
      period: '/month',
      description: 'For serious job seekers',
      features: [
        'Unlimited resume tailors',
        'Priority AI processing',
        'Advanced keyword matching',
        'Tailoring history',
        'Priority email support'
      ],
      cta: profile?.subscription_tier === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      link: '/checkout',
      highlighted: true,
      current: profile?.subscription_tier === 'pro'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-16rem)] py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
          <Zap className="w-4 h-4" />
          Simple, Transparent Pricing
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Start with 3 free tailors per month. Upgrade to Pro for unlimited resume customization.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl p-8 ${
              plan.highlighted
                ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-2xl shadow-emerald-500/30'
                : 'bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-lg'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-amber-400 text-amber-900 text-sm font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <h3 className={`text-xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm ${plan.highlighted ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {plan.description}
              </p>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                {plan.price}
              </span>
              <span className={plan.highlighted ? 'text-emerald-200' : 'text-slate-500 dark:text-slate-400'}>
                {plan.period}
              </span>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.highlighted ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/50'}`}>
                    <Check className={`w-3 h-3 ${plan.highlighted ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                  </div>
                  <span className={plan.highlighted ? 'text-emerald-50' : 'text-slate-700 dark:text-slate-300'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              to={plan.link}
              className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
                plan.current
                  ? plan.highlighted
                    ? 'bg-white/20 text-white cursor-default'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default'
                  : plan.highlighted
                    ? 'bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg'
                    : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Cancel anytime. No hidden fees.</span>
        </div>
      </div>
    </div>
  );
}
