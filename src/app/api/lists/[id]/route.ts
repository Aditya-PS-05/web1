import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@libs/auth";
import { connectDB } from "@libs/db/mongoose";
import { Board, List, Card } from "@models/BoardModel";
import type { PopulatedList } from "../../../../types/database";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await connectDB();

    // Find the list and verify ownership through board
    const list = (await List.findById(id).populate("boardId")) as PopulatedList | null;
    if (!list || list.boardId.ownerId.toString() !== session.id) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const updatedList = await List.findByIdAndUpdate(id, { title }, { new: true });

    return NextResponse.json({ list: updatedList });
  } catch (error) {
    console.error("Update list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    // Find the list and verify ownership through board
    const list = (await List.findById(id).populate("boardId")) as PopulatedList | null;
    if (!list || list.boardId.ownerId.toString() !== session.id) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Delete all cards in this list
    await Card.deleteMany({ listId: id });

    // Remove list from board
    await Board.updateOne({ _id: list.boardId }, { $pull: { lists: id } });

    // Delete the list
    await List.deleteOne({ _id: id });

    return NextResponse.json({ message: "List deleted successfully" });
  } catch (error) {
    console.error("Delete list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
