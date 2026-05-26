import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import MainMainCategory from "@/models/MainMainCategory";

/**
 * PUBLIC — No authentication required.
 * GET /api/public/mainmaincategories
 *
 * Returns all Main Main Categories sorted by name.
 */
export async function GET() {
  try {
    await connectToDatabase();

    const data = await MainMainCategory.find({})
      .sort({ name: 1 })
      .select("_id name createdAt")
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
    console.error("[PUBLIC] GET mainmaincategories error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
