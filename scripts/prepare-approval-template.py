"""Turn the supplied approval letter into a data template without changing its layout."""

from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import re
from html import escape, unescape

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "Surat_Persetujuan_Peminjaman_Barang_Inventaris (1) (1).docx"
TARGET = ROOT / "src" / "assets" / "approval-letter-template.docx"

replacements = {
    "SURAT PERSETUJUAN PEMINJAMAN BARANG INVENTARIS": "{letterTitle}",
    "Nomor Berkas Aplikasi:": "Nomor Berkas Aplikasi: {registrationNumber}",
    "Dengan ini menyatakan MENYETUJUI": "{decisionIntro}",
    "Nama: [Nama Peminjam]": "Nama: {borrowerName}",
    "NIP/ID: [NIP/Nomor Identitas Peminjam]": "NIP/ID: {borrowerNip}",
    "Jabatan: [Jabatan Peminjam]": "Jabatan: {borrowerPosition}",
    "Unit Kerja: [Nama Divisi/Unit Kerja]": "Unit Kerja: {borrowerSkpd}",
    "Nama Barang: [Nama Barang": "{itemSummary}",
    "Kode Inventaris/Asset:": "",
    "Jumlah: [Jumlah Barang": "",
    "Kondisi Awal: Baik": "",
    "Jangka Waktu:": "Jangka Waktu: Mulai tanggal {borrowDate} hingga {returnDate}.",
    "Tujuan Penggunaan:": "Tujuan Penggunaan: {purpose}. Lokasi: {activityLocation}.",
    "Surat persetujuan ini diterbitkan": "{validityText}",
    "[Kota], [Tanggal Persetujuan]": "Makassar, {decisionDate}",
    "Menyetujui,": "{decisionHeading}",
    "[Jabatan Pemberi Izin]": "SEKRETARIS DAERAH KOTA MAKASSAR",
    "(Dokumen ini ditandatangani": "{signatureMarker}",
}

with ZipFile(SOURCE) as original:
    document = original.read("word/document.xml").decode("utf-8")
    text_node = re.compile(r"(<w:t(?:\s[^>]*)?>)(.*?)(</w:t>)", re.DOTALL)

    def replace_paragraph(match: re.Match[str]) -> str:
        paragraph = match.group(0)
        nodes = list(text_node.finditer(paragraph))
        text = "".join(unescape(node.group(2)) for node in nodes)
        match = next((key for key in replacements if text.startswith(key)), None)
        if match is None:
            return paragraph
        if replacements[match] == "":
            return ""
        first = True

        def replace_text(node: re.Match[str]) -> str:
            nonlocal first
            value = escape(replacements[match]) if first else ""
            first = False
            return node.group(1) + value + node.group(3)

        return text_node.sub(replace_text, paragraph)

    document = re.sub(r"<w:p(?:\s[^>]*)?>.*?</w:p>", replace_paragraph, document, flags=re.DOTALL)
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(TARGET, "w", ZIP_DEFLATED) as output:
        for item in original.infolist():
            output.writestr(item, document.encode("utf-8") if item.filename == "word/document.xml" else original.read(item.filename))

print(TARGET)
