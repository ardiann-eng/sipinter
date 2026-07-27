export type ApprovalStatus = "MENUNGGU" | "DISETUJUI" | "DITOLAK";

export interface ApprovalRecord {
  id: string;
  number: string;
  requester: string;
  nip: string;
  unit: string;
  skpd: string;
  purpose: string;
  location: string;
  submittedAt: string;
  verifiedAt: string;
  startDate: string;
  endDate: string;
  duration: string;
  items: Array<{ name: string; code: string; quantity: number; unit: string }>;
  admin: string;
  adminNote: string;
  status: ApprovalStatus;
  decidedAt?: string;
  decisionNote?: string;
}

export const pendingApprovals: ApprovalRecord[] = [
  {
    id: "borrow-002",
    number: "SIPINTER/PMK/VII/2026/00127",
    requester: "Nurul Fadilah, S.STP.",
    nip: "198806142015032004",
    unit: "Bagian Protokol dan Komunikasi Pimpinan",
    skpd: "Sekretariat Daerah Kota Makassar",
    purpose: "Rapat koordinasi percepatan pelaksanaan program prioritas perangkat daerah triwulan III",
    location: "Ruang Sipakatau, Kantor Balaikota Makassar",
    submittedAt: "16 Juli 2026, 14.35 WITA",
    verifiedAt: "17 Juli 2026, 09.18 WITA",
    startDate: "22 Juli 2026, 08.00 WITA",
    endDate: "22 Juli 2026, 16.30 WITA",
    duration: "1 hari",
    items: [
      { name: "Kursi Lipat Chitose", code: "MEU-KRS-00082", quantity: 30, unit: "buah" },
      { name: "Portable Sound System TOA", code: "AUD-SPK-00031", quantity: 1, unit: "set" },
      { name: "Proyektor Epson EB-E01", code: "ELK-PRO-00047", quantity: 1, unit: "unit" },
      { name: "Layar Proyektor 100 inci", code: "ELK-LYR-00018", quantity: 1, unit: "unit" },
    ],
    admin: "Syarifuddin, S.E.",
    adminNote: "Identitas pemohon, surat tugas, jadwal ruang, serta ketersediaan barang telah diverifikasi. Sound system kembali dari kegiatan sebelumnya pada 21 Juli 2026 pukul 17.00 WITA dan dijadwalkan pemeriksaan sebelum penyerahan.",
    status: "MENUNGGU",
  },
  {
    id: "borrow-005",
    number: "SIPINTER/PMK/VII/2026/00131",
    requester: "Andi Tenri Uleng, S.KM.",
    nip: "198905172014032006",
    unit: "Bidang Kesehatan Masyarakat",
    skpd: "Dinas Kesehatan Kota Makassar",
    purpose: "Dukungan sarana kegiatan Gerakan Masyarakat Hidup Sehat tingkat Kota Makassar",
    location: "Anjungan Pantai Losari",
    submittedAt: "17 Juli 2026, 10.42 WITA",
    verifiedAt: "17 Juli 2026, 15.20 WITA",
    startDate: "25 Juli 2026, 06.00 WITA",
    endDate: "25 Juli 2026, 12.00 WITA",
    duration: "1 hari",
    items: [
      { name: "Tenda Kerucut 3 x 3 Meter", code: "TND-RPT-00061", quantity: 8, unit: "unit" },
      { name: "Meja Lipat", code: "MEU-MJA-00044", quantity: 12, unit: "buah" },
    ],
    admin: "Syarifuddin, S.E.",
    adminNote: "Surat permohonan dan susunan acara lengkap. Delapan tenda pengganti telah dipastikan dalam kondisi baik oleh pengurus barang.",
    status: "MENUNGGU",
  },
  {
    id: "borrow-006",
    number: "SIPINTER/PMK/VII/2026/00132",
    requester: "Muhammad Akbar, S.Pd.",
    nip: "199102082020121005",
    unit: "Bidang Pembinaan Sekolah Dasar",
    skpd: "Dinas Pendidikan Kota Makassar",
    purpose: "Monitoring pelaksanaan masa pengenalan lingkungan sekolah dasar",
    location: "Kecamatan Tamalanrea dan Biringkanaya",
    submittedAt: "17 Juli 2026, 13.05 WITA",
    verifiedAt: "18 Juli 2026, 08.11 WITA",
    startDate: "23 Juli 2026, 07.30 WITA",
    endDate: "24 Juli 2026, 17.00 WITA",
    duration: "2 hari",
    items: [{ name: "Toyota HiAce Premio", code: "TRN-MBL-00009", quantity: 1, unit: "unit" }],
    admin: "Hasanuddin, S.A.P.",
    adminNote: "Surat tugas tim tersedia. Kendaraan dan pengemudi telah dikonfirmasi oleh Bagian Umum.",
    status: "MENUNGGU",
  },
  {
    id: "borrow-007",
    number: "SIPINTER/PMK/VII/2026/00134",
    requester: "Rahmat Hidayat, S.Kom.",
    nip: "199405212022031009",
    unit: "Bidang Aplikasi dan Informatika",
    skpd: "Dinas Komunikasi dan Informatika Kota Makassar",
    purpose: "Bimbingan teknis operator layanan persuratan elektronik perangkat daerah",
    location: "Makassar Government Center, Jalan Slamet Riyadi",
    submittedAt: "18 Juli 2026, 08.02 WITA",
    verifiedAt: "18 Juli 2026, 10.26 WITA",
    startDate: "27 Juli 2026, 08.00 WITA",
    endDate: "28 Juli 2026, 16.00 WITA",
    duration: "2 hari",
    items: [
      { name: "Laptop Lenovo ThinkPad E14", code: "ELK-LPT-00128", quantity: 5, unit: "unit" },
      { name: "Proyektor Epson EB-E01", code: "ELK-PRO-00047", quantity: 2, unit: "unit" },
    ],
    admin: "Hasanuddin, S.A.P.",
    adminNote: "Dokumen kegiatan lengkap. Stok telah dicadangkan dan tidak berbenturan dengan jadwal peminjaman lain.",
    status: "MENUNGGU",
  },
];

