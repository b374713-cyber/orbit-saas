'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AiProjectWizard } from '@/components/ai/AiProjectWizard';

function AiCreateContent() {
  const searchParams = useSearchParams();
  const [organizationId, setOrganizationId] = useState('');

  useEffect(() => {
    const orgId = searchParams.get('organizationId');
    if (orgId) {
      setOrganizationId(orgId);
    }
  }, [searchParams]);

  if (!organizationId) {
    return (
      <div className="p-8">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700">
          Please select an organization first. Add ?organizationId=xxx to URL.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <AiProjectWizard organizationId={organizationId} />
    </div>
  );
}

export default function AiCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <AiCreateContent />
    </Suspense>
  );
}