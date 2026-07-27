import { Check, CircleDot } from "lucide-react";
import { cx } from "./ui/primitives";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  meta?: React.ReactNode;
  state?: "complete" | "current" | "upcoming";
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return <ol className="timeline">{items.map((item) => <li key={item.id} className={cx("timeline__item", `timeline__item--${item.state ?? "complete"}`)}><span className="timeline__marker">{item.state === "complete" ? <Check /> : <CircleDot />}</span><div className="timeline__content"><div className="timeline__heading"><h3>{item.title}</h3><time>{item.timestamp}</time></div>{item.description && <p>{item.description}</p>}{item.meta && <div className="timeline__meta">{item.meta}</div>}</div></li>)}</ol>;
}
