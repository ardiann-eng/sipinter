import type { HTMLAttributes } from "react";
import { cx } from "./primitives";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "maroon";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

export function Badge({ tone = "neutral", dot, className, children, ...props }: BadgeProps) {
  return <span className={cx("badge", `badge--${tone}`, className)} {...props}>{dot && <span className="badge__dot" />}{children}</span>;
}

export const statusTone = {
  AVAILABLE: "success", OUT_OF_STOCK: "warning", INACTIVE: "neutral",
  GOOD: "success", LIGHTLY_DAMAGED: "warning", HEAVILY_DAMAGED: "danger", LOST: "danger",
  DRAFT: "neutral", WAITING_ADMIN_VERIFICATION: "warning", REVISION_REQUIRED: "danger",
  WAITING_SEKDA_APPROVAL: "maroon", APPROVED: "success", REJECTED: "danger",
  READY_FOR_HANDOVER: "info", BORROWED: "info", WAITING_RETURN: "warning",
  WAITING_RETURN_VERIFICATION: "warning", RETURN_PROBLEM: "danger", COMPLETED: "success",
  CANCELLED: "neutral", OVERDUE: "danger", ACTIVE: "success",
} as const satisfies Record<string, BadgeTone>;

export function humanizeStatus(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