export const approvalHistory: ApprovalRecord[] = [
  { ...pendingApprovals[0], id: "borrow-008", number: "SIPINTER/PMK/VII/2026/00121", requester: "Fitriani, S.E.", skpd: "Badan Perencanaan Pembangunan Daerah Kota Makassar", unit: "Bidang Perencanaan Makro", purpose: "Forum konsultasi publik rancangan perubahan RKPD", decidedAt: "15 Juli 2026, 13.42 WITA", decisionNote: "Disetujui sesuai hasil verifikasi administrasi dan ketersediaan fasilitas.", status: "DISETUJUI" },
  { ...pendingApprovals[1], id: "borrow-009", number: "SIPINTER/PMK/VII/2026/00116", requester: "Arman Saleh, S.Sos.", skpd: "Dinas Pemuda dan Olahraga Kota Makassar", unit: "Bidang Pembudayaan Olahraga", purpose: "Kegiatan olahraga bersama komunitas tingkat kecamatan", decidedAt: "12 Juli 2026, 10.06 WITA", decisionNote: "Jadwal penggunaan tenda berbenturan dengan agenda resmi Pemerintah Kota. Ajukan kembali dengan tanggal alternatif.", status: "DITOLAK" },
  { ...pendingApprovals[2], id: "borrow-010", number: "SIPINTER/PMK/VII/2026/00112", requester: "Nur Alam, S.T.", skpd: "Dinas Pekerjaan Umum Kota Makassar", unit: "Sekretariat", purpose: "Peninjauan lapangan pekerjaan drainase kawasan Manggala", decidedAt: "10 Juli 2026, 16.18 WITA", decisionNote: "Disetujui untuk mendukung pelaksanaan tugas kedinasan.", status: "DISETUJUI" },
  { ...pendingApprovals[3], id: "borrow-011", number: "SIPINTER/PMK/VII/2026/00108", requester: "Sri Wahyuni, S.E.", skpd: "Badan Keuangan dan Aset Daerah Kota Makassar", unit: "Bidang Aset", purpose: "Rekonsiliasi data barang milik daerah semester I", decidedAt: "8 Juli 2026, 09.34 WITA", decisionNote: "Disetujui dengan kewajiban pengembalian pada hari yang sama.", status: "DISETUJUI" },
];

export const allApprovals = [...pendingApprovals, ...approvalHistory];

export function findApproval(id: string) {
  return allApprovals.find((record) => record.id === id);
}
