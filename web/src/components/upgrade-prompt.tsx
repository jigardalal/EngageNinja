'use client';

import Link from 'next/link';
import { planLabels, planLimits, type PlanTier } from '@/lib/tenant-plan';

interface UpgradePromptProps {
  currentPlan: PlanTier;
  requiredFeature: string;
  message?: string;
  suggestedPlan?: PlanTier;
  className?: string;
}

const featureDescriptions: Record<string, string> = {
  email: 'Email channel support',
  ai_campaign_gen: 'AI-powered campaign generation',
  segments: 'Advanced audience segments',
  automation: 'Automation workflows',
  api: 'REST API access',
  webhooks: 'Webhook integrations',
  multi_tenant: 'Multiple workspace support',
  impersonation: 'Team member impersonation',
  advanced_automation: 'Advanced automation features',
  crm_adapters: 'CRM integrations',
  sso: 'Single Sign-On (SSO)',
  custom_residency: 'Custom data residency',
  dedicated_infra: 'Dedicated infrastructure',
  sla: 'Service Level Agreements',
};

const planUpgradePaths: Record<string, PlanTier[]> = {
  email: ['growth', 'agency', 'enterprise'],
  ai_campaign_gen: ['growth', 'agency', 'enterprise'],
  segments: ['growth', 'agency', 'enterprise'],
  automation: ['growth', 'agency', 'enterprise'],
  api: ['growth', 'agency', 'enterprise'],
  webhooks: ['growth', 'agency', 'enterprise'],
  multi_tenant: ['agency', 'enterprise'],
  impersonation: ['agency', 'enterprise'],
  advanced_automation: ['agency', 'enterprise'],
  crm_adapters: ['agency', 'enterprise'],
  sso: ['enterprise'],
  custom_residency: ['enterprise'],
  dedicated_infra: ['enterprise'],
  sla: ['enterprise'],
};

export function UpgradePrompt({
  currentPlan,
  requiredFeature,
  message,
  suggestedPlan,
  className = '',
}: UpgradePromptProps) {
  const featureDesc = featureDescriptions[requiredFeature] || requiredFeature;
  const availablePlans = planUpgradePaths[requiredFeature] || [];
  const recommendedPlan = suggestedPlan || availablePlans[0];

  return (
    <div className={`rounded-lg border border-yellow-200 bg-yellow-50 p-4 ${className}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            {message || `${featureDesc} is not available on your ${planLabels[currentPlan]} plan`}
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>Upgrade your plan to unlock this feature:</p>
            <ul className="mt-2 space-y-1">
              {availablePlans.map((plan) => (
                <li key={plan} className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-600" />
                  <span>
                    <strong>{planLabels[plan]}</strong>
                    {plan === recommendedPlan && ' (recommended)'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-medium text-yellow-700 hover:text-yellow-900"
            >
              View Pricing Plans
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
