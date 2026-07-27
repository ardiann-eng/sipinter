# Matriks Peran dan Izin

Semua izin mensyaratkan sesi valid. Pembatasan SKPD dan kepemilikan tetap diterapkan pada lapisan server/domain.

| Kapabilitas | Administrator | Peminjam | Sekda/Approver |
| --- | :---: | :---: | :---: |
| Ringkasan sesuai peran | Ya | Ya | Ya |
| Lihat katalog/barang tersedia | Ya | Ya | Tidak |
| Kelola barang dan kategori | Ya | Tidak | Tidak |
| Buat/edit draft pengajuan sendiri | Tidak | Ya | Tidak |
| Ajukan peminjaman sendiri | Tidak | Ya | Tidak |
| Verifikasi kelengkapan pengajuan | Ya | Tidak | Tidak |
| Minta revisi/tolak pada verifikasi admin | Ya | Tidak | Tidak |
| Setujui/tolak keputusan Sekda | Tidak | Tidak | Ya |
| Proses penyerahan barang | Ya | Tidak | Tidak |
| Ajukan pengembalian milik sendiri | Tidak | Ya | Tidak |
| Verifikasi kondisi pengembalian | Ya | Tidak | Tidak |
| Kelola pengguna non-admin | Ya | Tidak | Tidak |
| Lihat laporan operasional | Ya | Data sendiri | Ringkasan persetujuan |
| Lihat audit log | Ya | Tidak | Tidak |
| Lihat notifikasi dan profil sendiri | Ya | Ya | Ya |

## Guard Route

| Prefix | Role tunggal yang diizinkan |
| --- | --- |
| `/admin/**` | `ADMIN` |
| `/peminjam/**` | `BORROWER` |
| `/sekda/**` | `APPROVER` |
| `/profil`, `/notifikasi` | Semua role dengan sesi valid |

Middleware melakukan guard awal secara kriptografis. Route handler/server action tetap harus memanggil `requireUser()` atau `requireRole()` dan melakukan pemeriksaan kepemilikan/SKPD. Menyembunyikan menu bukan kontrol keamanan.
