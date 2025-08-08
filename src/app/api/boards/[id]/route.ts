import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@libs/auth";
import { connectDB } from "@libs/db/mongoose";
import { Board, List, Card, IList } from "@models/BoardModel";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const board = await Board.findOne({ _id: id, ownerId: session.id }).populate({
      path: "lists",
      populate: {
        path: "cards",
        options: { sort: { position: 1 } },
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    console.log("Fetching board:", id);
    console.log(
      "Board.lists array order:",
      board.lists.map((list: IList) => ({ id: list._id.toString(), title: list.title }))
    );

    return NextResponse.json({ board });
  } catch (error) {
    console.error("Get board error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const board = await Board.findOneAndUpdate({ _id: id, ownerId: session.id }, { title, description }, { new: true });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json({ board });
  } catch (error) {
    console.error("Update board error:", error);
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

    const board = await Board.findOne({ _id: id, ownerId: session.id });
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Delete all cards in all lists
    await Card.deleteMany({ listId: { $in: board.lists } });

    // Delete all lists
    await List.deleteMany({ boardId: id });

    // Delete the board
    await Board.deleteOne({ _id: id });

    return NextResponse.json({ message: "Board deleted successfully" });
  } catch (error) {
    console.error("Delete board error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
