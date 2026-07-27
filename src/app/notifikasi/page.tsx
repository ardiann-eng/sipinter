import Link from "next/link";
import { AlertTriangle, Bell, CheckCircle2, Clock3 } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getNotifications, type AppNotification, type NotificationPriority } from "@/lib/notifications";
import { roleHome } from "@/lib/navigation";
import styles from "./shared.module.css";
import { NotificationActionLink } from "./notification-action-link";

export const dynamic = "force-dynamic";

const groups: Array<{ priority: NotificationPriority; title: string; description: string }> = [
  { priority: "ACTION", title: "Perlu tindakan", description: "Selesaikan agar layanan tidak tertunda." },
  { priority: "WAITING", title: "Menunggu pihak lain", description: "Pengajuan berjalan dan belum memerlukan tindakan dari Anda." },
  { priority: "INFO", title: "Informasi", description: "Pembaruan layanan dan ringkasan operasional." },
];

function NotificationIcon({ priority }: { priority: NotificationPriority }) {
  if (priority === "ACTION") return <AlertTriangle size={19} />;
  if (priority === "WAITING") return <Clock3 size={19} />;
  return <CheckCircle2 size={19} />;
}

function formatNotificationTime(time: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Makassar",
    timeZoneName: "short",
  }).format(time);
}

function NotificationItem({ notification }: { notification: AppNotification }) {
  return <li className={`${styles.item} ${notification.unread ? styles.itemUnread : ""}`}>
    <span className={`${styles.icon} ${styles[`icon${notification.priority}`]}`} aria-hidden="true"><NotificationIcon priority={notification.priority} /></span>
    <div className={styles.itemBody}>
      <h3>{notification.title}</h3>
      <p>{notification.message}</p>
      {notification.href && notification.actionLabel && <NotificationActionLink id={notification.id} href={notification.href}>{notification.actionLabel}</NotificationActionLink>}
    </div>
    <time dateTime={notification.time.toISOString()}>{formatNotificationTime(notification.time)}</time>
  </li>;
}

export default async function NotificationPage() {
  const user = await getSession();
  if (!user) redirect("/sesi-berakhir");
  const notifications = await getNotifications(user.id);
  const actionCount = notifications.filter((notification) => notification.priority === "ACTION").length;
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  return <main className={styles.page}><div className={styles.wrap}>
    <header className={styles.top}><div><p className={styles.eyebrow}>PUSAT INFORMASI</p><h1>Notifikasi</h1><p>Prioritas layanan dan pembaruan yang relevan untuk peran Anda.</p></div><Link className={styles.back} href={roleHome[user.role]}>Kembali ke beranda</Link></header>
    <section className={styles.summary} aria-label="Ringkasan notifikasi"><div><Bell size={20} /><span><strong>{actionCount} perlu tindakan</strong><small>Prioritas yang perlu diselesaikan</small></span></div><span className={styles.count}>{unreadCount} belum dibaca</span></section>
    <div className={styles.groups}>{groups.map((group) => {
      const items = notifications.filter((notification) => notification.priority === group.priority);
      if (!items.length) return null;
      return <section className={styles.panel} aria-labelledby={`${group.priority}-title`} key={group.priority}><div className={styles.panelHead}><div><h2 id={`${group.priority}-title`}>{group.title}</h2><p>{group.description}</p></div><span className={`${styles.groupCount} ${styles[`groupCount${group.priority}`]}`}>{items.length}</span></div><ul className={styles.list}>{items.map((notification) => <NotificationItem key={notification.id} notification={notification} />)}</ul></section>;
    })}</div>
  </div></main>;
}
