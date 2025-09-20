import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { projects, projectMembers } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectidParam = searchParams.get("projectid");

    if (!projectidParam || isNaN(Number(projectidParam))) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing projectid param" },
        { status: 400 },
      );
    }

    const projectid = Number(projectidParam);

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectid));

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    const members = await db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.projectId, projectid))
      .orderBy(projectMembers.id);

    return NextResponse.json(
      { success: true, data: { ...project, members } },
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
