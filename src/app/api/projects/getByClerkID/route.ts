import { NextResponse } from "next/server";
import { db } from "~/server/db"; // your Drizzle DB instance
import { projects } from "~/server/db/schema"; // your Drizzle schema
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkid = searchParams.get("clerkid");

    if (!clerkid) {
      return NextResponse.json(
        { success: false, error: "Missing clerkid param" },
        { status: 400 },
      );
    }

    const allProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.createdBy, clerkid))
      .orderBy(projects.id);

    if (!allProjects || allProjects.length === 0) {
      return NextResponse.json(
        { success: false, error: "No projects found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: allProjects },
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
