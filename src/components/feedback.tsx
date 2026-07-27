import type { HTMLAttributes } from "react";
import { AlertTriangle, FileQuestion, Inbox, RefreshCw } from "lucide-react";
import { Button } from "./ui/primitives";
import { cx } from "./ui/primitives";

export function EmptyState({
  title = "Belum ada data",
  description = "Data yang Anda cari belum tersedia.",
  action,
  icon,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="state">
      <div className="state__icon">{icon ?? <Inbox />}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Data gagal dimuat",
  description = "Terjadi gangguan saat mengambil data. Silakan coba kembali.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state state--error">
      <div className="state__icon">
        <AlertTriangle />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw size={16} /> Coba lagi
        </Button>
      )}
    </div>
  );
}

export function NotFoundState({
  description = "Dokumen atau data tidak ditemukan.",
}: {
  description?: string;
}) {
  return (
    <EmptyState
      title="Tidak ditemukan"
      description={description}
      icon={<FileQuestion />}
    />
  );
}

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("skeleton", className)} aria-hidden="true" {...props} />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-table" aria-label="Memuat data" role="status">
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton-table__row" key={index}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ))}
    </div>
  );
}
