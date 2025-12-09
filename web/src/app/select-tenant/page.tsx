"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createTenant, fetchCurrentUser, fetchTenants, TenantListItem } from "@/lib/tenant-api";
import { planGuidance, planLabels, planTierOptions, tenantLimitForPlan, PlanTier } from "@/lib/tenant-plan";

const createTenantSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(120, "Keep it under 120 characters"),
  planTier: z.enum(planTierOptions),
  region: z.string().min(2, "Region is required"),
  capabilityFlags: z.string().optional(),
});

type CreateTenantForm = z.infer<typeof createTenantSchema>;

export default function SelectTenantPage() {
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [planTier, setPlanTier] = useState<PlanTier>("starter");
  const [planQuota, setPlanQuota] = useState(tenantLimitForPlan("starter"));
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<CreateTenantForm>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: { name: "", region: "", planTier: "starter", capabilityFlags: "" },
  });

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchTenants(), fetchCurrentUser()])
      .then(([tenantList, user]) => {
        if (!isMounted) return;
        setTenants(tenantList);
        setPlanTier(user.planTier);
        setPlanQuota(tenantLimitForPlan(user.planTier));
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

  const isPlanMaxed = tenants.length >= planQuota;
  const remainingSlots = Math.max(0, planQuota - tenants.length);
  const planCopy = planGuidance[planTier] || planGuidance['starter'];

  const onSubmit = form.handleSubmit(async (values) => {
    setApiError(null);
    setSuccessMessage(null);
    if (isPlanMaxed) {
      setApiError("You have reached your tenant limit for this plan.");
      return;
    }

    const capabilityFlags = values.capabilityFlags
      ?.split(",")
      .map((flag) => flag.trim())
      .filter(Boolean) ?? [];

    try {
      const created = await createTenant({
        name: values.name.trim(),
        planTier: values.planTier,
        region: values.region.trim(),
        capabilityFlags,
      });

      setTenants((prev) => [...prev, created]);
      setSuccessMessage(`${created.name} created. You can now switch into the workspace.`);
      form.reset({
        name: "",
        region: "",
        planTier: values.planTier,
        capabilityFlags: "",
      });
    } catch (error) {
      setApiError((error as Error).message);
    }
  });

  const tenantCards = useMemo(
    () =>
      tenants.map((tenant) => (
        <article
          key={tenant.id}
          className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm shadow-slate-900/5 dark:border-slate-800/80 dark:bg-slate-900/70"
        >
          <header className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{tenant.name}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {tenant.role.replaceAll("_", " ").toUpperCase()}
              </p>
            </div>
            {tenant.settings?.planTier && (
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
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
    [tenants],
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800/80 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">Tenant creation</p>
          <h1 className="mt-2 text-3xl font-semibold">Choose or create the right tenant</h1>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Guardrails keep every workspace scoped to the right boundary. Create a tenant, pick your plan, and stay within the
            quota defenders ("{(planTier || 'starter').toUpperCase()} plan: {planCopy}").
          </p>
          <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">Active guard: ACTIVE_TENANT_REQUIRED</p>
          <div className="mt-4 rounded-2xl bg-slate-50/80 p-4 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
            <p>
              Plan limit: {planQuota} tenant{planQuota === 1 ? "" : "s"} ({tenants.length} used, {remainingSlots} available).
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{planGuidance[planTier]}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800/80 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Plan caps</p>
          <h2 className="mt-2 text-xl font-semibold">Plan quota snapshot</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>Starter ≤ 1 tenant, Growth ≤ 5 tenants, Agency ≤ 25 tenants.</p>
            <p>Open a workspace only when you have an active tenant for that region.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Existing tenants</h3>
            {!isLoading && tenants.length > 0 && (
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Guarded</span>
            )}
          </div>
          {isLoading && <p className="text-sm text-slate-500">Loading tenant list…</p>}
          {!isLoading && tenants.length === 0 && (
            <p className="text-sm text-slate-500">No tenants yet. Create one to access scoped dashboards.</p>
          )}
          <div className="grid gap-3">{tenantCards}</div>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800/80 dark:bg-slate-900/70"
        >
          <h3 className="text-lg font-semibold">Create a tenant</h3>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-[0.4em] text-slate-500">Workspace name</label>
            <input
              className="w-full rounded-2xl border border-slate-300/70 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-700/80 dark:bg-slate-900/60"
              placeholder="Acme Operations"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-rose-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-[0.4em] text-slate-500">Region</label>
            <input
              className="w-full rounded-2xl border border-slate-300/70 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-700/80 dark:bg-slate-900/60"
              placeholder="us-east-1"
              {...form.register("region")}
            />
            {form.formState.errors.region && (
              <p className="text-xs text-rose-500">{form.formState.errors.region.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-[0.4em] text-slate-500">Plan tier</label>
            <select
              className="w-full rounded-2xl border border-slate-300/70 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-700/80 dark:bg-slate-900/60"
              {...form.register("planTier")}
            >
              {planTierOptions.map((tier) => (
                <option key={tier} value={tier}>
                  {planLabels[tier]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-[0.4em] text-slate-500">Capability flags</label>
            <input
              className="w-full rounded-2xl border border-slate-300/70 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-700/80 dark:bg-slate-900/60"
              placeholder="resend, audit"
              {...form.register("capabilityFlags")}
            />
            <p className="text-xs text-slate-500">Comma-separated flags for guardrail experiences.</p>
          </div>

          {apiError && <p className="text-sm text-rose-500">{apiError}</p>}
          {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}

          <button
            type="submit"
            disabled={isPlanMaxed}
            className="w-full rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
          >
            {isPlanMaxed ? "Plan limit reached" : "Create tenant"}
          </button>
        </form>
      </section>
    </div>
  );
}
