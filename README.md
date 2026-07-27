# SIPINTER

SIPINTER adalah Sistem Informasi Peminjaman Inventaris Kantor Terintegrasi Pemerintah Kota Makassar. Aplikasi mengelola katalog inventaris, pengajuan, verifikasi, persetujuan Sekretaris Daerah, penyerahan, pengembalian, laporan, dan audit berdasarkan peran.

Status MVP: frontend responsif dan seluruh alur operasional dapat dinavigasi memakai data contoh realistis. Autentikasi, otorisasi server, schema PostgreSQL, storage lokal, audit, dan layanan state transition tersedia. Mutasi selain login/logout belum seluruhnya dihubungkan dari form UI ke server action/Prisma; lihat keterbatasan sebelum deployment.

## Stack

- Next.js 15 App Router, React 19, dan TypeScript strict
- Turso/libSQL dan Prisma ORM dengan driver adapter
- JWT HS256 melalui `jose`; cookie sesi `httpOnly`, `sameSite=lax`
- `bcryptjs` untuk hash kata sandi
- Penyimpanan berkas lokal pada MVP, di balik abstraksi storage

## Prasyarat

- Node.js 20 atau lebih baru
- npm
- Database Turso dan token akses baru

## Setup Lokal

1. Salin `.env.example` menjadi `.env` dan sesuaikan nilai.
2. Buat database Turso dan token akses terpisah untuk environment.
3. Pasang dependency dengan `npm install`.
4. Generate Prisma Client dengan `npm run db:generate`.
5. Buat migration SQL memakai SQLite lokal dengan `npm run db:migrate`.
6. Terapkan migration ke Turso dengan `npm run db:push:turso`.
7. Isi data awal dengan `npm run db:seed`.
8. Jalankan aplikasi dengan `npm run dev` lalu buka `http://localhost:3000`.

Prisma Migrate tidak menerapkan migration langsung ke Turso. Tinjau SQL pada `prisma/migrations`, lalu gunakan `npm run db:push:turso`. Script mencatat migration terpasang dalam `_sipinter_migrations`.

## Environment

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | Tooling | URL SQLite lokal, misalnya `file:./dev.db`, untuk menghasilkan migration. |
| `TURSO_DATABASE_URL` | Ya | URL `libsql://` database Turso. |
| `TURSO_AUTH_TOKEN` | Ya | Token Turso rahasia. Jangan pakai token yang pernah dibagikan atau di-commit. |
| `AUTH_SECRET` | Ya | Secret acak minimal 32 karakter untuk menandatangani JWT HS256. Gunakan nilai berbeda per environment. |
| `NEXT_PUBLIC_APP_VERSION` | Ya | Versi yang ditampilkan pada halaman login. Nilai ini terekspos ke browser. |
| `UPLOAD_DIR` | Ya untuk upload lokal | Direktori penyimpanan dokumen MVP. |
| `DEMO_ADMIN_PASSWORD` | Saat seed | Kata sandi akun demo administrator. |
| `DEMO_BORROWER_PASSWORD` | Saat seed | Kata sandi akun demo peminjam. |
| `DEMO_APPROVER_PASSWORD` | Saat seed | Kata sandi akun demo Sekda. |

Buat secret lokal, misalnya dengan `openssl rand -base64 48`. Jangan commit `.env` atau secret production.

## Akun Development

Seed membuat akun development. Email dan password hanya berasal dari `DEMO_ADMIN_EMAIL`, `DEMO_BORROWER_EMAIL`, `DEMO_APPROVER_EMAIL`, serta variabel `DEMO_*_PASSWORD` di `.env`. Jangan cantumkan kredensial di UI atau repository.

## Autentikasi dan Otorisasi

`POST /api/auth/login` memanggil fungsi inti `authenticate()` dan `setSession()` pada runtime Node. Prisma memakai `@prisma/adapter-libsql` untuk koneksi Turso. Login menerima NIP atau email, memvalidasi status aktif dan hash bcrypt, lalu menetapkan JWT delapan jam.

Middleware Next.js 15 berjalan pada Edge. Middleware hanya memakai `jose`, Web Crypto, cookie, dan klaim JWT; middleware tidak mengimpor Prisma atau API Node. Tanda tangan, algoritma HS256, masa berlaku, subjek, dan peran diperiksa sebelum akses diberikan.

Prefix role dijaga tepat:

| Peran | Prefix | Tujuan setelah login |
| --- | --- | --- |
| `ADMIN` | `/admin` | `/admin` |
| `BORROWER` | `/peminjam` | `/peminjam` |
| `APPROVER` | `/sekda` | `/sekda` |

`/profil` dan `/notifikasi` tersedia bagi semua sesi valid. Pengguna tanpa sesi diarahkan ke login; token ada tetapi tidak valid diarahkan ke `/sesi-berakhir`; role salah diarahkan ke `/akses-ditolak`. Validasi server pada setiap mutasi tetap wajib karena middleware bukan pengganti otorisasi domain.

`POST /api/auth/logout` menghapus cookie sesi. Callback login hanya menerima path lokal dan tidak dapat dipakai sebagai open redirect atau untuk melewati prefix role.

## Halaman

