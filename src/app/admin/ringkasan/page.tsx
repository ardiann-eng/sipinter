import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import {
  AdminHeader,
  LinkButton,
  Panel,
  RequestTable,
  formatDateTime,
  s,
} from "@/components/admin/admin-ui";
import { dashboardSummary, inventoryRequests } from "@/lib/mock-data";

const usage = [
  ["Sekretariat Daerah", 31, 100],
  ["Diskominfo", 24, 77],
  ["Dinas Pendidikan", 18, 58],
  ["Dinas Kesehatan", 13, 42],
] as const;

export default function RingkasanPage() {
  return (
    <>
      <AdminHeader
        title="Ringkasan operasional"
        description={`Kondisi layanan per ${formatDateTime(dashboardSummary.lastUpdated)} WITA.`}
        actions={
          <LinkButton href="/admin/laporan" secondary>
            Lihat laporan
          </LinkButton>
        }
      />
      <section className={s.summaryStrip} aria-label="Ringkasan utama">
        <div className={s.summaryItem}>
          <span>Perlu verifikasi</span>
          <strong>7</strong>
          <small>2 mendekati batas layanan</small>
        </div>
        <div className={s.summaryItem}>
          <span>Siap diserahkan</span>
          <strong>4</strong>
          <small>Hari ini dan besok</small>
        </div>
        <div className={s.summaryItem}>
          <span>Peminjaman aktif</span>
          <strong>{dashboardSummary.activeBorrowings}</strong>
          <small>3 kendaraan sedang digunakan</small>
        </div>
        <div className={s.summaryItem}>
          <span>Pengembalian terlambat</span>
          <strong>{dashboardSummary.overdueReturns}</strong>
          <small>Lewat lebih dari 24 jam</small>
        </div>
        <div className={s.summaryItem}>
          <span>Ketersediaan kendaraan</span>
          <strong>{dashboardSummary.availableItems} / {dashboardSummary.totalItems}</strong>
          <small>Seluruh unit terpantau</small>
        </div>
      </section>
      <div className={s.grid7030}>
        <Panel
          title="Prioritas hari ini"
          description="Diurutkan menurut tenggat penggunaan terdekat."
          flush
          action={
            <Link className={s.link} href="/admin/verifikasi">
              Semua permohonan
            </Link>
          }
        >
          <RequestTable requests={inventoryRequests.slice(0, 3)} />
        </Panel>
        <Panel title="Kondisi kendaraan" description="6 kendaraan tercatat">
          <div className={s.condition}>
            <div>
              <span>Baik</span>
              <strong>6</strong>
              <small>100%</small>
            </div>
            <div>
              <span>Rusak ringan</span>
              <strong>0</strong>
              <small>0%</small>
            </div>
            <div>
              <span>Rusak berat</span>
              <strong>0</strong>
              <small>0%</small>
            </div>
            <div>
              <span>Hilang</span>
              <strong>0</strong>
              <small>0%</small>
            </div>
          </div>
          <div
            className={`${s.note} ${s.dangerNote}`}
            style={{ marginTop: 16 }}
          >
            <AlertTriangle size={16} /> Tidak ada kendaraan yang memerlukan
            tindak lanjut kondisi saat ini.
          </div>
        </Panel>
      </div>
      <div className={s.grid2}>
        <Panel
          title="Kalender operasional · Juli 2026"
          description="Penyerahan, penggunaan, dan pengembalian kendaraan."
        >
          <div className={s.calendar}>
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
              <div key={d} className={s.calendarHead}>
                {d}
              </div>
            ))}
            {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26].map(
              (d) => (
                <div key={d}>
                  <span>{d}</span>
                  {d === 18 && (
                    <span className={s.calendarEvent}>2 pengembalian</span>
                  )}
                  {d === 20 && (
                    <span className={s.calendarEvent}>
                      Serah terima Diskominfo
                    </span>
                  )}
                  {d === 21 && (
                    <span className={s.calendarEvent}>Sosialisasi digital</span>
                  )}
                  {d === 22 && (
                    <span className={s.calendarEvent}>
                      Rakor perangkat daerah
                    </span>
                  )}
                </div>
              ),
            )}
          </div>
        </Panel>
        <Panel
          title="Penggunaan menurut SKPD"
          description="Jumlah transaksi selama Juli 2026."
        >
          <div className={s.bars}>
            {usage.map(([name, value, width]) => (
              <div className={s.barRow} key={name}>
                <span>{name}</span>
                <div className={s.track}>
                  <div className={s.fill} style={{ width: `${width}%` }} />
                </div>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel
        title="Aktivitas terkini"
        description="Jejak kegiatan penting administrator."
      >
        <ul className={s.activity}>
          <li>
            <p>
              <strong>Syarifuddin</strong> mencatat pengembalian HiAce 12 Seat
              dalam kondisi baik.
            </p>
            <time>18 Juli 2026, 08.41 WITA</time>
          </li>
          <li>
            <p>
              <strong>Syarifuddin</strong> meminta revisi surat tugas permohonan
              SIPINTER/PMK/VII/2026/00129.
            </p>
            <time>18 Juli 2026, 08.14 WITA</time>
          </li>
          <li>
            <p>
              <strong>Sekretaris Daerah</strong> menyetujui Bus Penumpang 30 Seat
              untuk rapat koordinasi perangkat daerah.
            </p>
            <time>17 Juli 2026, 15.48 WITA</time>
          </li>
        </ul>
        <Link className={s.link} href="/admin/audit">
          Buka audit lengkap <ArrowUpRight size={14} />
        </Link>
      </Panel>
    </>
  );
}
