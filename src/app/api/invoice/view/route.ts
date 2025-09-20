import { NextResponse } from "next/server";
import { db } from "~/server/db"; // your Drizzle DB instance
import { invoiceElements, invoiceItems, invoices } from "~/server/db/schema";
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

    // there can be no items in a created invoice
    const [items] = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoice.id))
      .orderBy(invoiceItems.id);

    const responseBody = {
      ...invoice,
      items: [items],
    };

    return NextResponse.json(
      { success: true, data: responseBody },
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
