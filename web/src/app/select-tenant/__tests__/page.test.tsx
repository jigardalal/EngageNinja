import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SelectTenantPage from "../page";

describe("SelectTenantPage", () => {
  const tenantsResponse = [
    {
      id: "tenant-1",
      name: "Acme Agency",
      role: "owner",
      settings: { planTier: "starter", region: "us-east-1", capabilityFlags: ["core"] },
    },
  ];

  const currentUser = {
    userId: "user-1",
    email: "hello@example.com",
    tenantId: "tenant-1",
    activeTenantId: "tenant-1",
    planTier: "growth",
    capabilityFlags: [],
    planQuota: 5,
  };

  const mockFetch = jest.spyOn(global, "fetch");

  beforeEach(() => {
    mockFetch.mockImplementation(async (input, init) => {
      const url = input.toString();
      if (url.includes("/tenants") && (!init?.method || init.method === "GET")) {
        return {
          ok: true,
          json: async () => ({ data: tenantsResponse }),
        } as Response;
      }
      if (url.includes("/auth/me")) {
        return {
          ok: true,
          json: async () => ({ data: currentUser }),
        } as Response;
      }
      if (url.includes("/tenants") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            data: {
              id: "tenant-new",
              name: "New Tenant",
              role: "owner",
              settings: { planTier: "starter", region: "nyc", capabilityFlags: [] },
            },
          }),
        } as Response;
      }
      throw new Error("Unexpected fetch");
    });
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  it("renders plan summary and existing tenants", async () => {
    render(<SelectTenantPage />);
    expect(await screen.findByText("Existing tenants")).toBeInTheDocument();
    expect(await screen.findByText("Acme Agency")).toBeInTheDocument();
    expect(screen.getByText("Plan limit: 5 tenants (1 used, 4 available).")).toBeInTheDocument();
  });

  it("creates a tenant when the form is submitted", async () => {
    const user = userEvent.setup();
    render(<SelectTenantPage />);
    await screen.findByText("Existing tenants");

    await user.type(screen.getByPlaceholderText("Acme Operations"), "New Tenant");
    await user.type(screen.getByPlaceholderText("us-east-1"), "nyc");
    await user.type(screen.getByPlaceholderText("resend, audit"), "resend");
    await user.click(screen.getByRole("button", { name: /Create tenant/i }));

    await waitFor(() => expect(screen.getByText("New Tenant")).toBeInTheDocument());
  });
});
