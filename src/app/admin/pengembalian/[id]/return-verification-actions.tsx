"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Select, Textarea } from "@/components";

export function ReturnVerificationActions({ requestId, resolutionMode = false }: { requestId: string; resolutionMode?: boolean }) {
  const router = useRouter();
  const [result, setResult] = useState<"ACCEPTED" | "PROBLEM">("ACCEPTED");
  const [checks, setChecks] = useState({ itemComplete: false, accessoriesComplete: false, physicallyIntact: false, functioningProperly: false });
  const [issueType, setIssueType] = useState("DAMAGED");
  const [issueDescription, setIssueDescription] = useState("");
  const [followUpRecommendation, setFollowUpRecommendation] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [serviceableConfirmed, setServiceableConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const acceptedReady = Object.values(checks).every(Boolean);

  async function submit() {
    if ((resolutionMode || result === "ACCEPTED") && !acceptedReady) { setError("Centang seluruh checklist sebelum menyelesaikan pemeriksaan."); return; }
    if (!resolutionMode && result === "PROBLEM" && issueDescription.trim().length < 10) { setError("Jelaskan masalah minimal 10 karakter."); return; }
    if (resolutionMode && (!serviceableConfirmed || resolutionNote.trim().length < 10)) { setError("Konfirmasi kelayakan dan catatan penyelesaian minimal 10 karakter wajib diisi."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/borrowing-requests/${requestId}/return-verification`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...checks,
          result: resolutionMode ? "ACCEPTED" : result,
          issueType: !resolutionMode && result === "PROBLEM" ? issueType : undefined,
          issueDescription: !resolutionMode && result === "PROBLEM" ? issueDescription : undefined,
          followUpRecommendation: !resolutionMode && result === "PROBLEM" ? followUpRecommendation : undefined,
          resolutionNote: resolutionMode ? resolutionNote : undefined,
          serviceableReturnConfirmed: resolutionMode ? serviceableConfirmed : undefined,
        }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Pemeriksaan belum dapat diproses.");
      router.push("/admin/pengembalian"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pemeriksaan belum dapat diproses."); }
    finally { setBusy(false); }
  }

  return <div className="stack" aria-busy={busy}>
    <div className="checklist">
      {([
        ["itemComplete", "Unit sesuai data peminjaman"],
        ["accessoriesComplete", "Kunci dan dokumen kendaraan lengkap"],
        ["physicallyIntact", "Kondisi fisik utuh"],
        ["functioningProperly", "Kendaraan berfungsi dengan baik"],
      ] as const).map(([key, label]) => <label key={key} className="check-item"><input type="checkbox" checked={checks[key]} onChange={(event) => setChecks((current) => ({ ...current, [key]: event.target.checked }))} />{label}</label>)}
    </div>
    {!resolutionMode && <Select label="Hasil pemeriksaan" value={result} onChange={(event) => setResult(event.target.value as typeof result)}><option value="ACCEPTED">Diterima dan selesai</option><option value="PROBLEM">Ada masalah</option></Select>}
    {!resolutionMode && result === "PROBLEM" && <><Select label="Jenis masalah" value={issueType} onChange={(event) => setIssueType(event.target.value)}><option value="INCOMPLETE">Tidak lengkap</option><option value="DAMAGED">Rusak</option><option value="NOT_FUNCTIONING">Tidak berfungsi</option><option value="LOST">Hilang</option><option value="OTHER">Lainnya</option></Select><Textarea label="Deskripsi masalah" value={issueDescription} onChange={(event) => setIssueDescription(event.target.value)} required /><Textarea label="Rekomendasi tindak lanjut" value={followUpRecommendation} onChange={(event) => setFollowUpRecommendation(event.target.value)} /></>}
    {resolutionMode && <><Textarea label="Catatan penyelesaian" value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} required /><label className="check-item"><input type="checkbox" checked={serviceableConfirmed} onChange={(event) => setServiceableConfirmed(event.target.checked)} /><span>Saya memastikan tindak lanjut telah selesai dan kendaraan layak digunakan kembali.</span></label></>}
    {error && <p role="alert">{error}</p>}
    <Button type="button" loading={busy} onClick={submit}>{resolutionMode ? "Selesaikan tindak lanjut" : result === "ACCEPTED" ? "Terima pengembalian" : "Catat masalah pengembalian"}</Button>
  </div>;
}
