import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_upsceboard_token_2026";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Please fill in all fields." },
        { status: 400 }
      );
    }

    // 2. Connect DB
    await connectToDatabase();

    // 3. Find user (with auto-seed for demo account)
    let user = await User.findOne({ email });
    if (!user && email === "admin@demo.com") {
      const hashedPassword = await bcryptjs.hash("demo12345", 10);
      user = await User.create({
        name: "DEMO ADMIN",
        email: "admin@demo.com",
        password: hashedPassword,
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 400 }
      );
    }

    // 4. Validate password
    const isMatch = await bcryptjs.compare(password, user.password!);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 400 }
      );
    }

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
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
