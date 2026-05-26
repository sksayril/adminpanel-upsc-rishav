import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_upsceboard_token_2026";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 1. Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please fill in all fields." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // 2. Connect DB
    await connectToDatabase();

    // 3. User uniqueness check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered." },
        { status: 400 }
      );
    }

    // 4. Hash password & create user
    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 5. Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6. Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json(
      {
        success: true,
        user: { name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
