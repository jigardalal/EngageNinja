import TenantGuard from "@/components/tenant-guard";

export default function TenantLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <TenantGuard>{children}</TenantGuard>;
}
