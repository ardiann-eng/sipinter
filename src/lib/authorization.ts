import { Role } from "@prisma/client";
import { AuthorizationError, type SessionUser } from "./types";

export const ALL_ROLES = Object.values(Role);
export const ADMIN_ROLES: readonly Role[] = [Role.ADMIN];
export const APPROVER_ROLES: readonly Role[] = [Role.APPROVER];
export const BORROWER_ROLES: readonly Role[] = [Role.BORROWER];
export const AUDIT_ROLES: readonly Role[] = [Role.ADMIN];

export function hasRole(role: Role, allowedRoles: readonly Role[]): boolean {
  return allowedRoles.includes(role);
}

export function assertRole(
  actor: Pick<SessionUser, "role">,
  allowedRoles: readonly Role[],
): void {
  if (!hasRole(actor.role, allowedRoles)) throw new AuthorizationError();
}

export function assertSameSKPD(
  actor: Pick<SessionUser, "skpdId">,
  skpdId: string,
): void {
  if (actor.skpdId !== skpdId) {
    throw new AuthorizationError("Data berasal dari SKPD lain");
  }
}

export function canManageUser(actorRole: Role, targetRole: Role): boolean {
  return actorRole === Role.ADMIN && targetRole !== Role.ADMIN;
}
