import { PrismaLibSQL } from "@prisma/adapter-libsql";
import {
  BorrowingStatus,
  ItemCondition,
  NotificationType,
  PrismaClient,
  Role,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken)
  throw new Error(
    "TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN wajib diisi untuk seed",
  );

const prisma = new PrismaClient({
  adapter: new PrismaLibSQL({ url, authToken }),
});

const demoAccounts = [
  {
    env: "DEMO_ADMIN_PASSWORD",
    emailEnv: "DEMO_ADMIN_EMAIL",
    nip: "198001012005011001",
    name: "Administrator SIPINTER",
    position: "Administrator",
    role: Role.ADMIN,
  },
  {
    env: "DEMO_BORROWER_PASSWORD",
    emailEnv: "DEMO_BORROWER_EMAIL",
    nip: "198709122015031004",
    name: "Ahmad Ramadhan",
    position: "Analis Pengelolaan Barang Milik Daerah",
    role: Role.BORROWER,
  },
  {
    env: "DEMO_APPROVER_PASSWORD",
    emailEnv: "DEMO_APPROVER_EMAIL",
    nip: "197606151998031004",
    name: "Sekretaris Daerah",
    position: "Sekretaris Daerah",
    role: Role.APPROVER,
  },
] as const;

function demoPassword(envName: string): string {
  const configured = process.env[envName];
  if (configured) return configured;
  throw new Error(`${envName} wajib disetel di .env sebelum menjalankan seed`);
}

function demoEmail(envName: string): string {
  const configured = process.env[envName]?.trim().toLowerCase();
  if (configured) return configured;
  throw new Error(`${envName} wajib disetel di .env sebelum menjalankan seed`);
}

