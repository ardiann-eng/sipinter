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
  const setda = seededSkpd.find((entry) => entry.code === "SETDA");
  const bpkad = seededSkpd.find((entry) => entry.code === "BPKAD");
  if (!setda || !bpkad) throw new Error("Data SKPD inti gagal dibuat");

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

  const vehicles = await prisma.itemCategory.upsert({
    where: { code: "KENDARAAN" },
    update: { name: "Kendaraan Dinas" },
    create: { code: "KENDARAAN", name: "Kendaraan Dinas" },
  });
  const rooms = await prisma.itemCategory.upsert({
    where: { code: "RUANGAN" },
    update: {
      name: "Ruangan Pertemuan",
      description: "Ruangan rapat dan kegiatan di lingkungan Balai Kota Makassar.",
    },
    create: {
      code: "RUANGAN",
      name: "Ruangan Pertemuan",
      description: "Ruangan rapat dan kegiatan di lingkungan Balai Kota Makassar.",
    },
  });
  const eventEquipment = await prisma.itemCategory.upsert({
    where: { code: "PERLENGKAPAN_ACARA" },
    update: {
      name: "Perlengkapan Acara",
      description: "Perlengkapan pendukung rapat, seremoni, dan kegiatan kedinasan.",
    },
    create: {
      code: "PERLENGKAPAN_ACARA",
      name: "Perlengkapan Acara",
      description: "Perlengkapan pendukung rapat, seremoni, dan kegiatan kedinasan.",
    },
  });
  const categories = new Map([
    ["KENDARAAN", vehicles.id],
    ["RUANGAN", rooms.id],
    ["PERLENGKAPAN_ACARA", eventEquipment.id],
  ]);
  const items = [
    {
      categoryCode: "KENDARAAN",
      legacyItemCode: "ELK-LPT-00128",
      itemCode: "KDR-BUS-7106A",
      registrationNumber: "DD 7106 A",
      name: "Bus Penumpang 25 Seat",
      unit: "kendaraan",
      totalQuantity: 1,
      availableQuantity: 1,
      location: "Pool Kendaraan Balaikota",
      condition: ItemCondition.GOOD,
      status: "AVAILABLE" as const,
      procurementYear: 2022,
      mainPhoto: "/kendaraan/bus-25-seat-dd-7106-a.jpg",
      description: "Bus dinas DD 7106 A dengan kapasitas maksimal 25 penumpang.",
    },
    {
      categoryCode: "KENDARAAN",
      legacyItemCode: "ELK-PRO-00047",
      itemCode: "KDR-BUS-7003AD",
      registrationNumber: "DD 7003 AD",
      name: "Bus Penumpang 30 Seat",
      unit: "kendaraan",
      totalQuantity: 1,
      availableQuantity: 1,
      location: "Pool Kendaraan Balaikota",
      condition: ItemCondition.GOOD,
      status: "AVAILABLE" as const,
      procurementYear: 2021,
      mainPhoto: "/kendaraan/bus-30-seat-dd-7003-ad.jpg",
      description: "Bus dinas DD 7003 AD dengan kapasitas maksimal 30 penumpang.",
    },
    {
      categoryCode: "KENDARAAN",
      legacyItemCode: "MEU-KRS-00082",
      itemCode: "KDR-BUS-7013RV",
      registrationNumber: "DD 7013 RV",
      name: "Bus Penumpang 25 Seat",
      unit: "kendaraan",
      totalQuantity: 1,
      availableQuantity: 1,
      location: "Pool Kendaraan Balaikota",
      condition: ItemCondition.GOOD,
      status: "AVAILABLE" as const,
      procurementYear: 2023,
      mainPhoto: "/kendaraan/bus-25-seat-dd-7013-rv.jpg",
      description: "Bus dinas DD 7013 RV dengan kapasitas maksimal 25 penumpang.",
    },
    {
      categoryCode: "KENDARAAN",
      legacyItemCode: "AUD-SPK-00031",
      itemCode: "KDR-HAC-7122A",
      registrationNumber: "DD 7122 A",
      name: "HiAce 16 Seat",
      unit: "kendaraan",
      totalQuantity: 1,
      availableQuantity: 1,
      location: "Pool Kendaraan Balaikota",
      condition: ItemCondition.GOOD,
      status: "AVAILABLE" as const,
      procurementYear: 2024,
      mainPhoto: "/kendaraan/hiace-16-seat-dd-7122-a.jpg",
      description: "Toyota HiAce DD 7122 A dengan kapasitas maksimal 16 penumpang.",
    },
    {
      categoryCode: "KENDARAAN",
      legacyItemCode: "TRN-MBL-00009",
      itemCode: "KDR-HAP-7215RF",
      registrationNumber: "DD 7215 RF",
      name: "HiAce Premio",
      unit: "kendaraan",
      totalQuantity: 1,
      availableQuantity: 1,
      location: "Pool Kendaraan Balaikota",
      condition: ItemCondition.GOOD,
      status: "AVAILABLE" as const,
      procurementYear: 2022,
      mainPhoto: "/kendaraan/hiace-premio-dd-7215-rf.jpg",
      description: "Toyota HiAce Premio DD 7215 RF untuk perjalanan dinas.",
    },
    {
      categoryCode: "KENDARAAN",
      legacyItemCode: "TND-RPT-00056",
      itemCode: "KDR-HAC-7001TF",
      registrationNumber: "DD 7001 TF",
      name: "HiAce 12 Seat",
      unit: "kendaraan",
      totalQuantity: 1,
      availableQuantity: 1,
      location: "Pool Kendaraan Balaikota",
      condition: ItemCondition.GOOD,
      status: "AVAILABLE" as const,
      procurementYear: 2023,
      mainPhoto: "/kendaraan/hiace-12-seat-dd-7001-tf.jpg",
      description: "Toyota HiAce DD 7001 TF dengan kapasitas maksimal 12 penumpang.",
    },
    {
      categoryCode: "RUANGAN",
      legacyItemCode: "RGN-SPK-001",
      itemCode: "RGN-SPK-001",
      registrationNumber: null,
      name: "Ruangan Sipakatau",
      unit: "ruangan",
      totalQuantity: 1,
      availableQuantity: 1,
      location: "Balai Kota Makassar",
      condition: ItemCondition.GOOD,
      status: "AVAILABLE" as const,
      procurementYear: 2026,
      mainPhoto: "/barang-peminjaman/ruangan-sipakatau.jpg",
      description:
        "Ruangan pertemuan berkapasitas maksimal 300 orang, dilengkapi meja pimpinan, tata suara, dan layar presentasi.",
    },
    {
      categoryCode: "RUANGAN",
      legacyItemCode: "RGN-SPL-001",
      itemCode: "RGN-SPL-001",
      registrationNumber: null,
      name: "Ruangan Sipakalebbi",
      unit: "ruangan",
      totalQuantity: 1,
      availableQuantity: 1,
      location: "Balai Kota Makassar",
      condition: ItemCondition.GOOD,
      status: "AVAILABLE" as const,
      procurementYear: 2026,
      mainPhoto: "/barang-peminjaman/ruangan-sipakalebbi.jpg",
      description:
        "Ruangan rapat berkapasitas maksimal 50 orang dengan tempat duduk bertingkat dan fasilitas presentasi.",
    },
    {
      categoryCode: "PERLENGKAPAN_ACARA",
      legacyItemCode: "PRL-KRS-001",
      itemCode: "PRL-KRS-001",
      registrationNumber: null,
      name: "Kursi Futura",
      unit: "kursi",
      totalQuantity: 300,
      availableQuantity: 300,
      location: "Gudang Perlengkapan Balai Kota Makassar",
      condition: ItemCondition.GOOD,
      status: "AVAILABLE" as const,
      procurementYear: 2026,
      mainPhoto: "/barang-peminjaman/kursi-futura.jpg",
      description:
        "Kursi Futura dengan sarung putih untuk rapat, seremoni, dan kegiatan resmi. Tersedia hingga 300 kursi.",
    },
    {
      categoryCode: "PERLENGKAPAN_ACARA",
      legacyItemCode: "PRL-TND-001",
      itemCode: "PRL-TND-001",
      registrationNumber: null,
      name: "Tenda Kegiatan",
      unit: "unit",
      totalQuantity: 10,
      availableQuantity: 10,
      location: "Gudang Perlengkapan Balai Kota Makassar",
      condition: ItemCondition.GOOD,
      status: "AVAILABLE" as const,
      procurementYear: 2026,
      mainPhoto: "/barang-peminjaman/tenda-kegiatan.jpg",
      description:
        "Tenda kegiatan untuk kebutuhan acara luar ruangan di lingkungan Pemerintah Kota Makassar.",
    },
  ];
  const seededItems = [];
  for (const entry of items) {
    const { categoryCode, legacyItemCode, ...item } = entry;
    const categoryId = categories.get(categoryCode);
    if (!categoryId) throw new Error(`Kategori ${categoryCode} belum dibuat`);
    const existing =
      (await prisma.item.findUnique({ where: { itemCode: item.itemCode } })) ??
      (await prisma.item.findUnique({ where: { itemCode: legacyItemCode } }));
    const data = {
      ...item,
      categoryId,
      skpdId: setda.id,
    };
    seededItems.push(
      existing
        ? await prisma.item.update({ where: { id: existing.id }, data })
        : await prisma.item.create({ data }),
    );
  }
  await prisma.item.updateMany({
    where: {
      itemCode: {
        in: [
          "ELK-LPT-00128",
          "ELK-PRO-00047",
          "MEU-KRS-00082",
          "AUD-SPK-00031",
          "TRN-MBL-00009",
          "TND-RPT-00056",
          "ELK-LYR-00018",
        ],
      },
    },
    data: { status: "INACTIVE", availableQuantity: 0 },
  });

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
    { role: Role.BORROWER, type: NotificationType.WARNING, title: "Pengembalian jatuh tempo besok", message: "Bus Penumpang 25 Seat perlu dikembalikan beserta bukti foto kondisi akhir kendaraan.", link: "/peminjam/pengembalian/borrow-005" },
    { role: Role.BORROWER, type: NotificationType.WAITING, title: "Pengajuan sedang diverifikasi", message: "Petugas sedang memeriksa kelengkapan dokumen pengajuan Anda.", link: "/peminjam/peminjaman/borrow-001" },
    { role: Role.ADMIN, type: NotificationType.WARNING, title: "2 pengajuan mendekati batas layanan", message: "Dua permohonan belum diverifikasi dan akan melewati target layanan hari ini.", link: "/admin/verifikasi" },
    { role: Role.ADMIN, type: NotificationType.ACTION_REQUIRED, title: "3 pengembalian perlu diverifikasi", message: "Bukti foto dan kondisi akhir kendaraan menunggu pemeriksaan petugas.", link: "/admin/pengembalian" },
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
    "Seed SIPINTER selesai: SKPD, tiga akun demo, inventaris, dan SIPINTER/PMK/VII/2026/00128 dibuat.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
