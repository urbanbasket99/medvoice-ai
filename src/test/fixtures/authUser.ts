import type { AuthUser } from "../../features/auth/types/auth.types";

export const createMockAuthUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: "11111111-1111-1111-1111-111111111111",
  email: "admin@medvoice.com",
  fullName: "System Administrator",
  isActive: true,
  isSuperuser: true,
  roles: ["Administrator"],
  permissions: ["patients:read", "patients:create", "doctors:read"],
  ...overrides,
});
