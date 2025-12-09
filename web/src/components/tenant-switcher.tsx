"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { fetchTenants, switchTenant, TenantListItem } from '@/lib/tenant-api';
import { getCookie } from '@/lib/cookies';
import { planLabels } from '@/lib/tenant-plan';

export default function TenantSwitcher() {
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const tenantId = useMemo(() => getCookie('tenant_id'), []);
  const activeTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === tenantId),
    [tenantId, tenants],
  );

  useEffect(() => {
    let isActive = true;
    fetchTenants()
      .then((items) => {
        if (isActive) {
          setTenants(items);
        }
      })
      .catch(() => {
        setTenants([]);
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });
    return () => {
      isActive = false;
    };
  }, []);

  const displayName = activeTenant?.name ?? 'Choose tenant';
  const planBadge = activeTenant?.settings?.planTier ? planLabels[activeTenant.settings.planTier] : 'No plan';

  const handleSwitch = async (id: string) => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await switchTenant(id);
      if (process.env.NODE_ENV !== "test") {
        window.location.reload();
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
      >
        <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tenant</span>
        <span className="font-semibold">{displayName}</span>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-200">
          {planBadge}
        </span>
        <span aria-hidden className="text-slate-400 dark:text-slate-300">
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl shadow-slate-900/10 dark:border-slate-800/70 dark:bg-slate-900/80">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Switch tenant
          </p>
          <div className="mt-3 space-y-3">
            {isLoading && <p className="text-sm text-slate-500">Loading tenants…</p>}
            {!isLoading && tenants.length === 0 && (
              <p className="text-sm text-slate-500">Create a tenant to get started.</p>
            )}
            {!isLoading &&
              tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => handleSwitch(tenant.id)}
                  disabled={isBusy}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-2 text-left text-sm transition hover:border-emerald-200 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{tenant.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{tenant.settings?.region ?? 'Region unknown'}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                    {tenant.settings?.capabilityFlags?.length ? tenant.settings.capabilityFlags.join(', ') : 'Core'}
                  </span>
                </button>
              ))}
            <Link href="/select-tenant" className="block rounded-xl bg-slate-900 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white">
              Create tenant
            </Link>
          </div>
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">Impersonation: Off</p>
        </div>
      )}
    </div>
  );
}
