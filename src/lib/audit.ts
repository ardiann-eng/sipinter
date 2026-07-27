import { AuditAction, Prisma } from "@prisma/client";
import type { RequestContext, SessionUser } from "./types";

type AuditClient = Pick<Prisma.TransactionClient, "auditLog">;

export type AuditInput = {
  action: AuditAction;
  module: string;
  objectType: string;
  objectId?: string | null;
  previousValue?: unknown;
  newValue?: unknown;
};

function json(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function writeAudit(
  tx: AuditClient,
  actor: SessionUser,
  input: AuditInput,
  context: RequestContext = {},
) {
  return tx.auditLog.create({
    data: {
      skpdId: actor.skpdId,
      userId: actor.id,
      action: input.action,
      module: input.module,
      objectType: input.objectType,
      objectId: input.objectId,
      previousValue: json(input.previousValue),
      newValue: json(input.newValue),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    },
  });
}
