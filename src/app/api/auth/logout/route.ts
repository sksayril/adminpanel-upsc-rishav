import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set({
      name: "auth_token",
      value: "",
      httpOnly: true,
      path: "/",
      maxAge: 0,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
