import { Download, FileText } from "lucide-react";

export function ApprovalLetter({ requestId, signed = false }: { requestId: string; signed?: boolean }) {
  return <a className="approval-letter" href={`/api/borrowing-requests/${encodeURIComponent(requestId)}/approval-letter`}>
    <FileText size={20} aria-hidden="true" />
    <span><strong>{signed ? "Surat persetujuan dengan TTD Sekda" : "Draf surat persetujuan"}</strong><small>{signed ? "Unduh surat Word yang telah disetujui Sekda." : "Unduh surat Word yang terisi dari data pengajuan untuk diperiksa."}</small></span>
    <Download size={18} aria-hidden="true" />
  </a>;
}
