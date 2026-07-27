import { BorrowingStatus as S, Role } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { ReturnVerificationResult } from "@prisma/client";
import { authorizeTransition, borrowingTransitions, canRestoreStock, lifecycleTransitions, shouldCreateApprovalRecord } from "../src/lib/workflow";

describe("workflow SIPINTER literal", () => {
  it("memiliki tepat 14 status sesuai spesifikasi", () => {
    expect(Object.values(S)).toEqual([
      "DRAFT",
      "WAITING_ADMIN_VERIFICATION",
      "REVISION_REQUIRED",
      "WAITING_SEKDA_APPROVAL",
      "APPROVED",
      "REJECTED",
      "READY_FOR_HANDOVER",
      "BORROWED",
      "WAITING_RETURN",
      "WAITING_RETURN_VERIFICATION",
      "RETURN_PROBLEM",
      "COMPLETED",
      "CANCELLED",
      "OVERDUE",
    ]);
  });

  it("memiliki tepat transition map utama yang ditentukan", () => {
    expect(borrowingTransitions.map(({ from, to }) => `${from}->${to}`)).toEqual([
      `${S.DRAFT}->${S.WAITING_ADMIN_VERIFICATION}`,
      `${S.WAITING_ADMIN_VERIFICATION}->${S.REVISION_REQUIRED}`,
      `${S.WAITING_ADMIN_VERIFICATION}->${S.WAITING_SEKDA_APPROVAL}`,
      `${S.WAITING_ADMIN_VERIFICATION}->${S.REJECTED}`,
      `${S.REVISION_REQUIRED}->${S.WAITING_ADMIN_VERIFICATION}`,
      `${S.WAITING_SEKDA_APPROVAL}->${S.APPROVED}`,
      `${S.WAITING_SEKDA_APPROVAL}->${S.REJECTED}`,
      `${S.APPROVED}->${S.READY_FOR_HANDOVER}`,
      `${S.READY_FOR_HANDOVER}->${S.BORROWED}`,
      `${S.BORROWED}->${S.WAITING_RETURN}`,
      `${S.WAITING_RETURN}->${S.WAITING_RETURN_VERIFICATION}`,
      `${S.WAITING_RETURN_VERIFICATION}->${S.COMPLETED}`,
      `${S.WAITING_RETURN_VERIFICATION}->${S.RETURN_PROBLEM}`,
      `${S.RETURN_PROBLEM}->${S.COMPLETED}`,
    ]);
  });

  it("menerapkan role dan catatan wajib", () => {
    expect(() => authorizeTransition(S.DRAFT, S.WAITING_ADMIN_VERIFICATION, Role.BORROWER)).not.toThrow();
    expect(() => authorizeTransition(S.WAITING_ADMIN_VERIFICATION, S.WAITING_SEKDA_APPROVAL, Role.ADMIN)).not.toThrow();
    expect(() => authorizeTransition(S.WAITING_SEKDA_APPROVAL, S.APPROVED, Role.APPROVER)).not.toThrow();
    expect(() => authorizeTransition(S.WAITING_SEKDA_APPROVAL, S.REJECTED, Role.APPROVER)).toThrow("Catatan wajib");
    expect(() => authorizeTransition(S.DRAFT, S.BORROWED, Role.BORROWER)).toThrow();
  });

  it("membuat ApprovalRecord hanya dari keputusan Sekda", () => {
    expect(shouldCreateApprovalRecord(S.WAITING_SEKDA_APPROVAL, S.APPROVED)).toBe(true);
    expect(shouldCreateApprovalRecord(S.WAITING_SEKDA_APPROVAL, S.REJECTED)).toBe(true);
    expect(shouldCreateApprovalRecord(S.WAITING_ADMIN_VERIFICATION, S.REJECTED)).toBe(false);
  });

  it("mendokumentasikan lifecycle overlay termasuk overdue yang tetap returnable", () => {
    expect(lifecycleTransitions.map(({ from, to }) => `${from}->${to}`)).toEqual([
      `${S.DRAFT}->${S.CANCELLED}`,
      `${S.BORROWED}->${S.OVERDUE}`,
      `${S.OVERDUE}->${S.WAITING_RETURN}`,
    ]);
    expect(() => authorizeTransition(S.OVERDUE, S.WAITING_RETURN, Role.BORROWER)).not.toThrow();
  });

  it("memulihkan stok hanya untuk barang serviceable atau resolusi eksplisit", () => {
    expect(canRestoreStock({
      itemComplete: true,
      physicallyIntact: true,
      functioningProperly: true,
      result: ReturnVerificationResult.ACCEPTED,
    })).toBe(true);
    expect(canRestoreStock({
      itemComplete: false,
      physicallyIntact: true,
      functioningProperly: true,
      result: ReturnVerificationResult.ACCEPTED,
    })).toBe(false);
    expect(canRestoreStock({
      itemComplete: false,
      physicallyIntact: false,
      functioningProperly: false,
      result: ReturnVerificationResult.PROBLEM,
    })).toBe(false);
    expect(canRestoreStock({
      itemComplete: false,
      physicallyIntact: false,
      functioningProperly: false,
      result: ReturnVerificationResult.PROBLEM,
    }, true)).toBe(true);
  });
});
