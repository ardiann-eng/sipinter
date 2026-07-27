import { AdminHeader, Button, Panel, s } from "@/components/admin/admin-ui";

export default function SettingsPage() {
  return (
    <>
      <AdminHeader
        title="Pengaturan administrasi"
        description="Atur parameter operasional prototipe tanpa koneksi basis data."
      />
      <div className={s.grid2}>
        <Panel
          title="Aturan peminjaman"
          description="Berlaku pada pengajuan baru."
        >
          <div className={s.settingRow}>
            <div>
              <strong>Batas durasi standar</strong>
              <p>Maksimum hari kalender untuk peminjaman biasa.</p>
            </div>
            <input
              className="input"
              style={{ width: 80 }}
              type="number"
              defaultValue="7"
            />
          </div>
          <div className={s.settingRow}>
            <div>
              <strong>Jeda minimum pengajuan</strong>
              <p>Hari kerja sebelum tanggal penggunaan.</p>
            </div>
            <input
              className="input"
              style={{ width: 80 }}
              type="number"
              defaultValue="2"
            />
          </div>
          <div className={s.settingRow}>
            <div>
              <strong>Persetujuan Sekretaris Daerah</strong>
              <p>Wajib untuk seluruh peminjaman lintas perangkat daerah.</p>
            </div>
            <input
              className={s.switch}
              type="checkbox"
              defaultChecked
              aria-label="Wajibkan persetujuan Sekretaris Daerah"
            />
          </div>
          <div className={s.settingRow}>
            <div>
              <strong>Izinkan pengajuan saat stok kosong</strong>
              <p>Masukkan permohonan ke daftar tunggu.</p>
            </div>
            <input
              className={s.switch}
              type="checkbox"
              aria-label="Izinkan pengajuan saat stok kosong"
            />
          </div>
        </Panel>
        <Panel
          title="Notifikasi"
          description="Pengingat dikirim melalui email dinas."
        >
          <div className={s.settingRow}>
            <div>
              <strong>Pengajuan baru</strong>
              <p>Kirim ke seluruh administrator aktif.</p>
            </div>
            <input
              className={s.switch}
              type="checkbox"
              defaultChecked
              aria-label="Kirim notifikasi pengajuan baru"
            />
          </div>
          <div className={s.settingRow}>
            <div>
              <strong>H-1 pengembalian</strong>
              <p>Pengingat otomatis kepada peminjam.</p>
            </div>
            <input
              className={s.switch}
              type="checkbox"
              defaultChecked
              aria-label="Kirim pengingat H-1 pengembalian"
            />
          </div>
          <div className={s.settingRow}>
            <div>
              <strong>Pengembalian terlambat</strong>
              <p>Eskalasi kepada kepala perangkat daerah.</p>
            </div>
            <input
              className={s.switch}
              type="checkbox"
              defaultChecked
              aria-label="Kirim eskalasi pengembalian terlambat"
            />
          </div>
          <div className={s.settingRow}>
            <div>
              <strong>Ringkasan mingguan</strong>
              <p>Setiap Senin pukul 08.00 WITA.</p>
            </div>
            <input
              className={s.switch}
              type="checkbox"
              aria-label="Kirim ringkasan mingguan"
            />
          </div>
        </Panel>
        <Panel title="Penomoran dokumen">
          <div className={s.formGrid}>
            <label className="field">
              <span className="field__label">Format permohonan</span>
              <input
                className="input"
                defaultValue="SIPINTER/PMK/{BULAN_ROMAWI}/{TAHUN}/{URUT}"
              />
            </label>
            <label className="field">
              <span className="field__label">Format berita acara</span>
              <input
                className="input"
                defaultValue="BAST/{URUT}/BAG.UMUM/{BULAN_ROMAWI}/{TAHUN}"
              />
            </label>
          </div>
        </Panel>
        <Panel title="Retensi dan keamanan">
          <div className={s.settingRow}>
            <div>
              <strong>Retensi audit log</strong>
              <p>Ketentuan minimum, tidak dapat kurang dari 5 tahun.</p>
            </div>
            <select className="select" style={{ width: 130 }} defaultValue="5">
              <option value="5">5 tahun</option>
              <option value="10">10 tahun</option>
              <option value="permanent">Permanen</option>
            </select>
          </div>
          <div className={s.settingRow}>
            <div>
              <strong>Sesi administrator</strong>
              <p>Keluar otomatis setelah tidak aktif.</p>
            </div>
            <select className="select" style={{ width: 130 }} defaultValue="30">
              <option value="15">15 menit</option>
              <option value="30">30 menit</option>
              <option value="60">60 menit</option>
            </select>
          </div>
        </Panel>
      </div>
      <div className={s.stickyActions}>
        <Button variant="outline">Pulihkan nilai tersimpan</Button>
        <Button>Simpan pengaturan</Button>
      </div>
    </>
  );
}
