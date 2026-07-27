import type { HTMLAttributes } from "react";
import { cx } from "./primitives";

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  flush?: boolean;
}

export function Panel({ title, description, action, flush, className, children, ...props }: PanelProps) {
  return (
    <section className={cx("panel", flush && "panel--flush", className)} {...props}>
      {(title || description || action) && <header className="panel__header"><div>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>{action}</header>}
      <div className="panel__body">{children}</div>
    </section>
  );
}

export function Stat({ label, value, detail, icon, tone = "navy" }: { label: string; value: React.ReactNode; detail?: React.ReactNode; icon?: React.ReactNode; tone?: "navy" | "primary" | "maroon" | "red" }) {
  return <div className={cx("stat", `stat--${tone}`)}><div className="stat__top"><span>{label}</span>{icon && <span className="stat__icon">{icon}</span>}</div><strong>{value}</strong>{detail && <div className="stat__detail">{detail}</div>}</div>;
}
