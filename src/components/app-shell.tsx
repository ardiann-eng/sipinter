"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Boxes,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  History,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  PackageCheck,
  RotateCcw,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
} from "lucide-react";
import { initials } from "@/lib/format";
import {
  mobileNavigationByRole,
  navigationByRole,
  roleHome,
  roleLabels,
  type NavigationIcon,
  type NavigationItem,
  type UserRole,
} from "@/lib/navigation";
import { cx } from "./ui/primitives";
import { Button } from "./ui/primitives";
import { Modal } from "./ui/modal";
import anniversaryLogo from "../../images.png";
import cityLogo from "../../logo-makassarkota-239x300.png";

const icons: Record<NavigationIcon, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  inventory: Boxes,
  request: ClipboardList,
  handover: PackageCheck,
  return: RotateCcw,
  users: Users,
  audit: Activity,
  report: FileBarChart,
  profile: UserCircle,
  history: History,
  settings: Settings,
  more: MoreHorizontal,
};

export interface ShellUser {
  name: string;
  email?: string;
  role: UserRole;
  unit?: string;
}

function isActive(pathname: string, item: NavigationItem) {
  if (pathname === item.href) return true;
  return (
    item.href.split("/").filter(Boolean).length > 1 &&
    pathname.startsWith(`${item.href}/`)
  );
}

export function AppShell({
  children,
  user = {
    name: "Ahmad",
    email: "ahmad@makassarkota.go.id",
    role: "BORROWER",
    unit: "Dinas Komunikasi dan Informatika",
  },
  notificationCount = 3,
}: {
  children: React.ReactNode;
  user?: ShellUser;
  notificationCount?: number;
}) {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  const accountPopoverRef = useRef<HTMLDivElement>(null);
  const navigation = navigationByRole[user.role];

  useEffect(() => {
    if (!accountOpen) return;
    const close = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node))
        setAccountOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
        accountTriggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  useEffect(() => {
    if (!accountOpen) return;
    requestAnimationFrame(() =>
      accountPopoverRef.current?.querySelector<HTMLElement>("a[href], button")?.focus(),
    );
  }, [accountOpen]);

  async function logout() {
    setLogoutBusy(true);
    const response = await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign(response.ok ? "/login" : "/sesi-berakhir");
  }

  const nav = (
    <nav className="shell-nav" aria-label="Navigasi utama">
      {navigation.map((item) => {
        const Icon = icons[item.icon];
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            className={cx(
              "shell-nav__link",
              active && "shell-nav__link--active",
            )}
            href={item.href}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={18} />
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className="shell-nav__badge">{item.badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className={cx("app-shell", `app-shell--${user.role.toLowerCase()}`)}>
      <a className="skip-link" href="#konten-utama">
        Lewati ke konten utama
      </a>
      <aside className="shell-sidebar">
        <Brand href={roleHome[user.role]} />
        {nav}
        <div className="shell-sidebar__foot">
          <ShieldCheck size={17} />
          <span>Sistem internal Pemkot Makassar</span>
        </div>
      </aside>
      <div className="shell-main">
        <header className="shell-header">
          <div className="shell-header__context">
            <span>Ruang kerja</span>
            <strong>{roleLabels[user.role]}</strong>
          </div>
          <Link className="shell-header__brand" href={roleHome[user.role]}>
            SIPINTER
          </Link>
          <div className="shell-header__actions">
            <Link
              className="icon-button notification-button"
              href="/notifikasi"
              aria-label={`${notificationCount} notifikasi`}
            >
              <Bell />
              {notificationCount > 0 && <span>{notificationCount}</span>}
            </Link>
            <div className="account-menu" ref={accountMenuRef}>
              <button
                className="user-menu"
                ref={accountTriggerRef}
                onClick={() => setAccountOpen((open) => !open)}
                aria-label="Buka menu akun"
                aria-expanded={accountOpen}
              >
                <span className="user-menu__avatar">{initials(user.name)}</span>
                <span className="user-menu__identity">
                  <strong>{user.name}</strong>
                  <small>{roleLabels[user.role]}</small>
                </span>
                <ChevronDown className="user-menu__chevron" size={15} />
              </button>
              {accountOpen && (
                <div className="account-menu__popover" ref={accountPopoverRef}>
                  <div className="account-menu__summary">
                    <span className="account-menu__avatar">
                      {initials(user.name)}
                    </span>
                    <div>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <small>{roleLabels[user.role]}</small>
                    </div>
                  </div>
                  <Link
                    className="account-menu__profile"
                    href="/profil"
                    onClick={() => setAccountOpen(false)}
                  >
                    <UserCircle size={16} />
                    <div>
                      <strong>Profil akun</strong>
                      <span>Identitas dan peran akses aktif</span>
                    </div>
                  </Link>
                  <div className="account-menu__links">
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin/pengaturan"
                        onClick={() => setAccountOpen(false)}
                      >
                        <Settings size={16} />
                        Pengaturan
                      </Link>
                    )}
                  </div>
                  <button
                    className="account-menu__logout"
                    onClick={() => {
                      setAccountOpen(false);
                      setLogoutConfirmOpen(true);
                    }}
                  >
                    <LogOut size={16} />
                    {logoutBusy ? "Mengakhiri sesi..." : "Keluar akun"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="shell-content" id="konten-utama">
          {children}
        </main>
        <MobileBottomNav role={user.role} pathname={pathname} />
      </div>
      <Modal
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        title="Keluar dari akun?"
        description="Sesi aktif akan diakhiri pada perangkat ini."
        footer={
          <>
            <Button variant="outline" onClick={() => setLogoutConfirmOpen(false)} disabled={logoutBusy}>
              Batal
            </Button>
            <Button variant="danger" onClick={logout} loading={logoutBusy}>
              Keluar
            </Button>
          </>
        }
      >
        <p>Pastikan pekerjaan penting sudah tersimpan sebelum keluar.</p>
      </Modal>
    </div>
  );
}

function MobileBottomNav({
  role,
  pathname,
}: {
  role: UserRole;
  pathname: string;
}) {
  return (
    <nav className="bottom-nav" aria-label="Navigasi seluler">
      {mobileNavigationByRole[role].map((item) => {
        const Icon =
          item.icon === "request" && role === "APPROVER"
            ? ClipboardCheck
            : icons[item.icon];
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "bottom-nav__link",
              active && "bottom-nav__link--active",
            )}
          >
            <span className="bottom-nav__icon">
              <Icon size={20} />
              {item.badge !== undefined && <span>{item.badge}</span>}
            </span>
            <small>{item.label}</small>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ href }: { href: string }) {
  return (
    <Link href={href} className="brand">
      <span className="brand__mark">
        <span className="brand__city-logo">
          <Image src={cityLogo} alt="Lambang Kota Makassar" />
        </span>
        <span className="brand__anniversary-logo">
          <Image src={anniversaryLogo} alt="Logo 418 Tahun Kota Makassar" />
        </span>
      </span>
      <span className="brand__text">
        <strong>SIPINTER</strong>
        <small>Sistem Informasi Peminjaman Inventaris Kantor Terintegrasi</small>
        <em>Pemkot Makassar</em>
      </span>
    </Link>
  );
}
