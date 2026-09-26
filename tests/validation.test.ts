import { describe, expect, it } from "vitest";
import { returnSubmissionSchema } from "../src/lib/validation";

const photo = (index: number) => ({
  fileUrl: `https://demo.invalid/return-${index}.jpg`,
  photoType: "ITEM",
});

const submission = (photoCount: number) => ({
  actualReturnDate: new Date(),
  submittedCondition: "GOOD",
  completenessStatus: "COMPLETE",
  photos: Array.from({ length: photoCount }, (_, index) => photo(index)),
});

describe("validasi pengembalian", () => {
  it("menerima pengembalian tanpa foto atau hingga 4 foto", () => {
    expect(returnSubmissionSchema.safeParse(submission(0)).success).toBe(true);
    expect(returnSubmissionSchema.safeParse(submission(1)).success).toBe(true);
    expect(returnSubmissionSchema.safeParse(submission(2)).success).toBe(true);
    expect(returnSubmissionSchema.safeParse(submission(4)).success).toBe(true);
  });

  it("menolak lebih dari 4 foto", () => {
    expect(returnSubmissionSchema.safeParse(submission(5)).success).toBe(false);
  });
});
