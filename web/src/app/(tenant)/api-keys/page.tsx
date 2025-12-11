'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  listApiKeys,
  createApiKey,
  revokeApiKey,
  ApiKey,
  CreateApiKeyResponse,
  AuthSession,
  fetchCurrentUser,
} from '@/lib/tenant-api';
import { planLabels } from '@/lib/tenant-plan';

export default function ApiKeysPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [keyName, setKeyName] = useState('');
  const [keyDescription, setKeyDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState<CreateApiKeyResponse | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, [tenantId]);

  async function loadInitialData() {
    try {
      setError(null);
      const [apiKeys, currentSession] = await Promise.all([
        listApiKeys(tenantId),
        fetchCurrentUser(),
      ]);
      setKeys(apiKeys);
      setSession(currentSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    if (!keyName.trim()) return;

    setCreating(true);
    try {
      const newKey = await createApiKey(tenantId, {
        name: keyName,
        description: keyDescription || undefined,
      });
      setShowSecret(newKey);
      setKeyName('');
      setKeyDescription('');
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  }

  async function loadKeys() {
    try {
      const data = await listApiKeys(tenantId);
      setKeys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    }
  }

  async function handleRevokeKey(keyId: string) {
    if (!confirm('Are you sure you want to revoke this API key? Applications using it will stop working.')) return;

    setRevoking(keyId);
    try {
      await revokeApiKey(tenantId, keyId);
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke API key');
    } finally {
      setRevoking(null);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedSecret(text);
    setTimeout(() => setCopiedSecret(null), 2000);
  }

  const planTier = session?.planTier || 'starter';
  const supportsApiKeys = ['growth', 'agency', 'enterprise'].includes(planTier);
  const apiKeysDisabledReason = !supportsApiKeys
    ? `Your ${planLabels[planTier]} plan does not support API keys. Upgrade to Growth, Agency, or Enterprise plan.`
    : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Keys</h1>
        <p className="text-slate-600">Manage API keys for integrations and automated access</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-semibold text-sm">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Secret Display Modal */}
      {showSecret && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-2 text-slate-900">API Key Created</h3>
            <p className="text-sm text-slate-600 mb-4">
              ⚠️ <span className="font-semibold">Save your secret now.</span> You won't be able to see it again.
            </p>

            <div className="mb-4 p-3 bg-slate-100 rounded border border-slate-300">
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-slate-900 break-all">{showSecret.secret}</code>
                <button
                  onClick={() => copyToClipboard(showSecret.secret)}
                  className="px-2 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-700 flex-shrink-0"
                >
                  {copiedSecret === showSecret.secret ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-xs text-slate-600">
              <p><span className="font-semibold">Key ID:</span> {showSecret.id}</p>
              <p><span className="font-semibold">Name:</span> {showSecret.name}</p>
              <p><span className="font-semibold">Created:</span> {new Date(showSecret.createdAt).toLocaleString()}</p>
            </div>

            <button
              onClick={() => setShowSecret(null)}
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Plan Summary Card */}
      {session && (
        <div className="mb-8 p-6 border border-emerald-200 rounded-lg bg-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-1">
                Plan Information
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {planLabels[planTier]} Plan
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {supportsApiKeys ? 'API keys enabled' : 'API keys not available on this plan'}
              </p>
            </div>
            {!supportsApiKeys && (
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition text-sm">
                Upgrade Plan
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Key Section */}
      <div className="mb-8 p-6 border rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">Generate New API Key</h2>

        {apiKeysDisabledReason && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-amber-600 text-lg">⚠️</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 mb-1">API Keys Not Available</p>
                <p className="text-sm text-amber-800 mb-2">{apiKeysDisabledReason}</p>
                <button className="text-sm font-semibold text-amber-800 hover:text-amber-900 underline">
                  View Upgrade Options
                </button>
              </div>
            </div>
          </div>
        )}

        {!apiKeysDisabledReason && (
          <form onSubmit={handleCreateKey} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Key Name</label>
              <input
                type="text"
                placeholder="e.g., Production API Key"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={creating}
              />
              <p className="text-xs text-slate-500 mt-1">A friendly name to identify this key</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Used by our webhook service"
                value={keyDescription}
                onChange={(e) => setKeyDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={creating}
              />
            </div>

            <button
              type="submit"
              disabled={creating || !keyName.trim()}
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
            >
              {creating ? 'Creating...' : 'Generate API Key'}
            </button>
          </form>
        )}
      </div>

      {/* API Keys List */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">API Keys ({keys.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Last Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin inline-block w-4 h-4 border-2 border-slate-300 border-t-emerald-600 rounded-full mr-2"></div>
                      Loading API keys...
                    </div>
                  </td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <p className="text-slate-500">No API keys yet. Create one above to get started.</p>
                  </td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id} className="border-t border-slate-200 hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{key.name}</p>
                        {key.description && <p className="text-xs text-slate-500">{key.description}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          key.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {key.status === 'active' ? '● Active' : '✓ Revoked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {key.lastUsed !== null && key.lastUsed !== undefined
                        ? `${key.lastUsed} day${key.lastUsed === 1 ? '' : 's'} ago`
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {key.status === 'active' && (
                        <button
                          onClick={() => handleRevokeKey(key.id)}
                          disabled={revoking === key.id}
                          className="text-red-600 hover:text-red-800 font-semibold text-sm hover:underline disabled:text-slate-400"
                        >
                          {revoking === key.id ? 'Revoking...' : 'Revoke'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
