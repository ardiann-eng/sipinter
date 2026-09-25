import { BorrowingStatus, NotificationType, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";
import { transitionBorrowingRequest } from "@/lib/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let proofKey: string | undefined;
  try {
    const actor = await requireRole([Role.ADMIN]);
    const { id } = await params;
    const form = await request.formData();
    const stage = String(form.get("stage") ?? "");
    const note = String(form.get("note") ?? "").trim() || undefined;
    const borrowing = await db.borrowingRequest.findUniqueOrThrow({
      where: { id },
      select: { borrowerId: true, registrationNumber: true, status: true },
    });

    if (stage === "PREPARE") {
      const updated = await transitionBorrowingRequest(
        id,
        BorrowingStatus.READY_FOR_HANDOVER,
        actor,
        {
          note,
          context: {
            ipAddress: request.headers.get("x-forwarded-for"),
            userAgent: request.headers.get("user-agent"),
          },
        },
      );
      try {
        await db.notification.create({
          data: {
            userId: borrowing.borrowerId,
            type: NotificationType.INFO,
            title: "Kendaraan siap diserahkan",
            message: `${borrowing.registrationNumber} siap memasuki proses serah terima.`,
            link: `/peminjam/peminjaman/${id}`,
          },
        });
      } catch (notificationError) {
        console.error("Notifikasi kesiapan penyerahan gagal dibuat", notificationError);
      }
      return NextResponse.json({ id: updated.id, status: updated.status });
    }

    if (stage !== "HANDOVER") {
      return NextResponse.json({ error: "Tahap penyerahan tidak valid." }, { status: 400 });
    }
    if (form.get("confirmed") !== "on") {
      return NextResponse.json(
        { error: "Konfirmasi pemeriksaan kendaraan, kunci, dan dokumen wajib dicentang." },
        { status: 400 },
      );
    }

    const proof = form.get("proof");
    if (!(proof instanceof File)) {
      return NextResponse.json(
        { error: "Foto atau dokumen bukti serah terima wajib diunggah." },
        { status: 400 },
      );
    }
    const stored = await storage.put(proof);
    proofKey = stored.key;
    const updated = await transitionBorrowingRequest(
      id,
      BorrowingStatus.BORROWED,
      actor,
      {
        note,
        proofFile: stored.key,
        context: {
          ipAddress: request.headers.get("x-forwarded-for"),
          userAgent: request.headers.get("user-agent"),
        },
      },
    );
    try {
      await db.notification.create({
        data: {
          userId: borrowing.borrowerId,
          type: NotificationType.INFO,
          title: "Kendaraan telah diserahkan",
          message: `${borrowing.registrationNumber} telah tercatat sebagai sedang dipinjam.`,
          link: `/peminjam/peminjaman/${id}`,
        },
      });
    } catch (notificationError) {
      console.error("Notifikasi penyerahan gagal dibuat", notificationError);
    }
    proofKey = undefined;
    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch (error) {
    if (proofKey) await storage.delete(proofKey).catch(() => undefined);
    return apiErrorResponse(error, "Penyerahan kendaraan belum dapat diproses.");
  }
}
