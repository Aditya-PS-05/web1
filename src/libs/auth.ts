import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "./db/mongoose";
import { User } from "./db/models/UserModel";

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key";
const COOKIE_NAME = "boardhub-auth";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  "use server";
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  "use server";
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser): Promise<void> {
  "use server";
  const token = generateToken(user);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export async function getSession(): Promise<SessionUser | null> {
  "use server";
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function signup(email: string, password: string, name: string): Promise<{ success: boolean; error?: string; user?: SessionUser }> {
  "use server";
  try {
    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: "User already exists" };
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    const sessionUser: SessionUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    await createSession(sessionUser);

    return { success: true, user: sessionUser };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "Failed to create account" };
  }
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: SessionUser }> {
  "use server";
  try {
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, error: "Invalid credentials" };
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return { success: false, error: "Invalid credentials" };
    }

    const sessionUser: SessionUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    await createSession(sessionUser);

    return { success: true, user: sessionUser };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Failed to login" };
  }
}

export async function logout(): Promise<void> {
  "use server";
  await destroySession();
}
