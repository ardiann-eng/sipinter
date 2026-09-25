import { createClient } from "@libsql/client";

const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3100";
const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
const cronSecret = process.env.CRON_SECRET;
if (!databaseUrl || !authToken || !cronSecret) throw new Error("Database dan CRON_SECRET E2E belum dikonfigurasi");

const db = createClient({ url: databaseUrl, authToken });
const results = [];

function check(condition, message) { if (!condition) throw new Error(message); }
function dateOffset(days) { const date = new Date(); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); }
function dateTimeOffset(days) { const date = new Date(); date.setUTCDate(date.getUTCDate() + days); return date.toISOString(); }
function png(name) { return new File([Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])], name, { type: "image/png" }); }

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try { if ((await fetch(`${baseUrl}/login`, { redirect: "manual" })).status === 200) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Server E2E tidak siap");
}

async function login(identifier, password, role, expected = 200) {
  const response = await fetch(`${baseUrl}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ identifier, password }) });
  const body = await response.json();
  check(response.status === expected, `Login ${role}: diharapkan ${expected}, diterima ${response.status} ${body.error ?? ""}`);
  if (expected !== 200) return null;
  const rawCookie = response.headers.getSetCookie?.()[0] ?? response.headers.get("set-cookie");
  check(rawCookie, `Cookie sesi ${role} tidak diterima`);
  return rawCookie.split(";", 1)[0];
}

async function call(path, { cookie, expected = 200, ...options } = {}) {
  const headers = new Headers(options.headers);
  if (cookie) headers.set("cookie", cookie);
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers, redirect: "manual" });
  const text = await response.text();
  check(response.status === expected, `${options.method ?? "GET"} ${path}: diharapkan ${expected}, diterima ${response.status}: ${text.slice(0, 300)}`);
  return { text, json: () => JSON.parse(text) };
}

function requestForm(item, purpose, { files = true } = {}) {
  const form = new FormData();
  form.set("purpose", purpose);
  form.set("location", "Pool kendaraan Bagian Umum");
  form.set("startDate", dateOffset(0));
  form.set("endDate", dateOffset(0));
  if (files) { form.set("ktp", png("ktp-e2e.png")); form.set("supporting", png("surat-tugas-e2e.png")); }
  form.set("items", JSON.stringify([{ itemId: item.id, quantity: 1, initialCondition: item.condition }]));
  return form;
}

async function transition(id, cookie, action, note, expected = 200) {
  return call(`/api/borrowing-requests/${id}/transition`, { method: "POST", cookie, headers: { "content-type": "application/json" }, body: JSON.stringify({ action, note }), expected });
}

await waitForServer();
try {
  const borrowerCookie = await login(process.env.DEMO_BORROWER_EMAIL, process.env.DEMO_BORROWER_PASSWORD, "peminjam");
  const adminCookie = await login(process.env.DEMO_ADMIN_EMAIL, process.env.DEMO_ADMIN_PASSWORD, "admin");
  const approverCookie = await login(process.env.DEMO_APPROVER_EMAIL, process.env.DEMO_APPROVER_PASSWORD, "sekda");
  results.push("login tiga peran");

  const itemResult = await db.execute('SELECT "id", "condition", "availableQuantity" FROM "Item" WHERE "status" = \'AVAILABLE\' AND "availableQuantity" > 0 ORDER BY "itemCode" LIMIT 2');
  check(itemResult.rows.length === 2, "Tes membutuhkan dua kendaraan tersedia");
  const [item, secondItem] = itemResult.rows;
  const initialStock = Number(item.availableQuantity);

  await db.batch([
    { sql: 'INSERT INTO "Setting" ("key", "value", "updatedAt") VALUES (\'minimumLeadDays\', \'2\', CURRENT_TIMESTAMP) ON CONFLICT("key") DO UPDATE SET "value" = \'2\'', args: [] },
    { sql: 'INSERT INTO "Setting" ("key", "value", "updatedAt") VALUES (\'standardDurationDays\', \'7\', CURRENT_TIMESTAMP) ON CONFLICT("key") DO UPDATE SET "value" = \'7\'', args: [] },
    { sql: 'INSERT INTO "Setting" ("key", "value", "updatedAt") VALUES (\'returnReminder\', \'true\', CURRENT_TIMESTAMP) ON CONFLICT("key") DO UPDATE SET "value" = \'true\'', args: [] },
    { sql: 'INSERT INTO "Setting" ("key", "value", "updatedAt") VALUES (\'overdueEscalation\', \'true\', CURRENT_TIMESTAMP) ON CONFLICT("key") DO UPDATE SET "value" = \'true\'', args: [] },
  ], "write");
  await call("/api/borrowing-requests", { method: "POST", body: requestForm(item, "Tes kebijakan jeda minimum"), cookie: borrowerCookie, expected: 400 });
  await db.execute('UPDATE "Setting" SET "value" = \'0\' WHERE "key" = \'minimumLeadDays\'');
  results.push("aturan jadwal tervalidasi");

  const created = await call("/api/borrowing-requests", { method: "POST", body: requestForm(item, `Tes alur utama ${Date.now()}`), cookie: borrowerCookie, expected: 201 });
  const requestId = created.json().id;
  await transition(requestId, borrowerCookie, "FORWARD_TO_APPROVER", undefined, 403);
  await transition(requestId, adminCookie, "FORWARD_TO_APPROVER", "Dokumen dan jadwal telah diverifikasi.");
  await transition(requestId, approverCookie, "APPROVE", "Disetujui untuk kegiatan kedinasan.");
  results.push("verifikasi dan persetujuan");

  const conflict = await call("/api/borrowing-requests", { method: "POST", body: requestForm(item, `Tes konflik jadwal ${Date.now()}`), cookie: borrowerCookie, expected: 201 });
  const conflictId = conflict.json().id;
  await transition(conflictId, adminCookie, "FORWARD_TO_APPROVER", "Periksa konflik jadwal.", 400);
  await transition(conflictId, adminCookie, "REJECT", "Kendaraan telah dialokasikan pada jadwal yang sama.");
  results.push("konflik jadwal ditolak");

  const revisionCreated = await call("/api/borrowing-requests", { method: "POST", body: requestForm(secondItem, `Tes revisi ${Date.now()}`), cookie: borrowerCookie, expected: 201 });
  const revisionId = revisionCreated.json().id;
  await transition(revisionId, adminCookie, "REQUEST_REVISION", "Perjelas keperluan kegiatan dan kirim ulang.");
  await call(`/peminjam/ajukan?revision=${revisionId}`, { cookie: borrowerCookie });
  const resubmitted = await call(`/api/borrowing-requests/${revisionId}/resubmit`, { method: "POST", body: requestForm(secondItem, "Tes revisi dengan keperluan yang sudah diperjelas", { files: false }), cookie: borrowerCookie });
  check(resubmitted.json().status === "WAITING_ADMIN_VERIFICATION", "Revisi tidak kembali ke verifikasi admin");
  await transition(revisionId, adminCookie, "FORWARD_TO_APPROVER", "Revisi lengkap.");
  await transition(revisionId, approverCookie, "REJECT", "Kegiatan belum menjadi prioritas penggunaan kendaraan.");
  results.push("revisi dan penolakan");

  const prepare = new FormData(); prepare.set("stage", "PREPARE");
  await call(`/api/borrowing-requests/${requestId}/handover`, { method: "POST", body: prepare, cookie: adminCookie });
  const invalidHandover = new FormData(); invalidHandover.set("stage", "HANDOVER"); invalidHandover.set("proof", png("bukti.png"));
  await call(`/api/borrowing-requests/${requestId}/handover`, { method: "POST", body: invalidHandover, cookie: adminCookie, expected: 400 });
  const handover = new FormData(); handover.set("stage", "HANDOVER"); handover.set("confirmed", "on"); handover.set("note", "Kunci dan dokumen lengkap."); handover.set("proof", png("bukti.png"));
  check((await call(`/api/borrowing-requests/${requestId}/handover`, { method: "POST", body: handover, cookie: adminCookie })).json().status === "BORROWED", "Serah terima gagal");

  const returned = new FormData(); returned.set("returnedAt", dateOffset(0)); returned.set("condition", "LIGHTLY_DAMAGED"); returned.set("note", "Ada goresan dan perlu pemeriksaan."); returned.append("photos", png("depan.png")); returned.append("photos", png("belakang.png"));
  await call(`/api/borrowing-requests/${requestId}/return`, { method: "POST", body: returned, cookie: borrowerCookie, expected: 201 });
  const problem = await call(`/api/borrowing-requests/${requestId}/return-verification`, { method: "POST", cookie: adminCookie, headers: { "content-type": "application/json" }, body: JSON.stringify({ itemComplete: true, accessoriesComplete: true, physicallyIntact: false, functioningProperly: true, result: "PROBLEM", issueType: "DAMAGED", issueDescription: "Terdapat goresan pada sisi kanan kendaraan.", followUpRecommendation: "Lakukan pemeriksaan dan perbaikan bodi." }) });
  check(problem.json().status === "RETURN_PROBLEM", "Masalah pengembalian tidak tercatat");
  await call(`/admin/pengembalian/${requestId}`, { cookie: adminCookie });
  const resolved = await call(`/api/borrowing-requests/${requestId}/return-verification`, { method: "POST", cookie: adminCookie, headers: { "content-type": "application/json" }, body: JSON.stringify({ itemComplete: true, accessoriesComplete: true, physicallyIntact: true, functioningProperly: true, result: "ACCEPTED", serviceableReturnConfirmed: true, resolutionNote: "Perbaikan bodi selesai dan kendaraan sudah diperiksa ulang." }) });
  check(resolved.json().status === "COMPLETED", "Penyelesaian pengembalian bermasalah gagal");
  results.push("serah terima dan masalah pengembalian selesai");

  const state = await db.execute({ sql: 'SELECT "status", "ktpFile" FROM "BorrowingRequest" WHERE "id" = ?', args: [requestId] });
  const stock = await db.execute({ sql: 'SELECT "availableQuantity" FROM "Item" WHERE "id" = ?', args: [item.id] });
  check(state.rows[0]?.status === "COMPLETED", "Database tidak mencatat status COMPLETED");
  check(Number(stock.rows[0]?.availableQuantity) === initialStock, "Stok kendaraan tidak pulih");
  await call(`/api/uploads/${encodeURIComponent(state.rows[0].ktpFile)}`, { cookie: borrowerCookie });
  await call(`/api/uploads/${encodeURIComponent(state.rows[0].ktpFile)}`, { expected: 401 });

  await db.execute({ sql: 'UPDATE "BorrowingRequest" SET "status" = \'BORROWED\', "plannedReturnDate" = ? WHERE "id" = ?', args: [dateTimeOffset(1), revisionId] });
  const reminder = await call("/api/maintenance/borrowing", { headers: { authorization: `Bearer ${cronSecret}` } });
  check(reminder.json().reminders >= 1, "Reminder pengembalian tidak dibuat");
  await db.execute({ sql: 'UPDATE "BorrowingRequest" SET "plannedReturnDate" = ? WHERE "id" = ?', args: [dateTimeOffset(-1), revisionId] });
  const overdue = await call("/api/maintenance/borrowing", { headers: { authorization: `Bearer ${cronSecret}` } });
  check(overdue.json().overdue >= 1, "Keterlambatan tidak ditandai otomatis");
  results.push("reminder dan overdue otomatis");

  const pageChecks = [
    [borrowerCookie, "/peminjam/beranda"], [borrowerCookie, "/peminjam/peminjaman"], [borrowerCookie, "/peminjam/pengembalian"], [borrowerCookie, "/peminjam/riwayat"],
    [adminCookie, "/admin/ringkasan"], [adminCookie, "/admin/barang"], [adminCookie, "/admin/verifikasi"], [adminCookie, "/admin/penyerahan"], [adminCookie, "/admin/pengembalian"], [adminCookie, "/admin/laporan"], [adminCookie, "/admin/audit"], [adminCookie, "/admin/pengguna"], [adminCookie, "/admin/pengaturan"],
    [approverCookie, "/sekda/menunggu"], [approverCookie, "/sekda/riwayat"], [approverCookie, "/sekda/laporan"], [approverCookie, "/sekda/profil"],
  ];
  for (const [cookie, path] of pageChecks) await call(path, { cookie });

  const borrower = await db.execute({ sql: 'SELECT "id" FROM "User" WHERE "email" = ?', args: [process.env.DEMO_BORROWER_EMAIL] });
  const borrowerId = borrower.rows[0].id;
  await call(`/api/users/${borrowerId}`, { method: "PATCH", cookie: adminCookie, headers: { "content-type": "application/json" }, body: JSON.stringify({ role: "APPROVER", status: "ACTIVE" }) });
  await call(`/api/users/${borrowerId}`, { method: "PATCH", cookie: adminCookie, headers: { "content-type": "application/json" }, body: JSON.stringify({ role: "BORROWER", status: "INACTIVE" }) });
  await login(process.env.DEMO_BORROWER_EMAIL, process.env.DEMO_BORROWER_PASSWORD, "peminjam nonaktif", 401);
  await call(`/api/users/${borrowerId}`, { method: "PATCH", cookie: adminCookie, headers: { "content-type": "application/json" }, body: JSON.stringify({ role: "BORROWER", status: "ACTIVE" }) });
  results.push("pengelolaan peran dan status pengguna");

  const vehicles = await db.execute('SELECT "registrationNumber", "mainPhoto" FROM "Item" ORDER BY "itemCode"');
  check(vehicles.rows.length === 6 && vehicles.rows.every((vehicle) => vehicle.registrationNumber && vehicle.mainPhoto), "Katalog enam kendaraan belum lengkap");
  results.push(`${pageChecks.length} halaman peran normal`);
  console.log(`E2E lulus: ${results.join(" → ")}`);
} finally {
  db.close();
}
