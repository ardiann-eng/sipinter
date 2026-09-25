import { AuditAction, Role } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { itemSchema } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireRole([Role.ADMIN]);
    const { id } = await params;
    const body = await request.json();
    const [current, category] = await Promise.all([
      db.item.findUniqueOrThrow({ where: { id } }),
      db.itemCategory.findUniqueOrThrow({
        where: { code: typeof body.categoryCode === "string" ? body.categoryCode : "KENDARAAN" },
      }),
    ]);
    const borrowedQuantity = current.totalQuantity - current.availableQuantity;
    const totalQuantity = Number(body.totalQuantity);
    if (!Number.isInteger(totalQuantity) || totalQuantity < borrowedQuantity) {
      return NextResponse.json(
        { error: `Jumlah total tidak boleh kurang dari ${borrowedQuantity} barang yang sedang dipinjam.` },
        { status: 400 },
      );
    }
    const availableQuantity = Math.max(0, totalQuantity - borrowedQuantity);
    const parsed = itemSchema.safeParse({
      ...body,
      categoryId: category.id,
      skpdId: current.skpdId,
      availableQuantity,
      status:
        body.status === "INACTIVE"
          ? "INACTIVE"
          : availableQuantity > 0
            ? "AVAILABLE"
            : "OUT_OF_STOCK",
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data barang tidak valid." },
        { status: 400 },
      );
    }
    const item = await db.$transaction(async (tx) => {
      const updated = await tx.item.update({ where: { id }, data: parsed.data });
      await tx.auditLog.create({
        data: {
          skpdId: actor.skpdId,
          userId: actor.id,
          action: AuditAction.UPDATE,
          module: "INVENTORY",
          objectType: "Item",
          objectId: id,
          previousValue: current,
          newValue: parsed.data,
        },
      });
      return updated;
    });
    return NextResponse.json({ id: item.id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Kode barang atau nomor polisi sudah digunakan." },
        { status: 409 },
      );
    }
    return apiErrorResponse(error, "Barang belum dapat diperbarui.");
  }
}
