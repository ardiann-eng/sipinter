import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID");

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatDate(value: Date | string, pattern = "dd MMMM yyyy") {
  return format(new Date(value), pattern, { locale: id });
}

export function formatDateTime(value: Date | string) {
  return formatDate(value, "dd MMM yyyy, HH.mm");
}

export function formatRelativeTime(value: Date | string) {
  return formatDistanceToNow(new Date(value), { addSuffix: true, locale: id });
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toLocaleString("id-ID", { maximumFractionDigits: 1 })} ${units[index]}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
