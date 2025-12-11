'use client';

import { useEffect, useState } from 'react';
import { fetchUsage, getProgressBarColor, getUsageStatusColor, formatNumber, getDaysUntilReset, type UsageData } from '@/lib/usage-api';

interface UsageProgressProps {
  tenantId: string;
  showAiTokens?: boolean;
}

export function UsageProgress({ tenantId, showAiTokens = true }: UsageProgressProps) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsage = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUsage(tenantId);
        setUsage(data);
      } catch (err) {
        setError('Failed to load usage data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUsage();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        {showAiTokens && <div className="h-6 bg-gray-200 rounded animate-pulse" />}
      </div>
    );
  }

  if (error || !usage) {
    return <div className="text-red-600 text-sm">{error || 'Failed to load usage data'}</div>;
  }

  const daysUntilReset = getDaysUntilReset(usage.monthlySends.resetDate);

  return (
    <div className="space-y-6">
      {/* Monthly Sends Usage */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <label className="text-sm font-medium text-gray-700">Monthly Sends</label>
          <span className={`text-sm font-semibold ${getUsageStatusColor(usage.monthlySends.percentage)}`}>
            {formatNumber(usage.monthlySends.current)} / {formatNumber(usage.monthlySends.limit)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(usage.monthlySends.percentage)}`}
            style={{ width: `${Math.min(usage.monthlySends.percentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          {usage.monthlySends.percentage.toFixed(1)}% used • Resets in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}
        </p>
      </div>

      {/* AI Tokens Usage */}
      {showAiTokens && (
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label className="text-sm font-medium text-gray-700">AI Tokens</label>
            <span className={`text-sm font-semibold ${getUsageStatusColor(usage.aiTokens.percentage)}`}>
              {formatNumber(usage.aiTokens.current)} / {formatNumber(usage.aiTokens.limit)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(usage.aiTokens.percentage)}`}
              style={{ width: `${Math.min(usage.aiTokens.percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {usage.aiTokens.percentage.toFixed(1)}% used • Resets in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
