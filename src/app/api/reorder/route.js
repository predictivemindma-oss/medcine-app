import { NextResponse } from "next/server";
import connectionToDatabase from "@/lib/mongoose";
import Service from "@/models/Service";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// only doc can reorder
async function requireDoctor(request) {
    const session = await getServerSession({ req: request, ...authOptions });

    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "doctor") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return null;
}

export async function POST(request) {
  const authError = await requireDoctor(request);
  if (authError) return authError;

  try {
    await connectionToDatabase();

    const { orderedIds } = await request.json(); // ex: ["id1", "id2", "id3"]

    for (let i = 0; i < orderedIds.length; i++) {
      await Service.findByIdAndUpdate(orderedIds[i], { order: i });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reorder error:", err);
    return NextResponse.json(
      { error: "Failed to reorder services" },
      { status: 500 }
    );
  }
}