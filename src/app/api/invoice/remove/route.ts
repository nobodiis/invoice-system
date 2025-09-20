import { NextResponse } from "next/server";
import { db } from "~/server/db"; // your Drizzle DB instance
import { invoiceElements, invoiceItems, invoices } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request) {
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
      .where(eq(invoices.id, Number(invoiceid)));

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "No invoice found" },
        { status: 404 },
      );
    }

    if (invoice.invoiceStatus === "paid") {
      return NextResponse.json(
        {
          success: false,
          error: "Invoice is already paid so delete is not allowed",
        },
        { status: 403 },
      );
    }

    // theres a posibility that theres no invoice items attached
    const [deletedInvoiceItems] = await db
      .delete(invoiceItems)
      .where(eq(invoiceItems.id, invoice.id))
      .returning();

    const deletedInvoice = await db
      .delete(invoices)
      .where(eq(invoices.id, Number(invoiceid)))
      .returning();

    if (!deletedInvoice) {
      return NextResponse.json(
        { success: false, error: "Error deleting invoice" },
        { status: 500 },
      );
    }

    const responseBody = {
      ...deletedInvoice,
      items: deletedInvoiceItems,
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
