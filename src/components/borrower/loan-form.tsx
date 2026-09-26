"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileUp,
  Minus,
  Plus,
  Save,
} from "lucide-react";
import { Button, Input, Panel, cx } from "@/components";
import styles from "./borrower.module.css";
import { DatePicker } from "@/components/ui/date-picker";

type Draft = {
  purpose: string;
  location: string;
  startDate: string;
  endDate: string;
  items: Record<string, number>;
  note: string;
  formalReview: boolean;
};
type Errors = Record<string, string>;
const initialDraft: Draft = {
  purpose: "",
  location: "",
  startDate: "",
  endDate: "",
  items: {},
  note: "",
  formalReview: false,
};
const steps = [
  "Data peminjam",
  "Kegiatan",
  "Pilih barang",
  "Dokumen",
  "Tinjau",
];
const allowedDocumentTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxFileSize = 5 * 1024 * 1024;

function localDateValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

type BorrowerProfile = { name: string; nip: string; email: string; phone: string; unit: string; skpd: string; employeeId: string };
type CatalogItem = { id: string; name: string; code: string; registrationNumber: string; category: string; location: string; unit: string; availableStock: number; totalStock: number; condition: "GOOD" | "LIGHTLY_DAMAGED" | "HEAVILY_DAMAGED" | "LOST"; status: "AVAILABLE"; imageUrl?: string; description?: string };
type RevisionDraft = { id: string; purpose: string; location: string; startDate: string; endDate: string; items: Record<string, number>; hasKtp: boolean; hasSupporting: boolean; adminNote?: string };

