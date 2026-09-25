import "server-only";

import { db } from "./db";
export { validateBorrowingPolicy } from "./borrowing-policy";

export type OperationalSettings = {
  standardDurationDays: number;
  minimumLeadDays: number;
  returnReminder: boolean;
  overdueEscalation: boolean;
};

export const defaultOperationalSettings: OperationalSettings = {
  standardDurationDays: 7,
  minimumLeadDays: 2,
  returnReminder: true,
  overdueEscalation: true,
};

export async function getOperationalSettings(): Promise<OperationalSettings> {
  const records = await db.setting.findMany({
    where: { key: { in: Object.keys(defaultOperationalSettings) } },
  });
  const values = new Map(records.map((record) => [record.key, record.value]));
  return {
    standardDurationDays: Number(values.get("standardDurationDays") ?? defaultOperationalSettings.standardDurationDays),
    minimumLeadDays: Number(values.get("minimumLeadDays") ?? defaultOperationalSettings.minimumLeadDays),
    returnReminder: Boolean(values.get("returnReminder") ?? defaultOperationalSettings.returnReminder),
    overdueEscalation: Boolean(values.get("overdueEscalation") ?? defaultOperationalSettings.overdueEscalation),
  };
}
