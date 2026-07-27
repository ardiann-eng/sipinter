"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import styles from "./profile.module.css";

export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={styles.logout}
      disabled={busy}
      aria-busy={busy}
      onClick={async () => {
        setBusy(true);
        const response = await fetch("/api/auth/logout", { method: "POST" });
        window.location.assign(response.ok ? "/login" : "/sesi-berakhir");
      }}
    >
      <LogOut size={16} /> {busy ? "Mengakhiri sesi..." : "Keluar dari akun"}
    </button>
  );
}
