import { createClient } from "@libsql/client";

const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3100";
const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!databaseUrl || !authToken) throw new Error("Database E2E belum dikonfigurasi");

const db = createClient({ url: databaseUrl, authToken });
const results = [];

function check(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/login`, { redirect: "manual" });
      if (response.status === 200) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Server E2E tidak siap");
}

async function login(identifier, password, role) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const body = await response.json();
  check(response.status === 200, `Login ${role} gagal: ${response.status} ${body.error ?? ""}`);
  const rawCookie = response.headers.getSetCookie?.()[0] ?? response.headers.get("set-cookie");
  check(rawCookie, `Cookie sesi ${role} tidak diterima`);
  results.push(`login ${role}`);
  return rawCookie.split(";", 1)[0];
}

async function call(path, { cookie, expected = 200, ...options } = {}) {
  const headers = new Headers(options.headers);
  if (cookie) headers.set("cookie", cookie);
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers, redirect: "manual" });
  const text = await response.text();
  check(response.status === expected, `${options.method ?? "GET"} ${path}: diharapkan ${expected}, diterima ${response.status}: ${text.slice(0, 300)}`);
  return { response, text, json: () => JSON.parse(text) };
}

function png(name) {
  return new File([Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])], name, { type: "image/png" });
}

await waitForServer();
try {
  const borrowerCookie = await login(process.env.DEMO_BORROWER_EMAIL, process.env.DEMO_BORROWER_PASSWORD, "peminjam");
  const adminCookie = await login(process.env.DEMO_ADMIN_EMAIL, process.env.DEMO_ADMIN_PASSWORD, "admin");
  const approverCookie = await login(process.env.DEMO_APPROVER_EMAIL, process.env.DEMO_APPROVER_PASSWORD, "sekda");

  const itemResult = await db.execute('SELECT "id", "condition", "availableQuantity" FROM "Item" WHERE "status" = \'AVAILABLE\' AND "availableQuantity" > 0 ORDER BY "itemCode" LIMIT 1');
  check(itemResult.rows.length === 1, "Tidak ada kendaraan tersedia untuk tes");
  const item = itemResult.rows[0];
  const initialStock = Number(item.availableQuantity);
  const today = new Date().toISOString().slice(0, 10);
  const form = new FormData();
  form.set("purpose", `Tes alur lengkap kendaraan ${Date.now()}`);
  form.set("location", "Pool kendaraan Bagian Umum");
  form.set("startDate", today);
  form.set("endDate", today);
  form.set("ktp", png("ktp-e2e.png"));
  form.set("supporting", png("surat-tugas-e2e.png"));
  form.set("items", JSON.stringify([{ itemId: item.id, quantity: 1, initialCondition: item.condition }]));
  const created = await call("/api/borrowing-requests", { method: "POST", body: form, cookie: borrowerCookie, expected: 201 });
  const requestId = created.json().id;
  check(requestId, "API tidak mengembalikan ID pengajuan");
  results.push("pengajuan dibuat");

  await call(`/peminjam/peminjaman/${requestId}`, { cookie: borrowerCookie });
  await call(`/api/borrowing-requests/${requestId}/transition`, { method: "POST", cookie: borrowerCookie, headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "FORWARD_TO_APPROVER" }), expected: 403 });
  await call(`/admin/verifikasi/${requestId}`, { cookie: adminCookie });
  const forwarded = await call(`/api/borrowing-requests/${requestId}/transition`, { method: "POST", cookie: adminCookie, headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "FORWARD_TO_APPROVER", note: "Dokumen dan kendaraan telah diverifikasi." }) });
  check(forwarded.json().status === "WAITING_SEKDA_APPROVAL", "Status setelah verifikasi admin keliru");
  results.push("verifikasi admin");

  await call(`/sekda/menunggu/${requestId}`, { cookie: approverCookie });
  const approved = await call(`/api/borrowing-requests/${requestId}/transition`, { method: "POST", cookie: approverCookie, headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "APPROVE", note: "Disetujui untuk kegiatan kedinasan." }) });
  check(approved.json().status === "APPROVED", "Status persetujuan Sekda keliru");
  results.push("persetujuan sekda");

  await call("/admin/penyerahan", { cookie: adminCookie });
  const prepare = new FormData();
  prepare.set("stage", "PREPARE");
  const prepared = await call(`/api/borrowing-requests/${requestId}/handover`, { method: "POST", body: prepare, cookie: adminCookie });
  check(prepared.json().status === "READY_FOR_HANDOVER", "Status persiapan penyerahan keliru");
  const invalidHandover = new FormData();
  invalidHandover.set("stage", "HANDOVER");
  invalidHandover.set("proof", png("bukti-serah-terima.png"));
  await call(`/api/borrowing-requests/${requestId}/handover`, { method: "POST", body: invalidHandover, cookie: adminCookie, expected: 400 });
  const handover = new FormData();
  handover.set("stage", "HANDOVER");
  handover.set("confirmed", "on");
  handover.set("note", "Kunci, dokumen, dan kondisi kendaraan lengkap.");
  handover.set("proof", png("bukti-serah-terima.png"));
  const borrowed = await call(`/api/borrowing-requests/${requestId}/handover`, { method: "POST", body: handover, cookie: adminCookie });
  check(borrowed.json().status === "BORROWED", "Status serah terima keliru");
  results.push("serah terima");

  await call(`/peminjam/pengembalian/${requestId}`, { cookie: borrowerCookie });
  const returnedForm = new FormData();
  returnedForm.set("returnedAt", today);
  returnedForm.set("condition", "GOOD");
  returnedForm.set("note", "Kendaraan dikembalikan lengkap dan bersih.");
  returnedForm.append("photos", png("kondisi-depan.png"));
  returnedForm.append("photos", png("kondisi-belakang.png"));
  await call(`/api/borrowing-requests/${requestId}/return`, { method: "POST", body: returnedForm, cookie: borrowerCookie, expected: 201 });
  await call(`/api/borrowing-requests/${requestId}/return-verification`, { method: "POST", cookie: borrowerCookie, headers: { "content-type": "application/json" }, body: JSON.stringify({ itemComplete: true, accessoriesComplete: true, physicallyIntact: true, functioningProperly: true, result: "ACCEPTED" }), expected: 403 });
  await call(`/admin/pengembalian/${requestId}`, { cookie: adminCookie });
  const verified = await call(`/api/borrowing-requests/${requestId}/return-verification`, { method: "POST", cookie: adminCookie, headers: { "content-type": "application/json" }, body: JSON.stringify({ itemComplete: true, accessoriesComplete: true, physicallyIntact: true, functioningProperly: true, result: "ACCEPTED" }) });
  check(verified.json().status === "COMPLETED", "Status akhir pengembalian keliru");
  results.push("pengembalian selesai");

  const state = await db.execute({ sql: 'SELECT "status", "ktpFile" FROM "BorrowingRequest" WHERE "id" = ?', args: [requestId] });
  const stock = await db.execute({ sql: 'SELECT "availableQuantity" FROM "Item" WHERE "id" = ?', args: [item.id] });
  check(state.rows[0]?.status === "COMPLETED", "Database tidak mencatat status COMPLETED");
  check(Number(stock.rows[0]?.availableQuantity) === initialStock, "Stok kendaraan tidak pulih setelah pengembalian");
  await call(`/api/uploads/${encodeURIComponent(state.rows[0].ktpFile)}`, { cookie: borrowerCookie });
  await call(`/api/uploads/${encodeURIComponent(state.rows[0].ktpFile)}`, { expected: 401 });

  const pageChecks = [
    [borrowerCookie, "/peminjam/beranda"], [borrowerCookie, "/peminjam/peminjaman"], [borrowerCookie, "/peminjam/pengembalian"], [borrowerCookie, "/peminjam/riwayat"],
    [adminCookie, "/admin/ringkasan"], [adminCookie, "/admin/barang"], [adminCookie, "/admin/verifikasi"], [adminCookie, "/admin/penyerahan"], [adminCookie, "/admin/pengembalian"], [adminCookie, "/admin/laporan"], [adminCookie, "/admin/audit"], [adminCookie, "/admin/pengguna"], [adminCookie, "/admin/pengaturan"],
    [approverCookie, "/sekda/menunggu"], [approverCookie, "/sekda/riwayat"], [approverCookie, "/sekda/laporan"], [approverCookie, "/sekda/profil"],
  ];
  for (const [cookie, path] of pageChecks) await call(path, { cookie });
  const vehicles = await db.execute('SELECT "name", "registrationNumber", "mainPhoto" FROM "Item" ORDER BY "itemCode"');
  check(vehicles.rows.length === 6, `Katalog seharusnya berisi 6 kendaraan, ditemukan ${vehicles.rows.length}`);
  check(vehicles.rows.every((vehicle) => vehicle.registrationNumber && vehicle.mainPhoto), "Nomor polisi atau foto kendaraan belum lengkap");
  results.push(`${pageChecks.length} halaman peran merespons normal`);
  console.log(`E2E lulus: ${results.join(" → ")}`);
} finally {
  db.close();
}
