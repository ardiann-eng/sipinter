"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components";

export function ReportActions({ rows }: { rows: Array<Array<string | number>> }) {
  function exportCsv() {
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-sipinter-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return <><Button type="button" variant="outline" onClick={exportCsv}><Download size={16} aria-hidden="true" /> Ekspor CSV</Button><Button type="button" onClick={() => window.print()}><Printer size={16} aria-hidden="true" /> Cetak / Simpan PDF</Button></>;
}
