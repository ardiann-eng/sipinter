"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components";
import styles from "./borrower.module.css";

type Option = { value: string; label: string };

function FilterSelect({ name, label, value, options }: { name: string; label: string; value: string; options: Option[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!nextValue || nextValue === "all" || nextValue === "newest") params.delete(name);
    else params.set(name, nextValue);
    router.replace(`${pathname}${params.size ? `?${params.toString()}` : ""}`);
  }

  return <Select aria-label={label} value={value} onChange={(event) => update(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select>;
}

export function BorrowingFilters({ status, sort }: { status: string; sort: string }) {
  return <div className={styles.filters}>
    <FilterSelect name="status" label="Filter status" value={status} options={[
      { value: "all", label: "Semua status aktif" },
      { value: "WAITING_ADMIN_VERIFICATION", label: "Verifikasi admin" },
      { value: "REVISION_REQUIRED", label: "Perlu revisi" },
      { value: "WAITING_SEKDA_APPROVAL", label: "Menunggu Sekda" },
      { value: "READY_FOR_HANDOVER", label: "Siap diserahkan" },
      { value: "BORROWED", label: "Sedang dipinjam" },
      { value: "WAITING_RETURN_VERIFICATION", label: "Verifikasi pengembalian" },
      { value: "RETURN_PROBLEM", label: "Bermasalah" },
    ]} />
    <FilterSelect name="sort" label="Urutkan" value={sort} options={[{ value: "newest", label: "Terbaru" }, { value: "oldest", label: "Terlama" }]} />
  </div>;
}

export function HistoryFilters({ year, status, years }: { year: string; status: string; years: string[] }) {
  return <div className={styles.filters}>
    <FilterSelect name="year" label="Tahun" value={year} options={[{ value: "all", label: "Semua tahun" }, ...years.map((value) => ({ value, label: value }))]} />
    <FilterSelect name="status" label="Status" value={status} options={[
      { value: "all", label: "Semua hasil" },
      { value: "COMPLETED", label: "Selesai" },
      { value: "REJECTED", label: "Ditolak" },
      { value: "CANCELLED", label: "Dibatalkan" },
    ]} />
  </div>;
}
