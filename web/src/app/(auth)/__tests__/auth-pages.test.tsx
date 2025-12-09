import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LoginPage from '../login/page';
import SignupPage from '../signup/page';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: () => null }),
}));

const fetchMock = jest.fn();

beforeAll(() => {
  // @ts-expect-error - assign test fetch
  global.fetch = fetchMock;
});

beforeEach(() => {
  mockPush.mockReset();
  fetchMock.mockReset();
  document.cookie = '';
});

describe('SignupPage', () => {
  it('shows validation errors for empty form', async () => {
    render(<SignupPage />);
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      await screen.findByText(/email is required/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/password must include uppercase/i),
    ).toBeInTheDocument();
  });

  it('submits successfully and redirects to dashboard', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          user: { id: 'user-1', email: 'new@ex.com', lastUsedTenantId: 't-1' },
          tenant: { id: 't-1', name: 'Tenant One' },
          tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
        },
      }),
    });

    render(<SignupPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'new@ex.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'StrongPass1');
    await userEvent.type(screen.getByLabelText(/workspace name/i), 'Tenant One');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith('/dashboard?tenantId=t-1'),
    );
    expect(document.cookie).toContain('tenant_id=t-1');
  });

  it('sends auth requests with credentials included', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          user: { id: 'user-2', email: 'creds@ex.com', lastUsedTenantId: 't-2' },
          tenant: { id: 't-2', name: 'Tenant Two' },
          tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
        },
      }),
    });

    render(<SignupPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'creds@ex.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'StrongPass1');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const call = fetchMock.mock.calls[0];
    expect(call?.[1]?.credentials).toBe('include');
  });
});

describe('LoginPage', () => {
  it('shows API error for invalid credentials and stays on page', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid email or password' },
      }),
    });

    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@ex.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Badpass1');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText(/invalid email or password/i),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
