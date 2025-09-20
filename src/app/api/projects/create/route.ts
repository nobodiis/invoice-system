import { NextResponse } from "next/server";
import { db } from "~/server/db"; // your Drizzle instance
import { projects, projectMembers } from "~/server/db/schema";
import { z } from "zod";

interface ProjectRequest {
  name: string;
  createdBy: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ProjectRequest;

    if (!body.name || !body.createdBy) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const [newProject] = await db
      .insert(projects)
      .values({
        name: body.name,
        createdBy: body.createdBy,
      })
      .returning();

    if (!newProject) {
      return NextResponse.json(
        { success: false, error: "Error creating project" },
        { status: 500 },
      );
    }

    const [newMember] = await db
      .insert(projectMembers)
      .values({
        projectId: newProject.id,
        userId: body.createdBy,
        hasJoined: true,
        projectRole: "owner",
      })
      .returning();

    const responseBody = {
      ...newProject,
      members: [newMember],
    };

    return NextResponse.json(
      { success: true, data: responseBody },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error("Error creating project:", err);

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
