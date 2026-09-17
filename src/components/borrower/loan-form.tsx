"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FileUp,
  Minus,
  Plus,
  Save,
} from "lucide-react";
import { Button, Input, Panel, cx } from "@/components";
import { availableItems, borrower } from "./borrower-data";
import styles from "./borrower.module.css";

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

type BorrowerProfile = typeof borrower;
type CatalogItem = (typeof availableItems)[number];

export function LoanForm({
  borrower: profile,
  items: catalog,
}: {
  borrower: BorrowerProfile;
  items: CatalogItem[];
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [ktp, setKtp] = useState<File | null>(null);
  const [supporting, setSupporting] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
  }, []);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setMessage("");
    setSubmitError("");
  }

  function validateFile(file: File | null, label: string) {
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
      if (draft.startDate && draft.startDate < "2026-07-19")
        next.startDate = "Tanggal mulai paling cepat 19 Juli 2026.";
      if (draft.startDate && draft.endDate && draft.endDate < draft.startDate)
        next.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
    }
    if (
      currentStep === 2 &&
      !Object.values(draft.items).some((quantity) => quantity > 0)
    )
      next.items = "Pilih sedikitnya satu barang.";
    if (currentStep === 3) {
      next.ktp = validateFile(ktp, "KTP");
      next.supporting = validateFile(supporting, "Dokumen pendukung");
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
    if (!ktp || !supporting) return;

    setSubmitting(true);
    setMessage("");
    setSubmitError("");
    try {
      const data = new FormData();
      data.set("purpose", draft.purpose);
      data.set("location", draft.location);
      data.set("startDate", draft.startDate);
      data.set("endDate", draft.endDate);
      data.set("ktp", ktp);
      data.set("supporting", supporting);
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

      const response = await fetch("/api/borrowing-requests", {
        method: "POST",
        body: data,
      });
      const result = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !result.id) {
        throw new Error(result.error ?? "Pengajuan belum dapat dikirim.");
      }

      window.localStorage.removeItem("sipinter-borrower-draft");
      router.push("/peminjam/peminjaman");
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
          description="Isian tersimpan saat Anda berpindah langkah."
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
                min="2026-07-19"
                value={draft.startDate}
                error={errors.startDate}
                onChange={(value) => update("startDate", value)}
              />
              <DateField
                label="Tanggal selesai"
                min={draft.startDate || "2026-07-19"}
                value={draft.endDate}
                error={errors.endDate}
                onChange={(value) => update("endDate", value)}
              />
              <div className={`${styles.field} ${styles.wide}`}>
                <label htmlFor="note">Catatan kebutuhan</label>
                <textarea
                  id="note"
                  value={draft.note}
                  onChange={(event) => update("note", event.target.value)}
                  placeholder="Informasi teknis atau waktu pengambilan barang (opsional)"
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className={styles.catalog}>
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
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {item.code} · tersedia {item.availableStock} {item.unit}{" "}
                        · {item.location}
                      </small>
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
                error={errors.ktp}
                onChange={setKtp}
              />
              <FileField
                id="supporting"
                label="Dokumen pendukung / surat tugas"
                hint="Wajib · PDF/JPG/PNG · maksimal 5 MB"
                file={supporting}
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
                  <span>Barang</span>
                  <strong>
                    {selected
                      .map((item) => `${item.name} (${draft.items[item.id]})`)
                      .join(", ") || "Belum dipilih"}
                  </strong>
                </div>
                <div>
                  <span>Dokumen</span>
                  <strong>
                    {ktp?.name ?? "KTP belum dipilih"};{" "}
                    {supporting?.name ?? "dokumen pendukung belum dipilih"}
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
                  fasilitas digunakan hanya untuk kepentingan kedinasan, serta
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
            <Button type="button" variant="ghost" onClick={saveDraft}>
              <Save size={16} /> Simpan draf
            </Button>
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
                  {submitting ? "Mengirim pengajuan..." : "Kirim pengajuan"}
                </Button>
              )}
            </div>
          </div>
        </Panel>
        {step > 1 && (
          <aside className={styles.draftSummary}>
            <span>RINGKASAN DRAF</span>
            <strong>{selectedQuantity} unit fasilitas</strong>
            <p>
              {selected.length
                ? selected
                    .map((item) => `${item.name} (${draft.items[item.id]})`)
                    .join(", ")
                : "Belum ada fasilitas dipilih."}
            </p>
            {draft.startDate && (
              <small>
                {draft.startDate} s.d.{" "}
                {draft.endDate || "tanggal selesai belum diisi"}
              </small>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

function DateField({
  label,
  min,
  value,
  error,
  onChange,
}: {
  label: string;
  min: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.dateField}>
      <span>
        {label} <b>*</b>
      </span>
      <span
        className={cx(styles.dateControl, error && styles.dateControlError)}
      >
        <CalendarDays size={17} aria-hidden="true" />
        <input
          type="date"
          min={min}
          required
          value={value}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
      {error && <small role="alert">{error}</small>}
    </label>
  );
}

function FileField({
  id,
  label,
  hint,
  file,
  error,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <label
      className={cx(styles.upload, file && styles.uploadComplete)}
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
        {file && <span className={styles.fileName}>{file.name}</span>}
        {error && (
          <span className={styles.error} role="alert">
            {error}
          </span>
        )}
      </span>
    </label>
  );
}
