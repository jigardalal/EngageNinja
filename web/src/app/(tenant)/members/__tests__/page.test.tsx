import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams } from 'next/navigation';
import MembersPage from '../page';
import * as tenantApi from '@/lib/tenant-api';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

// Mock tenant API
jest.mock('@/lib/tenant-api', () => ({
  listTenantMembers: jest.fn(),
  inviteTenantMember: jest.fn(),
  updateMemberRole: jest.fn(),
  revokeMember: jest.fn(),
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
    (useParams as jest.Mock).mockReturnValue({ tenantId: 'tenant-1' });
    jest.clearAllMocks();
  });

  it('renders the members page title', async () => {
    (tenantApi.listTenantMembers as jest.Mock).mockResolvedValueOnce([]);

    render(<MembersPage />);

    expect(screen.getByRole('heading', { name: /tenant members/i })).toBeInTheDocument();
  });

  it('loads and displays members', async () => {
    (tenantApi.listTenantMembers as jest.Mock).mockResolvedValueOnce(mockMembers);

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText('member1@test.com')).toBeInTheDocument();
      expect(screen.getByText('member2@test.com')).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    (tenantApi.listTenantMembers as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<MembersPage />);

    expect(screen.getByText('Loading members...')).toBeInTheDocument();
  });

  it('displays error message on load failure', async () => {
    const error = new Error('Network error');
    (tenantApi.listTenantMembers as jest.Mock).mockRejectedValueOnce(error);

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays empty state when no members', async () => {
    (tenantApi.listTenantMembers as jest.Mock).mockResolvedValueOnce([]);

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText('No members yet')).toBeInTheDocument();
    });
  });

  describe('Invite Member', () => {
    it('invites a new member', async () => {
      (tenantApi.listTenantMembers as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockMembers);
      (tenantApi.inviteTenantMember as jest.Mock).mockResolvedValueOnce(
        mockMembers[0]
      );

      const user = userEvent.setup();
      render(<MembersPage />);

      const emailInput = screen.getByPlaceholderText('Email address');
      await user.type(emailInput, 'newmember@test.com');

      const inviteButton = screen.getByRole('button', { name: /invite/i });
      await user.click(inviteButton);

      await waitFor(() => {
        expect(tenantApi.inviteTenantMember).toHaveBeenCalledWith('tenant-1', {
          email: 'newmember@test.com',
          role: 'marketer',
        });
      });
    });

    it('allows role selection when inviting', async () => {
      (tenantApi.listTenantMembers as jest.Mock).mockResolvedValueOnce([]);
      (tenantApi.inviteTenantMember as jest.Mock).mockResolvedValueOnce(
        mockMembers[0]
      );

      const user = userEvent.setup();
      render(<MembersPage />);

      const roleSelect = screen.getAllByDisplayValue('marketer')[0];
      await user.selectOptions(roleSelect, 'admin');

      const emailInput = screen.getByPlaceholderText('Email address');
      await user.type(emailInput, 'admin@test.com');

      const inviteButton = screen.getByRole('button', { name: /invite/i });
      await user.click(inviteButton);

      await waitFor(() => {
        expect(tenantApi.inviteTenantMember).toHaveBeenCalledWith('tenant-1', {
          email: 'admin@test.com',
          role: 'admin',
        });
      });
    });

    it('shows error on invite failure', async () => {
      (tenantApi.listTenantMembers as jest.Mock).mockResolvedValueOnce([]);
      (tenantApi.inviteTenantMember as jest.Mock).mockRejectedValueOnce(
        new Error('Email already invited')
      );

      const user = userEvent.setup();
      render(<MembersPage />);

      const emailInput = screen.getByPlaceholderText('Email address');
      await user.type(emailInput, 'duplicate@test.com');

      const inviteButton = screen.getByRole('button', { name: /invite/i });
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('Email already invited')).toBeInTheDocument();
      });
    });

    it('clears email input after successful invite', async () => {
      (tenantApi.listTenantMembers as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockMembers);
      (tenantApi.inviteTenantMember as jest.Mock).mockResolvedValueOnce(
        mockMembers[0]
      );

      const user = userEvent.setup();
      render(<MembersPage />);

      const emailInput = screen.getByPlaceholderText(
        'Email address'
      ) as HTMLInputElement;
      await user.type(emailInput, 'newmember@test.com');

      const inviteButton = screen.getByRole('button', { name: /invite/i });
      await user.click(inviteButton);

      await waitFor(() => {
        expect(emailInput.value).toBe('');
      });
    });
  });

  describe('Member Actions', () => {
    it('displays status badge for members', async () => {
      (tenantApi.listTenantMembers as jest.Mock).mockResolvedValueOnce(mockMembers);

      render(<MembersPage />);

      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Accepted')).toBeInTheDocument();
      });
    });

    it('updates member role', async () => {
      (tenantApi.listTenantMembers as jest.Mock)
        .mockResolvedValueOnce(mockMembers)
        .mockResolvedValueOnce(mockMembers);
      (tenantApi.updateMemberRole as jest.Mock).mockResolvedValueOnce(
        mockMembers[0]
      );

      const user = userEvent.setup();
      render(<MembersPage />);

      await waitFor(() => {
        expect(screen.getByText('member1@test.com')).toBeInTheDocument();
      });

      // Find and change the role for the first member
      const roleSelects = screen.getAllByDisplayValue('marketer');
      if (roleSelects.length > 0) {
        await user.selectOptions(roleSelects[0], 'admin');
      }

      await waitFor(() => {
        expect(tenantApi.updateMemberRole).toHaveBeenCalled();
      });
    });

    it('removes member with confirmation', async () => {
      (tenantApi.listTenantMembers as jest.Mock)
        .mockResolvedValueOnce(mockMembers)
        .mockResolvedValueOnce(mockMembers.slice(1));
      (tenantApi.revokeMember as jest.Mock).mockResolvedValueOnce(undefined);

      const user = userEvent.setup();
      window.confirm = jest.fn(() => true);

      render(<MembersPage />);

      await waitFor(() => {
        expect(screen.getByText('member1@test.com')).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      if (removeButtons.length > 0) {
        await user.click(removeButtons[0]);
      }

      await waitFor(() => {
        expect(tenantApi.revokeMember).toHaveBeenCalledWith('tenant-1', '1');
      });
    });

    it('does not remove member if confirmation cancelled', async () => {
      (tenantApi.listTenantMembers as jest.Mock).mockResolvedValueOnce(mockMembers);
      window.confirm = jest.fn(() => false);

      const user = userEvent.setup();
      render(<MembersPage />);

      await waitFor(() => {
        expect(screen.getByText('member1@test.com')).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      if (removeButtons.length > 0) {
        await user.click(removeButtons[0]);
      }

      expect(tenantApi.revokeMember).not.toHaveBeenCalled();
    });

    it('shows error on remove failure', async () => {
      (tenantApi.listTenantMembers as jest.Mock).mockResolvedValueOnce(mockMembers);
      (tenantApi.revokeMember as jest.Mock).mockRejectedValueOnce(
        new Error('Permission denied')
      );
      window.confirm = jest.fn(() => true);

      const user = userEvent.setup();
      render(<MembersPage />);

      await waitFor(() => {
        expect(screen.getByText('member1@test.com')).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      if (removeButtons.length > 0) {
        await user.click(removeButtons[0]);
      }

      await waitFor(() => {
        expect(screen.getByText('Permission denied')).toBeInTheDocument();
      });
    });
  });
});
