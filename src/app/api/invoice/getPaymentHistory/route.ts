import { NextResponse } from "next/server";
import { db } from "~/server/db"; // your Drizzle DB instance
import { paymentAllocations, invoices } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceid = searchParams.get("invoiceid");

    if (!invoiceid) {
      return NextResponse.json(
        { success: false, error: "Missing invoiceid param" },
        { status: 400 },
      );
    }

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.projectId, Number(invoiceid)));

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "No invoice found" },
        { status: 404 },
      );
    }

    // there can be no payments in a created invoice
    const [payments] = await db
      .select()
      .from(paymentAllocations)
      .where(eq(paymentAllocations.invoiceId, invoice.id))
      .orderBy(paymentAllocations.id);

    return NextResponse.json(
      { success: true, data: payments },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
