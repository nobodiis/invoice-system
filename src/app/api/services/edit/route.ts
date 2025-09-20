import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { invoiceElements, clientInformation } from "~/server/db/schema";
import { eq } from "drizzle-orm";

interface UpdateInvoiceElementRequest {
  name?: string;
  clientId?: string;
  isHourly?: boolean;
  price?: number;
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as UpdateInvoiceElementRequest;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("serviceid");

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 },
      );
    }

    if (body.clientId) {
      const [client] = await db
        .select()
        .from(clientInformation)
        .where(eq(clientInformation.clientId, Number(body.clientId)));

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 },
        );
      }
    }

    const updateData: Partial<{
      name: string;
      clientId: string;
      isHourly: boolean;
      price: string;
    }> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.clientId !== undefined) updateData.clientId = body.clientId;
    if (body.isHourly !== undefined) updateData.isHourly = body.isHourly;
    if (body.price !== undefined) updateData.price = body.price.toString();

    const [updated] = await db
      .update(invoiceElements)
      .set(updateData)
      .where(eq(invoiceElements.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Invoice element not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err: unknown) {
    console.error("Error updating invoice element:", err);

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 400 },
    );
  }
}
