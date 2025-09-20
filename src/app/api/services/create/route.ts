import { NextResponse } from "next/server";
import { db } from "~/server/db"; // your Drizzle instance
import { invoiceElements, clientInformation } from "~/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

interface ServicesRequest {
  projectId: number;
  name: string;
  clientid: string;
  isHourly: boolean;
  price: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ServicesRequest;

    if (
      !body.projectId ||
      !body.name ||
      !body.clientid ||
      !body.isHourly ||
      !body.price
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const [client] = await db
      .select()
      .from(clientInformation)
      .where(eq(clientInformation.clientId, Number(body.clientid)));

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 },
      );
    }

    const [newServices] = await db
      .insert(invoiceElements)
      .values({
        projectId: Number(body.projectId),
        name: body.name,
        clientId: body.clientid,
        isHourly: body.isHourly,
        price: body.price.toString(),
      })
      .returning();

    if (!newServices) {
      return NextResponse.json(
        { success: false, error: "Error creating services" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data: newServices },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error("Error creating service:", err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
