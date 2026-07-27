import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cx } from "./primitives";

export function TableContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("table-container", className)} {...props} />;
}

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cx("table", className)} {...props} />;
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cx("table__head", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cx("table__body", className)} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cx("table__row", className)} {...props} />;
}

export function TableHeader({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cx("table__header", className)} scope={props.scope ?? "col"} {...props} />;
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cx("table__cell", className)} {...props} />;
}

export interface MobileRecordProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  status?: React.ReactNode;
  fields: Array<{ label: string; value: React.ReactNode }>;
  actions?: React.ReactNode;
}

export function MobileRecord({ title, eyebrow, status, fields, actions, className, ...props }: MobileRecordProps) {
  return (
    <article className={cx("mobile-record", className)} {...props}>
      <div className="mobile-record__head"><div>{eyebrow && <div className="mobile-record__eyebrow">{eyebrow}</div>}<h3>{title}</h3></div>{status}</div>
      <dl>{fields.map((field) => <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}</dl>
      {actions && <div className="mobile-record__actions">{actions}</div>}
    </article>
  );
}
