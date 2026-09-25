import { AuditAction, ItemStatus, Role } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { itemSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const actor = await requireRole([Role.ADMIN]);
    const body = await request.json();
    const category = await db.itemCategory.findUniqueOrThrow({
      where: { code: typeof body.categoryCode === "string" ? body.categoryCode : "KENDARAAN" },
    });
    const parsed = itemSchema.safeParse({
      ...body,
      categoryId: category.id,
      skpdId: actor.skpdId,
      availableQuantity: body.totalQuantity,
      status: ItemStatus.AVAILABLE,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data barang tidak valid." },
        { status: 400 },
      );
    }
    const item = await db.$transaction(async (tx) => {
      const created = await tx.item.create({ data: parsed.data });
      await tx.auditLog.create({
        data: {
          skpdId: actor.skpdId,
          userId: actor.id,
          action: AuditAction.CREATE,
          module: "INVENTORY",
          objectType: "Item",
          objectId: created.id,
          newValue: parsed.data,
        },
      });
      return created;
    });
    return NextResponse.json({ id: item.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Kode barang atau nomor polisi sudah digunakan." },
        { status: 409 },
      );
    }
    return apiErrorResponse(error, "Barang belum dapat disimpan.");
  }
}
