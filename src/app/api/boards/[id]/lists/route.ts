import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@libs/auth";
import { connectDB } from "@libs/db/mongoose";
import { Board, List } from "@models/BoardModel";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: boardId } = await params;
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await connectDB();

    // Verify board ownership
    const board = await Board.findOne({ _id: boardId, ownerId: session.id });
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Get the position for the new list
    const listCount = await List.countDocuments({ boardId });

    const list = await List.create({
      title,
      boardId,
      position: listCount,
    });

    // Add list to board
    await Board.updateOne({ _id: boardId }, { $push: { lists: list._id } });

    return NextResponse.json({ list }, { status: 201 });
  } catch (error) {
    console.error("Create list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
