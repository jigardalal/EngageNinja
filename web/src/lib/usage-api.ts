/**
 * Usage API client for fetching plan usage statistics
 */

export interface UsageStats {
  current: number;
  limit: number;
  percentage: number;
  resetDate?: Date;
}

export interface UsageData {
  monthlySends: UsageStats;
  aiTokens: UsageStats;
}

/**
 * Fetch usage data for a specific tenant
 */
export async function fetchUsage(tenantId: string): Promise<UsageData> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${apiUrl}/tenants/${tenantId}/usage`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch usage: ${response.statusText}`);
    }

    const { data } = await response.json() as { data: UsageData };

    // Convert resetDate string to Date if present
    if (data.monthlySends.resetDate) {
      data.monthlySends.resetDate = new Date(data.monthlySends.resetDate);
    }
    if (data.aiTokens.resetDate) {
      data.aiTokens.resetDate = new Date(data.aiTokens.resetDate);
    }

    return data;
  } catch (error) {
    console.error('Error fetching usage data:', error);
    throw error;
  }
}

/**
 * Get usage percentage with status color
 */
export function getUsageStatusColor(percentage: number): string {
  if (percentage >= 90) return 'text-red-600';
  if (percentage >= 75) return 'text-yellow-600';
  return 'text-green-600';
}

/**
 * Get background color for usage progress bar
 */
export function getProgressBarColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 75) return 'bg-yellow-500';
  return 'bg-green-500';
}

/**
 * Format number with commas for display
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Get days remaining until reset
 */
export function getDaysUntilReset(resetDate?: Date): number {
  if (!resetDate) return 0;

  const now = new Date();
  const diff = resetDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return Math.max(0, days);
}
