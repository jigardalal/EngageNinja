'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  listTenantMembers,
  inviteTenantMember,
  updateMemberRole,
  revokeMember,
  TenantMember,
  TenantRole,
  AuthSession,
  fetchCurrentUser,
} from '@/lib/tenant-api';
import { planLabels, memberLimitForPlan } from '@/lib/tenant-plan';

export default function MembersPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;

  const [members, setMembers] = useState<TenantMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TenantRole>(TenantRole.MARKETER);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [tenantId]);

  async function loadInitialData() {
    try {
      setError(null);
      const [members, currentSession] = await Promise.all([
        listTenantMembers(tenantId),
        fetchCurrentUser(),
      ]);
      setMembers(members);
      setSession(currentSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }

  async function loadMembers() {
    try {
      const data = await listTenantMembers(tenantId);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      await inviteTenantMember(tenantId, {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail('');
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  }

  async function handleRoleChange(memberId: string, newRole: TenantRole) {
    try {
      await updateMemberRole(tenantId, memberId, newRole);
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  }

  async function handleRevoke(memberId: string) {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await revokeMember(tenantId, memberId);
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  }

  // Calculate guardrails
  const planTier = session?.planTier || 'starter';
  const memberLimit = memberLimitForPlan(planTier);
  const pendingInvites = members.filter((m) => m.status === 'pending').length;
  const acceptedMembers = members.filter((m) => m.status === 'accepted').length;
  const canInvite = acceptedMembers < memberLimit;
  const inviteDisabledReason = !canInvite
    ? `Plan limit reached. Your ${planLabels[planTier]} plan allows ${memberLimit} members.`
    : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Team Members</h1>
        <p className="text-slate-600">Manage who has access to this tenant and assign roles</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-semibold text-sm">Error</p>
          <p className="text-sm mt-1">{error}</p>
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
                {acceptedMembers} of {memberLimit} members added
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-600">{memberLimit - acceptedMembers}</p>
              <p className="text-xs text-slate-600 uppercase tracking-wide">Slots Available</p>
            </div>
          </div>
        </div>
      )}

      {/* Invite Section with Guardrails */}
      <div className="mb-8 p-6 border rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">Invite Team Member</h2>

        {/* Guardrail Messages with Remediation */}
        {inviteDisabledReason && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-amber-600 text-lg">⚠️</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  Member Limit Reached
                </p>
                <p className="text-sm text-amber-800 mb-2">
                  Your {planLabels[planTier]} plan allows {memberLimit} team {memberLimit === 1 ? 'member' : 'members'}.
                  You've added {acceptedMembers} {acceptedMembers === 1 ? 'member' : 'members'}.
                </p>
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Next steps to invite more members:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Upgrade to Growth plan (10 members), Agency plan (100 members), or Enterprise plan (500 members)</li>
                    <li>Remove an existing member to free up a slot</li>
                    <li>Contact support if you need a custom plan</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Loop Context */}
        {!inviteDisabledReason && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Invite team members</span> to collaborate on campaigns.
              They'll receive an email invitation and can accept to join your workspace.
            </p>
          </div>
        )}

        {pendingInvites > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Pending Invitations:</span> {pendingInvites} team{' '}
              {pendingInvites === 1 ? 'member' : 'members'} waiting for acceptance.
            </p>
          </div>
        )}

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="teammate@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={inviting || !canInvite}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as TenantRole)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={inviting || !canInvite}
            >
              {Object.values(TenantRole).map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">Roles control what members can do in this tenant</p>
          </div>

          <button
            type="submit"
            disabled={inviting || !canInvite}
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
          >
            {inviting ? 'Sending Invitation...' : 'Send Invitation'}
          </button>
        </form>
      </div>

      {/* Members List */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">Team Members ({members.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Added
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
                      Loading members...
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <p className="text-slate-500">No team members yet. Invite someone above to get started!</p>
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="border-t border-slate-200 hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{member.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.id, e.target.value as TenantRole)
                        }
                        className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {Object.values(TenantRole).map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {member.status === 'pending' ? '⏳' : '✓'} {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleRevoke(member.id)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm hover:underline"
                      >
                        Remove
                      </button>
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
