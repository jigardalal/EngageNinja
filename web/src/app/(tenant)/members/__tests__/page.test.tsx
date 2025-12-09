import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams } from 'next/navigation';
import MembersPage from '../page';
import * as tenantApi from '@/lib/tenant-api';
import type { AuthSession } from '@/lib/tenant-api';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

const defaultSession: AuthSession = {
  userId: 'user-1',
  email: 'user@test.com',
  tenantId: 'tenant-1',
  activeTenantId: 'tenant-1',
  planTier: 'growth',
  capabilityFlags: [],
  planQuota: 5,
};

// Mock tenant API
jest.mock('@/lib/tenant-api', () => ({
  listTenantMembers: jest.fn(),
  inviteTenantMember: jest.fn(),
  updateMemberRole: jest.fn(),
  revokeMember: jest.fn(),
  fetchCurrentUser: jest.fn(),
  TenantRole: {
    OWNER: 'owner',
    ADMIN: 'admin',
    MARKETER: 'marketer',
    AGENCY_MARKETER: 'agency_marketer',
    VIEWER: 'viewer',
  },
}));

const mockMembers = [
  {
    id: '1',
    email: 'member1@test.com',
    role: 'marketer',
    status: 'accepted' as const,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'member2@test.com',
    role: 'viewer',
    status: 'pending' as const,
    createdAt: '2025-01-02T00:00:00Z',
  },
];

describe('MembersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ tenantId: 'tenant-1' });
    (tenantApi.fetchCurrentUser as jest.Mock).mockResolvedValue(defaultSession);
  });

  it('renders the heading and plan summary', async () => {
    (tenantApi.listTenantMembers as jest.Mock).mockResolvedValueOnce(mockMembers);

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText('Team Members')).toBeInTheDocument();
      expect(screen.getByText('Plan Information')).toBeInTheDocument();
      expect(screen.getByText(/Growth Plan/)).toBeInTheDocument();
      expect(screen.getByText(/Pending Invitations/i)).toBeInTheDocument();
    });
  });

  it('shows pending invite count when there are pending members', async () => {
    (tenantApi.listTenantMembers as jest.Mock).mockResolvedValueOnce(mockMembers);

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText('Pending Invitations:')).toBeInTheDocument();
      expect(screen.getByText(/1 team member waiting for acceptance/i)).toBeInTheDocument();
    });
  });

  it('disables the invite flow when plan limit is reached', async () => {
    (tenantApi.listTenantMembers as jest.Mock).mockResolvedValueOnce(
      Array(5)
        .fill(null)
        .map((_, index) => ({
          id: `member-${index}`,
          email: `member${index}@test.com`,
          role: 'marketer',
          status: 'accepted' as const,
          createdAt: '2025-01-01T00:00:00Z',
        })),
    );
    (tenantApi.fetchCurrentUser as jest.Mock).mockResolvedValueOnce({
      ...defaultSession,
      planTier: 'growth',
      planQuota: 5,
    });

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText('Member Limit Reached')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send Invitation/i })).toBeDisabled();
    });
  });

  it('invites a new member', async () => {
    (tenantApi.listTenantMembers as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([mockMembers[0]]);
    (tenantApi.inviteTenantMember as jest.Mock).mockResolvedValueOnce(mockMembers[0]);

    const user = userEvent.setup();
    render(<MembersPage />);

    const emailInput = screen.getByPlaceholderText('teammate@example.com');
    await user.type(emailInput, 'newmember@test.com');

    const inviteButton = screen.getByRole('button', { name: /Send Invitation/i });
    await user.click(inviteButton);

    await waitFor(() => {
      expect(tenantApi.inviteTenantMember).toHaveBeenCalledWith('tenant-1', {
        email: 'newmember@test.com',
        role: 'marketer',
      });
    });
  });

  it('calls updateMemberRole API when a role is changed', async () => {
    (tenantApi.listTenantMembers as jest.Mock)
      .mockResolvedValueOnce(mockMembers)
      .mockResolvedValueOnce(mockMembers);
    (tenantApi.updateMemberRole as jest.Mock).mockResolvedValueOnce({
      ...mockMembers[0],
      role: 'admin',
    });

    const user = userEvent.setup();
    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText('member1@test.com')).toBeInTheDocument();
    });

    const row = screen.getByText('member1@test.com').closest('tr');
    expect(row).toBeTruthy();
    const roleSelect = within(row!).getByRole('combobox');
    await user.selectOptions(roleSelect, 'admin');

    await waitFor(() => {
      expect(tenantApi.updateMemberRole).toHaveBeenCalledWith('tenant-1', '1', 'admin');
    });
  });

  it('removes a member after confirmation', async () => {
    (tenantApi.listTenantMembers as jest.Mock)
      .mockResolvedValueOnce(mockMembers)
      .mockResolvedValueOnce([mockMembers[1]]);
    (tenantApi.revokeMember as jest.Mock).mockResolvedValueOnce(undefined);

    window.confirm = jest.fn(() => true);
    const user = userEvent.setup();
    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText('member1@test.com')).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    await waitFor(() => {
      expect(tenantApi.revokeMember).toHaveBeenCalledWith('tenant-1', '1');
    });
  });

  it('shows an error message when members fail to load', async () => {
    const error = new Error('Network error');
    (tenantApi.listTenantMembers as jest.Mock).mockRejectedValueOnce(error);

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('renders the empty state when no members exist', async () => {
    (tenantApi.listTenantMembers as jest.Mock).mockResolvedValueOnce([]);

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText(/No team members yet/)).toBeInTheDocument();
    });
  });
});
