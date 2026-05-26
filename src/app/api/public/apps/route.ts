import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import MobileApp from "@/models/MobileApp";

/**
 * PUBLIC — No authentication required.
 * GET /api/public/apps
 *
 * Returns all Mobile Apps sorted by name.
 */
export async function GET() {
  try {
    await connectToDatabase();

    const data = await MobileApp.find({})
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: data.length,
        data,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error: any) {
    console.error("[PUBLIC] GET mobile apps error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
