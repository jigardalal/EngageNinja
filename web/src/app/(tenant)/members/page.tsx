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
} from '@/lib/tenant-api';

export default function MembersPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;

  const [members, setMembers] = useState<TenantMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TenantRole>(TenantRole.MARKETER);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [tenantId]);

  async function loadMembers() {
    try {
      setError(null);
      const data = await listTenantMembers(tenantId);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setLoading(false);
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tenant Members</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Invite Section */}
      <div className="mb-8 p-6 border rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">Invite Member</h2>
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            placeholder="Email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
            disabled={inviting}
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as TenantRole)}
            className="px-3 py-2 border rounded"
            disabled={inviting}
          >
            {Object.values(TenantRole).map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={inviting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {inviting ? 'Inviting...' : 'Invite'}
          </button>
        </form>
      </div>

      {/* Members List */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No members yet
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{member.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.id, e.target.value as TenantRole)
                        }
                        className="px-2 py-1 border rounded"
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
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          member.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleRevoke(member.id)}
                        className="text-red-600 hover:text-red-800 font-semibold"
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