export function LoanForm({
  borrower: profile,
  items: catalog,
  revision,
  policy,
}: {
  borrower: BorrowerProfile;
  items: CatalogItem[];
  revision?: RevisionDraft;
  policy: { standardDurationDays: number; minimumLeadDays: number };
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => revision ? { purpose: revision.purpose, location: revision.location, startDate: revision.startDate, endDate: revision.endDate, items: revision.items, note: "", formalReview: false } : initialDraft);
  const [ktp, setKtp] = useState<File | null>(null);
  const [supporting, setSupporting] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const minBorrowDate = localDateValue(new Date(Date.now() + policy.minimumLeadDays * 86_400_000));
  const maxReturnDate = draft.startDate ? addDays(draft.startDate, policy.standardDurationDays - 1) : undefined;

  useEffect(() => {
    if (revision) return;
    const saved = window.localStorage.getItem("sipinter-borrower-draft");
    if (saved)
      try {
        setDraft({
          ...initialDraft,
          ...(JSON.parse(saved) as Draft),
          formalReview: false,
        });
      } catch {
        window.localStorage.removeItem("sipinter-borrower-draft");
      }
  }, [revision]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setMessage("");
    setSubmitError("");
  }

  function validateFile(file: File | null, label: string, existing = false) {
    if (!file && existing) return "";
    if (!file) return `${label} wajib diunggah.`;
    if (!allowedDocumentTypes.includes(file.type))
      return "Format harus PDF, JPG, atau PNG.";
    if (file.size > maxFileSize) return "Ukuran berkas maksimal 5 MB.";
    return "";
  }

  function validate(currentStep = step) {
    const next: Errors = {};
    if (currentStep === 1) {
      if (draft.purpose.trim().length < 10)
        next.purpose = "Keperluan minimal 10 karakter.";
      if (draft.location.trim().length < 5)
        next.location = "Lokasi kegiatan wajib diisi.";
      if (!draft.startDate) next.startDate = "Tanggal mulai wajib diisi.";
      if (!draft.endDate) next.endDate = "Tanggal selesai wajib diisi.";
      if (draft.startDate && draft.startDate < minBorrowDate)
        next.startDate = "Tanggal mulai tidak boleh berada di masa lalu.";
      if (draft.startDate && draft.endDate && draft.endDate < draft.startDate)
        next.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
      if (draft.startDate && draft.endDate) {
        const duration = Math.round((new Date(draft.endDate).getTime() - new Date(draft.startDate).getTime()) / 86_400_000) + 1;
        if (duration > policy.standardDurationDays) next.endDate = `Durasi maksimal ${policy.standardDurationDays} hari kalender.`;
      }
    }
    if (
      currentStep === 2 &&
      !Object.values(draft.items).some((quantity) => quantity > 0)
    )
      next.items = "Pilih sedikitnya satu barang atau fasilitas.";
    if (currentStep === 3) {
      next.ktp = validateFile(ktp, "KTP", revision?.hasKtp);
      next.supporting = validateFile(supporting, "Dokumen pendukung", revision?.hasSupporting);
      if (!next.ktp) delete next.ktp;
      if (!next.supporting) delete next.supporting;
    }
    if (currentStep === 4 && !draft.formalReview)
      next.formalReview =
        "Pernyataan wajib disetujui sebelum pengajuan dikirim.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function next() {
    if (validate()) setStep((current) => Math.min(current + 1, 4));
  }
  function saveDraft() {
    window.localStorage.setItem(
      "sipinter-borrower-draft",
      JSON.stringify(draft),
    );
    setMessage(
      "Draf tersimpan di perangkat ini. Dokumen perlu dipilih kembali saat melanjutkan.",
    );
  }
  async function submit() {
    if (!validate(4)) return;
    if ((!ktp && !revision?.hasKtp) || (!supporting && !revision?.hasSupporting)) return;

    setSubmitting(true);
    setMessage("");
    setSubmitError("");
    try {
      const data = new FormData();
      data.set("purpose", draft.purpose);
      data.set("location", draft.location);
      data.set("startDate", draft.startDate);
      data.set("endDate", draft.endDate);
      if (ktp) data.set("ktp", ktp);
      if (supporting) data.set("supporting", supporting);
      data.set(
        "items",
        JSON.stringify(
          selected.map((item) => ({
            itemId: item.id,
            quantity: draft.items[item.id],
            initialCondition: item.condition,
          })),
        ),
      );

      const response = await fetch(revision ? `/api/borrowing-requests/${revision.id}/resubmit` : "/api/borrowing-requests", {
        method: "POST",
        body: data,
      });
      const result = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !result.id) {
        throw new Error(result.error ?? "Pengajuan belum dapat dikirim.");
      }

      window.localStorage.removeItem("sipinter-borrower-draft");
      router.push(revision ? `/peminjam/peminjaman/${revision.id}` : "/peminjam/peminjaman");
      router.refresh();
    } catch (cause) {
      setSubmitError(
        cause instanceof Error
          ? cause.message
          : "Pengajuan belum dapat dikirim. Silakan coba kembali.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  const selected = catalog.filter(
    (item) => (draft.items[item.id] ?? 0) > 0,
  );
  const selectedQuantity = selected.reduce(
    (total, item) => total + (draft.items[item.id] ?? 0),
    0,
  );
  const draftDuration = draft.startDate && draft.endDate
    ? Math.round((new Date(`${draft.endDate}T00:00:00Z`).getTime() - new Date(`${draft.startDate}T00:00:00Z`).getTime()) / 86_400_000) + 1
    : null;

  function setItemQuantity(
    id: string,
    availableStock: number,
    quantity: number,
  ) {
    update("items", {
      ...draft.items,
      [id]: Math.max(0, Math.min(availableStock, quantity)),
    });
  }

  return (
    <div className={styles.formShell}>
      <div className={styles.progressMobile}>
        <span>
          Langkah {step + 1} dari {steps.length}
        </span>
        <strong>{steps[step]}</strong>
        <i style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
      <ol className={styles.steps} aria-label="Langkah pengajuan">
        {steps.map((label, index) => (
          <li
            key={label}
            aria-current={index === step ? "step" : undefined}
            className={cx(
              styles.step,
              index === step && styles.stepActive,
              index < step && styles.stepDone,
            )}
          >
            <span className={styles.stepNumber} aria-hidden="true">
              {index < step ? <Check size={14} /> : index + 1}
            </span>
            <span>{label}</span>
          </li>
        ))}
      </ol>
      <div
        className={cx(
          styles.formLayout,
          step > 1 && styles.formLayoutWithSummary,
        )}
      >
        <Panel
          title={`Langkah ${step + 1}: ${steps[step]}`}
          description={revision ? "Perbaiki data sesuai catatan administrator, lalu kirim ulang pengajuan yang sama." : "Isian tersimpan saat Anda berpindah langkah."}
        >
          {message && (
            <div className={styles.success} role="status" aria-live="polite">
              {message}
            </div>
          )}
          {submitError && (
            <div className={styles.submitError} role="alert">
              {submitError}
            </div>
          )}
          {revision?.adminNote && step === 0 && <div className={styles.notice} role="status"><div><strong>Catatan revisi administrator</strong><p>{revision.adminNote}</p></div></div>}
          {step === 0 && (
            <div className={styles.formGrid}>
              <Input label="Nama lengkap" value={profile.name} disabled />
              <Input label="NIP" value={profile.nip} disabled />
              <Input label="Perangkat daerah" value={profile.skpd} disabled />
              <Input label="Unit kerja" value={profile.unit} disabled />
              <Input label="Email kedinasan" value={profile.email} disabled />
              <Input label="Nomor telepon" value={profile.phone} disabled />
            </div>
          )}
          {step === 1 && (
            <div className={styles.formGrid}>
              <div className={`${styles.field} ${styles.wide}`}>
                <label htmlFor="purpose">Keperluan peminjaman *</label>
                <textarea
                  id="purpose"
                  aria-describedby={
                    errors.purpose ? "purpose-error" : undefined
                  }
                  aria-invalid={Boolean(errors.purpose)}
                  value={draft.purpose}
                  onChange={(event) => update("purpose", event.target.value)}
                  placeholder="Contoh: Sosialisasi layanan digital bagi perangkat daerah"
                />
                {errors.purpose && (
                  <span
                    id="purpose-error"
                    className={styles.error}
                    role="alert"
                  >
                    {errors.purpose}
                  </span>
                )}
              </div>
              <Input
                label="Lokasi kegiatan"
                required
                value={draft.location}
                onChange={(event) => update("location", event.target.value)}
                error={errors.location}
              />
              <DateField
                label="Tanggal mulai"
                min={minBorrowDate}
                value={draft.startDate}
                error={errors.startDate}
                onChange={(value) => update("startDate", value)}
              />
              <DateField
                label="Tanggal selesai"
                min={draft.startDate || minBorrowDate}
                max={maxReturnDate}
                value={draft.endDate}
                error={errors.endDate}
                onChange={(value) => update("endDate", value)}
              />
              <p className={`${styles.muted} ${styles.wide}`}>Pengajuan minimal {policy.minimumLeadDays} hari sebelum penggunaan dan maksimal {policy.standardDurationDays} hari kalender.</p>
              <div className={`${styles.field} ${styles.wide}`}>
                <label htmlFor="note">Catatan kebutuhan</label>
                <textarea
                  id="note"
                  value={draft.note}
                  onChange={(event) => update("note", event.target.value)}
                  placeholder="Jumlah peserta, kebutuhan perlengkapan, atau catatan penggunaan (opsional)"
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className={styles.catalog}>
              <div className={styles.catalogIntro}>
                <strong>Pilih barang atau fasilitas</strong>
                <span>Sesuaikan pilihan dan jumlah dengan kebutuhan kegiatan. Ketersediaan ditampilkan pada setiap kartu.</span>
              </div>
              {catalog.map((item) => {
                const quantity = draft.items[item.id] ?? 0;
                return (
                  <div
                    className={cx(
                      styles.catalogItem,
                      quantity > 0 && styles.catalogItemSelected,
                    )}
                    key={item.id}
                  >
                    {item.imageUrl ? (
                      <div className={styles.catalogImage}>
                        <Image src={item.imageUrl} alt={item.name} fill sizes="(max-width: 640px) 100vw, 176px" />
                      </div>
                    ) : (
                      <div className={styles.catalogImageFallback} aria-hidden="true">Barang</div>
                    )}
                    <div className={styles.catalogCopy}>
                      <strong>{item.name}</strong>
                      <small>{item.category} · {item.code}</small>
                      {item.description && <p>{item.description}</p>}
                      <span>{item.availableStock > 0 ? "Tersedia" : "Tidak tersedia"} · {item.location}</span>
                    </div>
                    <div className={styles.quantityControl}>
                      <button
                        type="button"
                        aria-label={`Kurangi jumlah ${item.name}`}
                        disabled={quantity === 0}
                        onClick={() =>
                          setItemQuantity(
                            item.id,
                            item.availableStock,
                            quantity - 1,
                          )
                        }
                      >
                        <Minus size={15} />
                      </button>
                      <output aria-label={`Jumlah ${item.name}`}>
                        {quantity}
                      </output>
                      <button
                        type="button"
                        aria-label={`Tambah jumlah ${item.name}`}
                        disabled={quantity === item.availableStock}
                        onClick={() =>
                          setItemQuantity(
                            item.id,
                            item.availableStock,
                            quantity + 1,
                          )
                        }
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {errors.items && (
                <span className={styles.error} role="alert">
                  {errors.items}
                </span>
              )}
            </div>
          )}
          {step === 3 && (
            <div className={styles.formGrid}>
              <FileField
                id="ktp"
                label="KTP peminjam"
                hint="Wajib · PDF/JPG/PNG · maksimal 5 MB"
                file={ktp}
                existing={revision?.hasKtp}
                error={errors.ktp}
                onChange={setKtp}
              />
              <FileField
                id="supporting"
                label="Dokumen pendukung / surat tugas"
                hint="Wajib · PDF/JPG/PNG · maksimal 5 MB"
                file={supporting}
                existing={revision?.hasSupporting}
                error={errors.supporting}
                onChange={setSupporting}
              />
            </div>
          )}
          {step === 4 && (
            <div className={styles.review}>
              <h3>Ringkasan pengajuan</h3>
              <div className={styles.profileFacts}>
                <div>
                  <span>Peminjam</span>
                  <strong>
                    {profile.name} · {profile.nip}
                  </strong>
                </div>
                <div>
                  <span>Periode</span>
                  <strong>
                    {draft.startDate || "Belum diisi"} s.d.{" "}
                    {draft.endDate || "Belum diisi"}
                  </strong>
                </div>
                <div>
                  <span>Keperluan</span>
                  <strong>{draft.purpose || "Belum diisi"}</strong>
                </div>
                <div>
                  <span>Lokasi</span>
                  <strong>{draft.location || "Belum diisi"}</strong>
                </div>
                <div>
                  <span>Barang / fasilitas</span>
                  <strong>
                    {selected
                      .map((item) => `${item.name} (${draft.items[item.id]})`)
                      .join(", ") || "Belum dipilih"}
                  </strong>
                </div>
                <div>
                  <span>Dokumen</span>
                  <strong>
                    {ktp?.name ?? (revision?.hasKtp ? "KTP tersimpan" : "KTP belum dipilih")};{" "}
                    {supporting?.name ?? (revision?.hasSupporting ? "dokumen pendukung tersimpan" : "dokumen pendukung belum dipilih")}
                  </strong>
                </div>
              </div>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={draft.formalReview}
                  onChange={(event) =>
                    update("formalReview", event.target.checked)
                  }
                />
                <span>
                  Saya menyatakan data dan dokumen yang disampaikan benar,
                  barang atau fasilitas digunakan hanya untuk kepentingan kedinasan, serta
                  bersedia bertanggung jawab atas penggunaan dan
                  pengembaliannya.
                </span>
              </label>
              {errors.formalReview && (
                <span className={styles.error} role="alert">
                  {errors.formalReview}
                </span>
              )}
            </div>
          )}
          <div className={styles.formFooter}>
            {revision ? <span /> : <Button type="button" variant="ghost" onClick={saveDraft}><Save size={16} /> Simpan draf</Button>}
            <div className={styles.formFooterRight}>
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((current) => current - 1)}
                >
                  <ChevronLeft size={16} /> Sebelumnya
                </Button>
              )}
              {step < 4 ? (
                <Button type="button" onClick={next}>
                  Selanjutnya <ChevronRight size={16} />
                </Button>
              ) : (
                <Button type="button" loading={submitting} onClick={submit}>
                  {submitting ? "Mengirim pengajuan..." : revision ? "Kirim ulang pengajuan" : "Kirim pengajuan"}
                </Button>
              )}
            </div>
          </div>
        </Panel>
        {step > 1 && (
          <aside className={styles.draftSummary} aria-label="Ringkasan draf peminjaman">
            <div className={styles.draftSummaryHeader}>
              <span>RINGKASAN DRAF</span>
              <strong>{selectedQuantity} barang <small>· {selected.length} jenis</small></strong>
            </div>
            <div className={styles.draftSummarySection}>
              <h3>Barang dipilih</h3>
              {selected.length ? (
                <ul className={styles.draftSummaryItems}>
                  {selected.map((item) => (
                    <li key={item.id}>
                      <span><strong>{item.name}</strong><small>{item.code}</small></span>
                      <b>{draft.items[item.id]} {item.unit}</b>
                    </li>
                  ))}
                </ul>
              ) : <p>Belum ada barang atau fasilitas dipilih.</p>}
            </div>
            <div className={styles.draftSummarySection}>
              <h3>Jadwal penggunaan</h3>
              <dl className={styles.draftSummaryFacts}>
                <div><dt>Mulai</dt><dd>{draft.startDate ? formatDraftDate(draft.startDate) : "Belum diisi"}</dd></div>
                <div><dt>Selesai</dt><dd>{draft.endDate ? formatDraftDate(draft.endDate) : "Belum diisi"}</dd></div>
              </dl>
              {draftDuration && draftDuration > 0 && <p className={styles.draftSummaryDuration}>{draftDuration} hari kalender</p>}
            </div>
            <div className={styles.draftSummarySection}>
              <h3>Keperluan</h3>
              <p>{draft.purpose || "Belum diisi"}</p>
              <small>Lokasi: {draft.location || "Belum diisi"}</small>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function formatDraftDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function DateField({
  label,
  min,
  max,
  value,
  error,
  onChange,
}: {
  label: string;
  min: string;
  max?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return <DatePicker label={label} min={min} max={max} required value={value} error={error} onChange={onChange} />;
}

function FileField({
  id,
  label,
  hint,
  file,
  existing = false,
  error,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  file: File | null;
  existing?: boolean;
  error?: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <label
      className={cx(styles.upload, (file || existing) && styles.uploadComplete)}
      htmlFor={id}
    >
      <span className={styles.fieldLabel}>
        <FileUp size={16} /> {label} *
      </span>
      <small className={styles.block}>{hint}</small>
      <input
        id={id}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        aria-describedby={`${id}-feedback`}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <span id={`${id}-feedback`} aria-live="polite">
        {file ? <span className={styles.fileName}>{file.name}</span> : existing && <span className={styles.fileName}>Dokumen tersimpan · pilih berkas hanya jika ingin mengganti</span>}
        {error && (
          <span className={styles.error} role="alert">
            {error}
          </span>
        )}
      </span>
    </label>
  );
}
