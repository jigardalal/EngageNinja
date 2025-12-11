"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { fetchCurrentUser, fetchTenants, TenantListItem } from "@/lib/tenant-api";
import { planLabels } from "@/lib/tenant-plan";

export default function SelectTenantPage() {
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchTenants(), fetchCurrentUser()])
      .then(([tenantList, user]) => {
        if (!isMounted) return;
        setTenants(tenantList);
      })
      .catch(() => {
        if (isMounted) {
          setTenants([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const tenantCards = useMemo(
    () =>
      tenants.map((tenant) => (
        <article
          key={tenant.id}
          className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm shadow-slate-900/5 transition hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/70"
          onClick={() => {
            // Navigate to dashboard with selected tenant
            router.push(`/dashboard?tenantId=${tenant.id}`);
          }}
        >
          <header className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{tenant.name}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {tenant.role.replaceAll("_", " ").toUpperCase()}
              </p>
            </div>
            {tenant.settings?.planTier && (
              <span
                className={`rounded-full px-3 py-0.5 text-[11px] font-semibold ${
                  tenant.settings.planTier === 'enterprise'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200'
                    : tenant.settings.planTier === 'agency'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
                      : tenant.settings.planTier === 'growth'
                        ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                }`}
              >
                {planLabels[tenant.settings.planTier]}
              </span>
            )}
          </header>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Region: {tenant.settings?.region ?? "Region not set"}
          </p>
          {tenant.settings?.capabilityFlags?.length ? (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Capabilities: {tenant.settings.capabilityFlags.join(", ")}
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              No extra capabilities configured yet.
            </p>
          )}
        </article>
      )),
    [tenants, router],
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800/80 dark:bg-slate-900/70">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">Select workspace</p>
        <h1 className="mt-2 text-3xl font-semibold">Choose your workspace</h1>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          You are a member of multiple workspaces. Select one below to continue.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your workspaces</h3>
          {!isLoading && tenants.length > 0 && (
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {tenants.length} workspace{tenants.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        {isLoading && <p className="text-sm text-slate-500">Loading workspaces…</p>}
        {!isLoading && tenants.length === 0 && (
          <p className="text-sm text-slate-500">No workspaces found. Contact a workspace owner to be added.</p>
        )}
        <div className="grid gap-3 md:grid-cols-2">{tenantCards}</div>
      </section>
    </div>
  );
}
