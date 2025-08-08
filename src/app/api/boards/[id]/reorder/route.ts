import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@libs/db/mongoose";
import { Board } from "@libs/db/models/BoardModel";
import { verifyToken } from "@libs/auth";

// POST /api/boards/[id]/reorder - Reorder lists in a board
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const board = await Board.findById(params.id);
    if (!board) {
      return NextResponse.json({ message: "Board not found" }, { status: 404 });
    }

    // Check if user owns the board
    if (board.ownerId.toString() !== decoded.id) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { listIds } = await request.json();

    console.log("Reorder API called for board:", params.id);
    console.log("Current board.lists:", board.lists);
    console.log("New listIds:", listIds);

    if (!Array.isArray(listIds)) {
      return NextResponse.json({ message: "listIds must be an array" }, { status: 400 });
    }

    // Update the board with the new list order
    board.lists = listIds;
    await board.save();

    console.log("Board saved with new list order:", board.lists);

    return NextResponse.json({
      message: "Lists reordered successfully",
      listIds: board.lists,
    });
  } catch (error) {
    console.error("Error reordering lists:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
