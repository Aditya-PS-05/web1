import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@libs/auth";
import { connectDB } from "@libs/db/mongoose";
import { List, Card } from "@models/BoardModel";
import type { PopulatedList } from "../../../../../types/database";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: listId } = await params;
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await connectDB();

    // Verify list exists and user has access through board ownership
    const list = (await List.findById(listId).populate("boardId")) as PopulatedList | null;
    if (!list || list.boardId.ownerId.toString() !== session.id) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Get the position for the new card
    const cardCount = await Card.countDocuments({ listId });

    const card = await Card.create({
      title,
      description,
      listId,
      position: cardCount,
    });

    // Add card to list
    await List.updateOne({ _id: listId }, { $push: { cards: card._id } });

    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    console.error("Create card error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
