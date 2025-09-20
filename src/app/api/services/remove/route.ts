import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { invoiceElements } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("serviceid");
    const id = idParam ? Number(idParam) : NaN;

    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid or missing serviceid param" },
        { status: 400 },
      );
    }

    const [deleted] = await db
      .delete(invoiceElements)
      .where(eq(invoiceElements.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Service deleted", data: deleted },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("Error removing service:", err);

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
