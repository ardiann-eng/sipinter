import { Role } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { assertRole, canManageUser, hasRole } from "../src/lib/authorization";

describe("otorisasi SIPINTER", () => {
  it("hanya menerima empat role domain", () => {
    expect(Object.values(Role)).toEqual(["ADMIN", "BORROWER", "APPROVER"]);
    expect(hasRole(Role.ADMIN, [Role.ADMIN])).toBe(true);
    expect(() => assertRole({ role: Role.BORROWER }, [Role.ADMIN])).toThrow();
  });

  it("hanya admin dapat mengelola user non-admin", () => {
    expect(canManageUser(Role.ADMIN, Role.BORROWER)).toBe(true);
    expect(canManageUser(Role.ADMIN, Role.ADMIN)).toBe(false);
    expect(canManageUser(Role.APPROVER, Role.BORROWER)).toBe(false);
  });
});
