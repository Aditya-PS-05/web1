import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@libs/db/mongoose";
import { Board, IList, ICard } from "@libs/db/models/BoardModel";

// GET /api/share/[slug] - Get shared board by slug
export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB();

    const board = await Board.findOne({ shareSlug: params.slug, isPublic: true }).populate({
      path: "lists",
      populate: {
        path: "cards",
        model: "Card",
        options: { sort: { position: 1 } },
      },
      options: { sort: { position: 1 } },
    });

    if (!board) {
      return NextResponse.json({ message: "Shared board not found or not public" }, { status: 404 });
    }

    // Transform the board data to match the expected format
    const transformedBoard = {
      _id: board._id.toString(),
      title: board.title,
      description: board.description,
      isShared: true,
      isReadOnly: true,
      lists: board.lists.map((list: IList) => ({
        _id: list._id.toString(),
        title: list.title,
        position: list.position,
        cards: (list.cards as unknown as ICard[]).map((card) => ({
          _id: card._id.toString(),
          title: card.title,
          description: card.description,
          position: card.position,
          listId: card.listId.toString(),
        })),
      })),
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };

    return NextResponse.json({ board: transformedBoard });
  } catch (error) {
    console.error("Error fetching shared board:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
