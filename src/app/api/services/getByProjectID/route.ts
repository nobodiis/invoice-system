import { NextResponse } from "next/server";
import { db } from "~/server/db"; // your Drizzle DB instance
import { invoiceElements } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectid = searchParams.get("projectid");

    if (!projectid) {
      return NextResponse.json(
        { success: false, error: "Missing projectid param" },
        { status: 400 },
      );
    }

    const allServices = await db
      .select()
      .from(invoiceElements)
      .where(eq(invoiceElements.projectId, Number(projectid)))
      .orderBy(invoiceElements.id);

    if (!allServices || allServices.length === 0) {
      return NextResponse.json(
        { success: false, error: "No services found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: allServices },
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
