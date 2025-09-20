import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { projects, projectMembers } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectid = Number(searchParams.get("projectid"));

    if (!projectid) {
      return NextResponse.json(
        { error: "Missing or invalid projectid param" },
        { status: 400 },
      );
    }

    const deletedMembers = await db
      .delete(projectMembers)
      .where(eq(projectMembers.projectId, projectid))
      .returning();

    const deletedProjects = await db
      .delete(projects)
      .where(eq(projects.id, projectid))
      .returning();

    if (deletedProjects.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          project: deletedProjects[0],
          members: deletedMembers,
        },
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
