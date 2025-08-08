import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@libs/auth";
import { connectDB } from "@libs/db/mongoose";
import { Board } from "@models/BoardModel";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const boards = await Board.find({ ownerId: session.id }).sort({ createdAt: -1 });

    return NextResponse.json({ boards });
  } catch (error) {
    console.error("Get boards error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description } = await request.json();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await connectDB();
    const board = await Board.create({
      title,
      description,
      ownerId: session.id,
    });

    return NextResponse.json({ board }, { status: 201 });
  } catch (error) {
    console.error("Create board error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
