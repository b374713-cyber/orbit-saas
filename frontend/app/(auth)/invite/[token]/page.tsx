'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Mail,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  useInvitation,
  useAcceptInvitation,
  useDeclineInvitation,
} from '@/hooks/useInvitations';
import { formatDate } from '@/lib/utils';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const { user, isAuthenticated } = useAuth();
  const { data: invitation, isLoading, error } = useInvitation(token);
  const acceptInvitation = useAcceptInvitation();
  const declineInvitation = useDeclineInvitation();

  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAccept = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }

    setActionError('');
    try {
      const result = await acceptInvitation.mutateAsync(token);
      setSuccessMessage('Invitation accepted!');
      setTimeout(() => {
        router.push(`/organizations/${result.organizationId}`);
      }, 1500);
    } catch (err: any) {
      setActionError(
        err.response?.data?.message || 'Failed to accept invitation',
      );
    }
  };

  const handleDecline = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }

    if (!confirm('Are you sure you want to decline this invitation?')) return;

    setActionError('');
    try {
      await declineInvitation.mutateAsync(token);
      setSuccessMessage('Invitation declined');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setActionError(
        err.response?.data?.message || 'Failed to decline invitation',
      );
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error
  if (error || !invitation) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Invalid Invitation
        </h2>
        <p className="text-slate-600 mb-6">
          This invitation is invalid, expired, or has already been used.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition"
        >
          Go Home
        </Link>
      </div>
    );
  }

  // Already accepted/declined/expired
  if (invitation.status !== 'PENDING') {
    const config = {
      ACCEPTED: {
        icon: CheckCircle2,
        color: 'bg-green-100 text-green-600',
        title: 'Invitation Already Accepted',
        message: 'This invitation has already been used.',
      },
      DECLINED: {
        icon: XCircle,
        color: 'bg-red-100 text-red-600',
        title: 'Invitation Declined',
        message: 'This invitation was declined.',
      },
      EXPIRED: {
        icon: AlertTriangle,
        color: 'bg-orange-100 text-orange-600',
        title: 'Invitation Expired',
        message: 'This invitation has expired.',
      },
    };

    const { icon: Icon, color, title, message } =
      config[invitation.status as keyof typeof config];

    return (
      <div className="text-center py-8">
        <div
          className={`w-16 h-16 rounded-full ${color} flex items-center justify-center mx-auto mb-4`}
        >
          <Icon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-600 mb-6">{message}</p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Check if logged-in user's email matches
  const emailMismatch =
    isAuthenticated && user?.email && user.email !== invitation.email;

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          You've been invited!
        </h2>
        <p className="text-sm text-slate-600">
          {invitation.inviter?.name} invited you to join
        </p>
      </div>

      {/* Organization Card */}
      <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
            {invitation.organization?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 truncate">
              {invitation.organization?.name}
            </h3>
            <p className="text-sm text-slate-500">
              @{invitation.organization?.slug}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
          <div>
            <p className="text-xs text-slate-500 mb-1">Your Role</p>
            <span className="inline-block px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              {invitation.role}
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Invited Email</p>
            <p className="text-xs text-slate-900 truncate">
              {invitation.email}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      {actionError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Email Mismatch Warning */}
      {emailMismatch && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Wrong account</p>
            <p className="text-xs mt-0.5">
              This invitation was sent to <strong>{invitation.email}</strong>.
              You're logged in as <strong>{user?.email}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Not logged in */}
      {!isAuthenticated && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
          <p className="font-medium mb-1">Sign in required</p>
          <p className="text-xs">
            You need to sign in with <strong>{invitation.email}</strong> to
            accept this invitation.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {!isAuthenticated ? (
          <Link
            href={`/login?redirect=/invite/${token}`}
            className="block w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-center hover:from-blue-700 hover:to-indigo-700 transition"
          >
            Sign in to Accept
          </Link>
        ) : emailMismatch ? (
          <button
            disabled
            className="w-full py-3 rounded-lg bg-slate-200 text-slate-500 font-medium cursor-not-allowed"
          >
            Wrong Account
          </button>
        ) : (
          <>
            <button
              onClick={handleAccept}
              disabled={acceptInvitation.isPending || declineInvitation.isPending}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
            >
              {acceptInvitation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Accepting...
                </span>
              ) : (
                'Accept Invitation'
              )}
            </button>
            <button
              onClick={handleDecline}
              disabled={acceptInvitation.isPending || declineInvitation.isPending}
              className="w-full py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition disabled:opacity-50"
            >
              {declineInvitation.isPending ? 'Declining...' : 'Decline'}
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-slate-500 mt-6">
        This invitation expires on {formatDate(invitation.expiresAt)}
      </p>
    </div>
  );
}