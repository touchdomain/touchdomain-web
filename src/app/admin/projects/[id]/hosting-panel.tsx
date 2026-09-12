'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Loader2, Server, RefreshCw, PauseCircle, PlayCircle, Ban } from 'lucide-react';
import {
  provisionHosting,
  refreshHostingStatus,
  suspendHosting,
  unsuspendHosting,
  terminateHosting,
} from '@/lib/actions/whmcs';
import { Card, SectionTitle, Badge, inputClass, btnPrimary, btnSecondary } from '@/components/portal/ui';

interface Props {
  projectId: string;
  whmcsServiceId: string | null;
  whmcsDomain: string | null;
  whmcsStatus: string | null;
  configured: boolean;
}

export default function HostingPanel({ projectId, whmcsServiceId, whmcsDomain, whmcsStatus, configured }: Props) {
  const [pending, start] = useTransition();
  const [productId, setProductId] = useState('');
  const [domain, setDomain] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [address1, setAddress1] = useState('');

  if (!configured) {
    return (
      <Card>
        <div className="mb-1 flex items-center gap-2">
          <Server className="h-4 w-4 text-gray-300" />
          <SectionTitle className="mb-0">Hosting (HostAfrica)</SectionTitle>
        </div>
        <p className="text-xs text-gray-400">
          WHMCS isn&apos;t connected yet — add <code>WHMCS_API_URL</code>, <code>WHMCS_API_IDENTIFIER</code> and{' '}
          <code>WHMCS_API_SECRET</code> once the reseller account is set up.
        </p>
      </Card>
    );
  }

  const run = (fn: () => Promise<{ success: boolean; error?: string }>, ok: string) =>
    start(async () => {
      const res = await fn();
      if (res.success) toast.success(ok);
      else toast.error(res.error);
    });

  if (whmcsServiceId) {
    const tone = whmcsStatus === 'Active' ? 'green' : whmcsStatus === 'Suspended' ? 'amber' : whmcsStatus === 'Terminated' ? 'red' : 'neutral';
    return (
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-td-accent" />
            <SectionTitle className="mb-0">Hosting (HostAfrica)</SectionTitle>
          </div>
          <Badge tone={tone}>{whmcsStatus || 'Unknown'}</Badge>
        </div>
        <p className="mb-3 text-sm text-gray-500">
          {whmcsDomain || 'No domain on record'} · service #{whmcsServiceId}
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => run(() => refreshHostingStatus(projectId), 'Status refreshed.')} disabled={pending} className={btnSecondary}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh
          </button>
          {whmcsStatus !== 'Suspended' && (
            <button onClick={() => run(() => suspendHosting(projectId), 'Suspended.')} disabled={pending} className={btnSecondary}>
              <PauseCircle className="h-4 w-4" /> Suspend
            </button>
          )}
          {whmcsStatus === 'Suspended' && (
            <button onClick={() => run(() => unsuspendHosting(projectId), 'Reactivated.')} disabled={pending} className={btnSecondary}>
              <PlayCircle className="h-4 w-4" /> Unsuspend
            </button>
          )}
          <button
            onClick={() => {
              if (confirm('Terminate this hosting account? This is permanent on HostAfrica’s side.')) {
                run(() => terminateHosting(projectId), 'Terminated.');
              }
            }}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            <Ban className="h-3.5 w-3.5" /> Terminate
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2">
        <Server className="h-4 w-4 text-td-accent" />
        <SectionTitle className="mb-0">Hosting (HostAfrica)</SectionTitle>
      </div>
      <p className="mb-3 text-xs text-gray-400">
        Creates the client on WHMCS (if needed) and provisions the hosting account. Billing to the client still runs
        through this portal&apos;s invoices — WHMCS only handles the underlying account.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-td-dark">WHMCS product/package id *</span>
          <input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="e.g. 12" className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-td-dark">Billing cycle</span>
          <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} className={inputClass}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="semiannually">Semi-annually</option>
            <option value="annually">Annually</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-td-dark">Domain</span>
          <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="clientdomain.co.za" className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-td-dark">Billing address *</span>
          <input value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="Street, town" className={inputClass} />
        </label>
      </div>
      <button
        onClick={() => {
          const fd = new FormData();
          fd.append('productId', productId.trim());
          fd.append('domain', domain.trim());
          fd.append('billingCycle', billingCycle);
          fd.append('address1', address1.trim());
          run(() => provisionHosting(projectId, fd), 'Hosting provisioned via HostAfrica.');
        }}
        disabled={pending}
        className={`${btnPrimary} mt-3`}
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Provision via HostAfrica
      </button>
    </Card>
  );
}
