import { describe, expect, it } from "vitest";
import { hasScheduleCapacity, validateBorrowingPolicy } from "../src/lib/borrowing-policy";

describe("aturan operasional peminjaman", () => {
  const now = new Date("2026-09-25T08:00:00Z");

  it("menerapkan jeda minimum dan durasi maksimum", () => {
    expect(() => validateBorrowingPolicy(new Date("2026-09-27"), new Date("2026-10-03"), { minimumLeadDays: 2, standardDurationDays: 7 }, now)).not.toThrow();
    expect(() => validateBorrowingPolicy(new Date("2026-09-26"), new Date("2026-09-27"), { minimumLeadDays: 2, standardDurationDays: 7 }, now)).toThrow(/minimal 2 hari/);
    expect(() => validateBorrowingPolicy(new Date("2026-09-27"), new Date("2026-10-04"), { minimumLeadDays: 2, standardDurationDays: 7 }, now)).toThrow(/maksimal 7 hari/);
  });

  it("menolak alokasi melebihi unit pada periode bertumpang tindih", () => {
    expect(hasScheduleCapacity(1, 1, 0)).toBe(true);
    expect(hasScheduleCapacity(1, 1, 1)).toBe(false);
    expect(hasScheduleCapacity(3, 1, 2)).toBe(true);
  });
});
