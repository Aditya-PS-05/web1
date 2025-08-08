import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@libs/db/mongoose";
import { Board } from "@libs/db/models/BoardModel";
import { verifyToken } from "@libs/auth";
import { nanoid } from "nanoid";

// GET /api/boards/[id]/share - Get share information
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
    if (board.ownerId.toString() !== decoded.userId) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      isPublic: board.isPublic,
      shareSlug: board.shareSlug,
      shareUrl: board.shareSlug ? `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/share/${board.shareSlug}` : null,
    });
  } catch (error) {
    console.error("Error getting share info:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/boards/[id]/share - Toggle public sharing
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
    if (board.ownerId.toString() !== decoded.userId) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { action } = await request.json();

    if (action === "enable") {
      // Enable public sharing
      if (!board.shareSlug) {
        // Generate unique slug
        let slug;
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
          slug = nanoid(10);
          const existingBoard = await Board.findOne({ shareSlug: slug });
          if (!existingBoard) {
            isUnique = true;
          }
          attempts++;
        }

        if (!isUnique) {
          return NextResponse.json({ message: "Failed to generate unique share link" }, { status: 500 });
        }

        board.shareSlug = slug;
      }
      board.isPublic = true;
    } else if (action === "disable") {
      // Disable public sharing
      board.isPublic = false;
      // Keep the slug in case they want to re-enable
    }

    await board.save();

    return NextResponse.json({
      message: `Board sharing ${action}d successfully`,
      isPublic: board.isPublic,
      shareSlug: board.shareSlug,
      shareUrl: board.shareSlug ? `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/share/${board.shareSlug}` : null,
    });
  } catch (error) {
    console.error("Error toggling share:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
