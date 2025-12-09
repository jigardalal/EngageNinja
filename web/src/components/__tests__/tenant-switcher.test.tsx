import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TenantSwitcher from "../tenant-switcher";

describe("TenantSwitcher", () => {
  const tenantsResponse = [
    {
      id: "tenant-1",
      name: "Acme Agency",
      role: "owner",
      settings: { planTier: "starter", region: "us-east-1", capabilityFlags: ["core"] },
    },
  ];

  const mockFetch = jest.spyOn(global, "fetch");

  beforeEach(() => {
    document.cookie = "tenant_id=tenant-1";
    mockFetch.mockImplementation(async (input, init) => {
      const url = input.toString();
      if (url.includes("/tenants") && (!init?.method || init.method === "GET")) {
        return {
          ok: true,
          json: async () => ({ data: tenantsResponse }),
        } as Response;
      }
      if (url.includes("/auth/switch-tenant") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({ data: { activeTenantId: "tenant-1", planTier: "starter" } }),
        } as Response;
      }
      throw new Error("Unexpected fetch call");
    });
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  it("renders active tenant and switches when a new tenant is clicked", async () => {
    const user = userEvent.setup();

    render(<TenantSwitcher />);
    expect(await screen.findByText("Tenant")).toBeInTheDocument();

    const button = screen.getByRole("button", { name: /Tenant/i });
    await user.click(button);
    const dropdown = within(screen.getByText("Switch tenant").closest("div")!);
    const tenantButton = dropdown.getByRole("button", { name: /Acme Agency/i });
    expect(tenantButton).toBeTruthy();
    if (tenantButton) {
      await user.click(tenantButton);
    }

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/auth/switch-tenant"), expect.objectContaining({ method: "POST" })),
    );
  });
});