async function main() {
  const skpdExamples = [
    { code: "SETDA", name: "Sekretariat Daerah Kota Makassar" },
    { code: "SETWAN", name: "Sekretariat DPRD Kota Makassar" },
    { code: "INSPEKTORAT", name: "Inspektorat Daerah Kota Makassar" },
    {
      code: "DISKOMINFO",
      name: "Dinas Komunikasi dan Informatika Kota Makassar",
    },
    { code: "DISDIK", name: "Dinas Pendidikan Kota Makassar" },
    { code: "DINKES", name: "Dinas Kesehatan Kota Makassar" },
    { code: "DPU", name: "Dinas Pekerjaan Umum Kota Makassar" },
    {
      code: "DPRKP",
      name: "Dinas Perumahan dan Kawasan Permukiman Kota Makassar",
    },
    { code: "DINSOS", name: "Dinas Sosial Kota Makassar" },
    { code: "DISNAKER", name: "Dinas Ketenagakerjaan Kota Makassar" },
    {
      code: "DPPPA",
      name: "Dinas Pemberdayaan Perempuan dan Perlindungan Anak Kota Makassar",
    },
    { code: "DKP", name: "Dinas Ketahanan Pangan Kota Makassar" },
    { code: "DLH", name: "Dinas Lingkungan Hidup Kota Makassar" },
    {
      code: "DISDUKCAPIL",
      name: "Dinas Kependudukan dan Pencatatan Sipil Kota Makassar",
    },
    {
      code: "DPPKB",
      name: "Dinas Pengendalian Penduduk dan Keluarga Berencana Kota Makassar",
    },
    { code: "DISHUB", name: "Dinas Perhubungan Kota Makassar" },
    {
      code: "DKUKM",
      name: "Dinas Koperasi dan Usaha Kecil Menengah Kota Makassar",
    },
    {
      code: "DPMPTSP",
      name: "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Kota Makassar",
    },
    { code: "DISPORA", name: "Dinas Pemuda dan Olahraga Kota Makassar" },
    { code: "DISPUS", name: "Dinas Perpustakaan Kota Makassar" },
    { code: "DISBUD", name: "Dinas Kebudayaan Kota Makassar" },
    { code: "DISPAR", name: "Dinas Pariwisata Kota Makassar" },
    { code: "DPP", name: "Dinas Perikanan dan Pertanian Kota Makassar" },
    { code: "DISDAG", name: "Dinas Perdagangan Kota Makassar" },
    { code: "DISPERIN", name: "Dinas Perindustrian Kota Makassar" },
    {
      code: "BAPPEDA",
      name: "Badan Perencanaan Pembangunan Daerah Kota Makassar",
    },
    { code: "BPKAD", name: "Badan Keuangan dan Aset Daerah Kota Makassar" },
    { code: "BAPENDA", name: "Badan Pendapatan Daerah Kota Makassar" },
    {
      code: "BKPSDM",
      name: "Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Daerah Kota Makassar",
    },
    {
      code: "KESBANGPOL",
      name: "Badan Kesatuan Bangsa dan Politik Kota Makassar",
    },
    { code: "BPBD", name: "Badan Penanggulangan Bencana Daerah Kota Makassar" },
    { code: "SATPOLPP", name: "Satuan Polisi Pamong Praja Kota Makassar" },
    { code: "RSUDDAYA", name: "Rumah Sakit Umum Daerah Daya Kota Makassar" },
    { code: "KEC-BIRINGKANAYA", name: "Kecamatan Biringkanaya Kota Makassar" },
    { code: "KEC-BONTOALA", name: "Kecamatan Bontoala Kota Makassar" },
    { code: "KEC-MAKASSAR", name: "Kecamatan Makassar Kota Makassar" },
    { code: "KEC-MAMAJANG", name: "Kecamatan Mamajang Kota Makassar" },
    { code: "KEC-MANGGALA", name: "Kecamatan Manggala Kota Makassar" },
    { code: "KEC-MARISO", name: "Kecamatan Mariso Kota Makassar" },
    { code: "KEC-PANAKKUKANG", name: "Kecamatan Panakkukang Kota Makassar" },
    { code: "KEC-RAPPOCINI", name: "Kecamatan Rappocini Kota Makassar" },
    { code: "KEC-TALLO", name: "Kecamatan Tallo Kota Makassar" },
    { code: "KEC-TAMALANREA", name: "Kecamatan Tamalanrea Kota Makassar" },
    { code: "KEC-TAMALATE", name: "Kecamatan Tamalate Kota Makassar" },
    { code: "KEC-UBA", name: "Kecamatan Ujung Pandang Kota Makassar" },
    { code: "KEC-UTARA", name: "Kecamatan Ujung Tanah Kota Makassar" },
    { code: "KEC-WAJO", name: "Kecamatan Wajo Kota Makassar" },
  ];
  const seededSkpd = [];
  for (const entry of skpdExamples) {
    seededSkpd.push(
      await prisma.sKPD.upsert({
        where: { code: entry.code },
        update: { name: entry.name },
        create: entry,
      }),
    );
  }
  const setda = seededSkpd[0];
  const bpkad = seededSkpd[4];

  const users = new Map<Role, { id: string }>();
  for (const account of demoAccounts) {
    const passwordHash = await bcrypt.hash(demoPassword(account.env), 12);
    const email = demoEmail(account.emailEnv);
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: account.name,
        nip: account.nip,
        position: account.position,
        role: account.role,
        skpdId: account.role === Role.BORROWER ? bpkad.id : setda.id,
        passwordHash,
      },
      create: {
        name: account.name,
        nip: account.nip,
        email,
        phone: "081234567890",
        position: account.position,
        role: account.role,
        skpdId: account.role === Role.BORROWER ? bpkad.id : setda.id,
        passwordHash,
      },
      select: { id: true },
    });
    users.set(account.role, user);
  }

  const electronics = await prisma.itemCategory.upsert({
    where: { code: "ELEKTRONIK" },
    update: {},
    create: { code: "ELEKTRONIK", name: "Elektronik" },
  });
  const items = [
    {
      itemCode: "ELK-LPT-00128",
      name: "Laptop Lenovo ThinkPad E14",
      unit: "unit",
      totalQuantity: 12,
      availableQuantity: 7,
      location: "Gudang Fasilitas Balai Kota",
      condition: ItemCondition.GOOD,
      status: "AVAILABLE" as const,
      procurementYear: 2025,
    },
    {
      itemCode: "ELK-PRO-00047",
      name: "Proyektor Epson EB-E01",
      unit: "unit",
      totalQuantity: 8,
      availableQuantity: 4,
      location: "Gudang Fasilitas Balai Kota",
      condition: ItemCondition.GOOD,
      status: "AVAILABLE" as const,
      procurementYear: 2024,
    },
    {
      itemCode: "MEU-KRS-00082",
      name: "Kursi Lipat Chitose",
      unit: "buah",
      totalQuantity: 100,
      availableQuantity: 65,
      location: "Gudang Perlengkapan Balaikota",
      condition: ItemCondition.GOOD,
      status: "AVAILABLE" as const,
      procurementYear: 2023,
    },
    {
      itemCode: "AUD-SPK-00031",
      name: "Portable Sound System",
      unit: "set",
      totalQuantity: 5,
      availableQuantity: 0,
      location: "Gudang Fasilitas Balai Kota",
      condition: ItemCondition.GOOD,
      status: "OUT_OF_STOCK" as const,
      procurementYear: 2024,
    },
    {
      itemCode: "TRN-MBL-00009",
      name: "Toyota HiAce Premio",
      unit: "unit",
      totalQuantity: 2,
      availableQuantity: 1,
      location: "Pool Kendaraan Balaikota",
      condition: ItemCondition.LIGHTLY_DAMAGED,
      status: "AVAILABLE" as const,
      procurementYear: 2022,
    },
    {
      itemCode: "TND-RPT-00056",
      name: "Tenda Kerucut 3 x 3 Meter",
      unit: "unit",
      totalQuantity: 20,
      availableQuantity: 0,
      location: "Gudang Perlengkapan Balaikota",
      condition: ItemCondition.HEAVILY_DAMAGED,
      status: "INACTIVE" as const,
      procurementYear: 2023,
    },
    {
      itemCode: "ELK-LYR-00018",
      name: "Layar Proyektor 100 inci",
      unit: "unit",
      totalQuantity: 6,
      availableQuantity: 6,
      location: "Gudang Fasilitas Balai Kota",
      condition: ItemCondition.GOOD,
      status: "AVAILABLE" as const,
      procurementYear: 2024,
    },
  ];
  const seededItems = [];
  for (const entry of items) {
    seededItems.push(
      await prisma.item.upsert({
        where: { itemCode: entry.itemCode },
        update: {},
        create: {
          ...entry,
          categoryId: electronics.id,
          skpdId: setda.id,
        },
      }),
    );
  }

  const borrower = users.get(Role.BORROWER);
  if (!borrower) throw new Error("Akun pegawai seed gagal dibuat");
  await prisma.borrowingRequest.upsert({
    where: { registrationNumber: "SIPINTER/PMK/VII/2026/00128" },
    update: {},
    create: {
      registrationNumber: "SIPINTER/PMK/VII/2026/00128",
      borrowerId: borrower.id,
      skpdId: bpkad.id,
      purpose: "Kegiatan Pemerintah Kota Makassar",
      activityLocation: "Balai Kota Makassar",
      borrowDate: new Date("2026-07-21T00:00:00.000Z"),
      plannedReturnDate: new Date("2026-07-23T00:00:00.000Z"),
      ktpFile: "https://demo.invalid/sipinter/ktp-ahmad-ramadhan.pdf",
      approvalLetterFile:
        "https://demo.invalid/sipinter/surat-persetujuan-00128.pdf",
      status: BorrowingStatus.DRAFT,
      items: {
        create: seededItems.slice(0, 2).map((item) => ({
          itemId: item.id,
          quantity: 1,
          initialCondition: ItemCondition.GOOD,
        })),
      },
    },
  });

  const notificationSeeds = [
    { role: Role.BORROWER, type: NotificationType.ACTION_REQUIRED, title: "Perbaiki dokumen pengajuan", message: "Surat tugas untuk SIPINTER/PMK/VII/2026/00110 perlu ditandatangani pimpinan sebelum dapat diproses.", link: "/peminjam/peminjaman/borrow-007" },
    { role: Role.BORROWER, type: NotificationType.WARNING, title: "Pengembalian jatuh tempo besok", message: "Laptop Lenovo ThinkPad E14 perlu dikembalikan beserta bukti foto kondisi akhir.", link: "/peminjam/pengembalian/borrow-005" },
    { role: Role.BORROWER, type: NotificationType.WAITING, title: "Pengajuan sedang diverifikasi", message: "Petugas sedang memeriksa kelengkapan dokumen pengajuan Anda.", link: "/peminjam/peminjaman/borrow-001" },
    { role: Role.ADMIN, type: NotificationType.WARNING, title: "2 pengajuan mendekati batas layanan", message: "Dua permohonan belum diverifikasi dan akan melewati target layanan hari ini.", link: "/admin/verifikasi" },
    { role: Role.ADMIN, type: NotificationType.ACTION_REQUIRED, title: "3 pengembalian perlu diverifikasi", message: "Bukti foto dan kondisi akhir inventaris menunggu pemeriksaan petugas.", link: "/admin/pengembalian" },
    { role: Role.ADMIN, type: NotificationType.WAITING, title: "4 pengajuan menunggu persetujuan Sekda", message: "Verifikasi administrasi telah selesai dan keputusan pimpinan masih diperlukan.", link: "/admin/verifikasi" },
    { role: Role.APPROVER, type: NotificationType.ACTION_REQUIRED, title: "4 keputusan menunggu persetujuan", message: "Permohonan telah diverifikasi administrator dan membutuhkan keputusan Anda.", link: "/sekda/menunggu" },
    { role: Role.APPROVER, type: NotificationType.WARNING, title: "Pengembalian terlambat perlu perhatian", message: "Satu peminjaman melewati batas waktu pengembalian lebih dari 24 jam.", link: "/sekda/laporan" },
    { role: Role.APPROVER, type: NotificationType.WAITING, title: "Administrasi pengajuan telah lengkap", message: "Permohonan rapat koordinasi perangkat daerah siap menunggu keputusan pimpinan.", link: "/sekda/menunggu" },
  ];
  for (const notification of notificationSeeds) {
    const { role, ...data } = notification;
    const user = users.get(role);
    if (!user) continue;
    const existing = await prisma.notification.findFirst({
      where: { userId: user.id, title: data.title, readAt: null },
      select: { id: true },
    });
    if (!existing) await prisma.notification.create({ data: { ...data, userId: user.id } });
  }

  console.info(
    "Seed SIPINTER selesai: SKPD, tiga akun demo, barang, dan SIPINTER/PMK/VII/2026/00128 dibuat.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
