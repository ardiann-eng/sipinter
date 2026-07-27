# Workflow Peminjaman SIPINTER

## Alur Utama

| Urutan | Status | Aktor | Tindakan berikutnya |
| --- | --- | --- | --- |
| 1 | `DRAFT` | Peminjam | Lengkapi data, barang, jadwal, KTP, dan surat persetujuan; kirim pengajuan. |
| 2 | `WAITING_ADMIN_VERIFICATION` | Administrator | Periksa identitas, dokumen, jadwal, stok, dan kewenangan SKPD. |
| 3 | `WAITING_SEKDA_APPROVAL` | Sekda | Setujui atau tolak dengan catatan sesuai keputusan. |
| 4 | `APPROVED` | Administrator | Siapkan barang dan catatan kondisi. |
| 5 | `READY_FOR_HANDOVER` | Administrator | Serahkan barang dan rekam bukti serah terima. |
| 6 | `BORROWED` | Peminjam | Gunakan barang sesuai tujuan dan jadwal. |
| 7 | `WAITING_RETURN` | Peminjam | Mulai proses pengembalian. |
| 8 | `WAITING_RETURN_VERIFICATION` | Administrator | Periksa jumlah, fungsi, kondisi, dan bukti. |
| 9 | `COMPLETED` | Administrator | Tutup transaksi dan pulihkan ketersediaan barang. |

## Cabang dan Pengecualian

- `WAITING_ADMIN_VERIFICATION` dapat menjadi `REVISION_REQUIRED` dengan catatan wajib. Peminjam memperbaiki lalu mengirim kembali ke `WAITING_ADMIN_VERIFICATION`.
- `WAITING_ADMIN_VERIFICATION` dapat menjadi `REJECTED` dengan catatan wajib.
- `WAITING_SEKDA_APPROVAL` dapat menjadi `REJECTED` dengan catatan wajib.
- `DRAFT` dapat menjadi `CANCELLED` oleh peminjam.
- `BORROWED` dapat ditandai `OVERDUE` oleh administrator ketika melewati rencana pengembalian.
- `WAITING_RETURN_VERIFICATION` dapat menjadi `RETURN_PROBLEM` dengan jenis dan uraian masalah.
- `RETURN_PROBLEM` menjadi `COMPLETED` setelah penyelesaian dicatat.

## Aturan Integritas

1. Semua transisi harus memakai layanan `src/lib/workflow.ts` agar role, status asal, catatan wajib, stok, dan audit diproses dalam transaksi.
2. Peminjam hanya boleh mengubah transaksi miliknya. Pemeriksaan ID pengguna dan SKPD dilakukan server-side.
3. Keputusan penolakan/revisi dan masalah pengembalian wajib memiliki catatan yang dapat diaudit.
4. Bukti dokumen disimpan sebagai key storage, bukan URL publik permanen.
5. Perubahan status, aktor, waktu, metadata request, dan perubahan penting dicatat pada audit log.
6. Notifikasi dibuat sesudah transisi berhasil; kegagalan transaksi tidak boleh menghasilkan status atau notifikasi parsial.

## Tanggung Jawab Operasional

| Tahap | SLA/kontrol yang disarankan |
| --- | --- |
| Verifikasi admin | Antrean harian, cek duplikasi jadwal dan stok. |
| Persetujuan Sekda | Notifikasi tindakan dan eskalasi sesuai kebijakan kantor. |
| Penyerahan | Cocokkan penerima, kondisi awal, jumlah, dan bukti foto. |
| Masa pinjam | Pengingat sebelum jatuh tempo dan pemantauan keterlambatan. |
| Pengembalian | Rekonsiliasi kondisi akhir, jumlah, masalah, serta pemulihan stok atomik. |
| Audit | Laporan read-only, jejak perubahan, retensi, dan kontrol ekspor. |
