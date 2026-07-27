import { Panel, Skeleton } from "@/components";

export default function BorrowerLoading() {
  return (
    <div
      className="borrower-loading"
      aria-label="Memuat layanan peminjaman"
      role="status"
    >
      <div>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
      <Panel>
        <div className="borrower-loading__form">
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </Panel>
    </div>
  );
}
