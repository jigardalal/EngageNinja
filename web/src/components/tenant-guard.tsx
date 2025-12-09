"use client";

import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { fetchCurrentUser } from '@/lib/tenant-api';

export default function TenantGuard({ children }: { children: ReactNode }) {
  const [hasTenant, setHasTenant] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkTenant = async () => {
      try {
        const user = await fetchCurrentUser();
        if (isMounted) {
          // Check JWT claim for activeTenantId (source of truth)
          setHasTenant(Boolean(user.activeTenantId));
        }
      } catch (err) {
        if (isMounted) {
          // If auth/tenant fetch fails, guard will show overlay
          setHasTenant(false);
          setError(err instanceof Error ? err.message : 'Unable to verify tenant context');
        }
      }
    };

    checkTenant();
    return () => {
      isMounted = false;
    };
  }, []);

  if (hasTenant === null) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">Checking tenant context…</p>
      </div>
    );
  }

  if (!hasTenant) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <section className="space-y-4 rounded-2xl border border-slate-200/70 bg-white/80 px-8 py-10 text-center shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/80">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-500">Guardrail Active</p>
          <h1 className="text-2xl font-semibold">Tenant required</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Every workspace action stays safe when you choose or create an active tenant. Pick a workspace to unlock the protected view.
          </p>
          <p className="text-xs uppercase tracking-wide text-slate-400">error: ACTIVE_TENANT_REQUIRED</p>
          {error && <p className="text-xs text-slate-500">{error}</p>}
          <Link
            href="/select-tenant"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Select or create tenant
          </Link>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