- `/login`: akses institusional responsif, NIP/email, kata sandi, tampil/sembunyi, ingat perangkat, reset melalui helpdesk, versi.
- `/admin/**`: administrasi inventaris dan operasi.
- `/peminjam/**`: pengajuan dan peminjaman milik pegawai.
- `/sekda/**`: persetujuan Sekretaris Daerah.
- `/notifikasi`: pusat notifikasi bersama.
- `/profil`: identitas sesi dan logout.
- `/akses-ditolak` dan `/sesi-berakhir`: status keamanan.

Daftar route operasional utama:

- Admin: ringkasan, verifikasi dan detail, penyerahan, verifikasi pengembalian dan detail, master/tambah/edit/detail barang, laporan, pengguna, audit, pengaturan.
- Peminjam: beranda, pengajuan lima langkah, peminjaman dan detail, pengembalian dan formulir foto, riwayat, profil.
- Sekda: antrean dan detail keputusan, riwayat, laporan ringkas, profil.

## Workflow

Alur status lengkap tercatat di [`docs/WORKFLOW.md`](docs/WORKFLOW.md). Matriks akses ada di [`docs/ROLE_PERMISSION_MATRIX.md`](docs/ROLE_PERMISSION_MATRIX.md). Transisi domain harus melewati layanan workflow, bukan update status Prisma langsung.

## Arsitektur

```text
Browser
  |-- Next.js middleware (verifikasi JWT dan guard prefix)
  |-- App Router pages / route handlers
        |-- src/lib/auth.ts (session dan autentikasi)
        |-- src/lib/authorization.ts (kebijakan role/SKPD)
        |-- src/lib/workflow.ts (transisi status)
        |-- Prisma Client + libSQL adapter --> Turso
        |-- src/lib/storage.ts --> filesystem lokal
```

Route handler auth dipaksa `runtime = "nodejs"` dan `dynamic = "force-dynamic"`. Halaman yang membaca cookie sesi juga dinamis. Ini mencegah koneksi DB pada proses build.

## Penyimpanan dan Migrasi

MVP menyimpan key dokumen pada PostgreSQL dan isi berkas di `UPLOAD_DIR`. Direktori harus persisten, tidak dilayani sebagai static directory, dibatasi izin OS, dicadangkan bersama DB, dan dipindai sesuai kebijakan keamanan organisasi.

Migrasi menuju object storage:

1. Implementasikan adapter S3-compatible pada lapisan `src/lib/storage.ts` tanpa mengubah key yang tersimpan.
2. Tambahkan bucket privat, enkripsi, lifecycle, batas ukuran/MIME, dan signed URL berumur pendek.
3. Salin objek dari `UPLOAD_DIR`, verifikasi checksum dan jumlah objek.
4. Alihkan adapter dengan feature flag setelah uji baca/tulis.
5. Pertahankan filesystem read-only selama masa rollback, lalu hapus setelah retensi selesai.

## Verifikasi

- Type check: `npx tsc --noEmit`
- Lint: `npm run lint`
- Test: `npm test`
- Production build: `npm run build`

Uji manual minimal: login tiap role, redirect role, akses silang role, token rusak/kedaluwarsa, callback eksternal, logout, layout mobile, dan DB tidak tersedia saat build.

## Keterbatasan MVP

- Halaman operasional memakai service abstraction dan data mock. Selain autentikasi, form dan tombol operasional belum seluruhnya melakukan persistence ke PostgreSQL. Layanan domain pada `src/lib/workflow.ts` menjadi kontrak integrasi server action berikutnya.
- Preview/unduh dokumen, ekspor PDF/Excel, QR/BAST final, notifikasi database, import barang, dan pengaturan persisten masih berupa presentasi prototipe.
- Migration awal Turso tersedia. Perubahan schema berikutnya tetap harus dibuat lokal, ditinjau, lalu diterapkan melalui script migration Turso.
- Checkbox "ingat saya" belum mengubah durasi cookie; sesi tetap delapan jam.
- Lupa kata sandi diarahkan ke helpdesk, belum ada reset token mandiri.
- Pusat notifikasi menampilkan presentasi awal; baca/tandai dan pagination DB belum terhubung.
- Profil memakai klaim sesi; perubahan profil di DB terlihat setelah login ulang.
- Middleware memvalidasi token, bukan status akun terbaru di DB. Mutasi sensitif harus memakai `requireUser()` atau `requireRole()`.
- Upload lokal tidak cocok untuk deployment serverless/replica tanpa shared persistent volume.
- Belum ada rate limiting login, MFA, rotasi secret aktif, revocation list, atau integrasi SSO.

## Langkah Berikutnya

1. Tambahkan rate limiting berbasis IP dan identifier serta audit login gagal.
2. Hubungkan seluruh form ke server action yang memanggil `requireRole()`, Zod, workflow, storage, dan audit dalam transaksi.
3. Integrasikan SSO pemerintah/MFA dan kebijakan reset kata sandi.
4. Hubungkan notifikasi DB dengan read state dan deep link berizin.
5. Migrasikan storage ke object storage privat dan antivirus scanning.
6. Tambahkan pengujian integrasi PostgreSQL, middleware, workflow, serta E2E lintas role.
7. Tambahkan observability, backup/restore drill, dan prosedur rotasi `AUTH_SECRET`.
