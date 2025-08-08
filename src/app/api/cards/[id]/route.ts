import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@libs/auth";
import { connectDB } from "@libs/db/mongoose";
import { List, Card } from "@models/BoardModel";
import type { PopulatedCard } from "../../../../types/database";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await connectDB();

    // Find the card and verify ownership through list -> board
    const card = (await Card.findById(id).populate({
      path: "listId",
      populate: { path: "boardId" },
    })) as PopulatedCard | null;

    if (!card || card.listId.boardId.ownerId.toString() !== session.id) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const updatedCard = await Card.findByIdAndUpdate(id, { title, description }, { new: true });

    return NextResponse.json({ card: updatedCard });
  } catch (error) {
    console.error("Update card error:", error);
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

    // Find the card and verify ownership through list -> board
    const card = (await Card.findById(id).populate({
      path: "listId",
      populate: { path: "boardId" },
    })) as PopulatedCard | null;

    if (!card || card.listId.boardId.ownerId.toString() !== session.id) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Remove card from list
    await List.updateOne({ _id: card.listId }, { $pull: { cards: id } });

    // Delete the card
    await Card.deleteOne({ _id: id });

    return NextResponse.json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error("Delete card error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
