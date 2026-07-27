import type { HTMLAttributes } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cx, Input, Select } from "./ui/primitives";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return <div className="page-header"><div><span className="page-header__eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="page-header__actions">{actions}</div>}</div>;
}

export function FilterBar({ searchPlaceholder = "Cari data...", children, actions }: { searchPlaceholder?: string; children?: React.ReactNode; actions?: React.ReactNode }) {
  return <div className="filter-bar"><div className="filter-bar__search"><Search size={18} /><input aria-label="Pencarian" placeholder={searchPlaceholder} /></div>{children}<div className="filter-bar__actions">{actions}</div></div>;
}

export function RecordToolbar({ total, noun = "data", sortOptions }: { total: number; noun?: string; sortOptions?: Array<{ label: string; value: string }> }) {
  return <div className="record-toolbar"><span><strong>{total}</strong> {noun}</span>{sortOptions && <Select aria-label="Urutkan" defaultValue={sortOptions[0]?.value}>{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select>}</div>;
}

export function DetailGrid({ children, className, ...props }: HTMLAttributes<HTMLDListElement>) {
  return <dl className={cx("detail-grid", className)} {...props}>{children}</dl>;
}

export function DetailItem({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <div className={cx("detail-item", wide && "detail-item--wide")}><dt>{label}</dt><dd>{children}</dd></div>;
}

export function FilterLabel({ children = "Filter" }: { children?: React.ReactNode }) {
  return <span className="filter-label"><SlidersHorizontal size={16} />{children}</span>;
}

export { Input };
