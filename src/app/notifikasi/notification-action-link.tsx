"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import styles from "./shared.module.css";

export function NotificationActionLink({
  id,
  href,
  children,
}: {
  id: string;
  href: string;
  children: React.ReactNode;
}) {
  return <Link className={styles.action} href={href} onClick={() => {
    void fetch(`/api/notifications/${id}/read`, { method: "POST", keepalive: true });
  }}>{children} <ChevronRight size={15} /></Link>;
}
