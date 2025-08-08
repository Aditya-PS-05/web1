import { NextResponse } from "next/server";
import { logout } from "@libs/auth";

export async function POST() {
  try {
    await logout();
    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
