'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Building2, Zap } from 'lucide-react';
import { useOrganizations } from '@/hooks/useOrganizations';
import { api } from '@/lib/api';

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    icon: Zap,
    features: [
      '2 Projects',
      '5 Team Members',
      'Basic Analytics',
      'Community Support',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 29,
    icon: Sparkles,
    popular: true,
    features: [
      'Unlimited Projects',
      '20 Team Members',
      'Advanced Analytics',
      'AI Features',
      'Priority Support',
    ],
  },
  {
    id: 'BUSINESS',
    name: 'Business',
    price: 99,
    icon: Building2,
    features: [
      'Everything in Pro',
      'Unlimited Members',
      'Advanced RBAC',
      'Audit Logs',
      'Custom Integrations',
      'Dedicated Support',
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { data: organizations } = useOrganizations();
  const [loading, setLoading] = useState<string | null>(null);

  const currentOrg = organizations?.[0];

  const handleSelectPlan = async (planId: string) => {
    if (!currentOrg) {
      alert('Please create an organization first');
      router.push('/organizations');
      return;
    }

    if (planId === 'FREE') {
      alert('Free plan is default');
      return;
    }

    setLoading(planId);

    try {
      const response = await api.post('/stripe/checkout', {
        organizationId: currentOrg.id,
        plan: planId,
      });

      window.location.href = response.data.url;
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create checkout session');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Choose Your Plan
        </h1>
        <p className="text-slate-600">
          Start free, upgrade when you&apos;re ready
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border-2 p-8 relative ${
                plan.popular
                  ? 'border-blue-500 shadow-xl'
                  : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-full">
                  POPULAR
                </div>
              )}

              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {plan.name}
              </h3>

              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">
                  ${plan.price}
                </span>
                <span className="text-slate-500">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                } disabled:opacity-50`}
              >
                {loading === plan.id
                  ? 'Loading...'
                  : plan.price === 0
                    ? 'Get Started'
                    : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}