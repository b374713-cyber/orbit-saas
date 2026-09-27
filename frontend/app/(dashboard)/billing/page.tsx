'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';
import { useOrganizations } from '@/hooks/useOrganizations';
import { api } from '@/lib/api';

export default function BillingPage() {
  const { data: organizations } = useOrganizations();
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentOrg = organizations?.[0];

  const loadBillingData = useCallback(async () => {
    if (!currentOrg) return;

    try {
      const [subRes, invRes] = await Promise.all([
        api.get(`/stripe/subscription/${currentOrg.id}`),
        api.get(`/stripe/invoices/${currentOrg.id}`),
      ]);

      setSubscription(subRes.data);
      setInvoices(invRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentOrg]);

  useEffect(() => {
    if (currentOrg) {
      loadBillingData();
    }
  }, [currentOrg, loadBillingData]);

  const handleCancel = async () => {
    if (!confirm('Cancel subscription at period end?')) return;

    try {
      await api.post('/stripe/cancel', { organizationId: currentOrg?.id });
      alert('Subscription will cancel at period end');
      loadBillingData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed');
    }
  };

  const handleManage = async () => {
    try {
      const response = await api.post('/stripe/portal', {
        organizationId: currentOrg?.id,
      });
      window.location.href = response.data.url;
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Billing</h1>

      {/* Current Plan */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 mb-1">Current Plan</p>
            <h2 className="text-2xl font-bold text-slate-900">
              {subscription?.plan || 'FREE'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Status: {subscription?.status || 'ACTIVE'}
            </p>
            {subscription?.currentPeriodEnd && (
              <p className="text-sm text-slate-500 mt-1">
                Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
            {subscription?.cancelAtPeriodEnd && (
              <p className="text-sm text-amber-600 mt-1 font-medium">
                ⚠️ Will cancel at period end
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleManage}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition"
            >
              Manage
            </button>
            {subscription?.plan !== 'FREE' && !subscription?.cancelAtPeriodEnd && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Payment History
        </h2>

        {invoices.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No payments yet</p>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    ${inv.amount} {inv.currency.toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(inv.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      inv.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {inv.status}
                  </span>
                  {inv.pdfUrl && (
                    <a
                      href={inv.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-slate-200"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}