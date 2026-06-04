import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";
import MainMainCategory from "@/models/MainMainCategory";

/**
 * PUBLIC — No authentication required.
 * GET /api/public/categories?mainMainCategoryId=<id>
 *
 * Returns all Categories under the given Main Main Category.
 * Query Params:
 *   mainMainCategoryId (required) — ObjectId of the Main Main Category
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mainMainCategoryId = searchParams.get("mainMainCategoryId");

    if (!mainMainCategoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Query parameter 'mainMainCategoryId' is required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify parent exists
    const parent = await MainMainCategory.findById(mainMainCategoryId)
      .select("_id name")
      .lean();

    if (!parent) {
      return NextResponse.json(
        {
          success: false,
          error: "Main Main Category not found.",
        },
        { status: 404 }
      );
    }

    const data = await Category.find({ mainMainCategory: mainMainCategoryId })
      .sort({ createdAt: -1 })
      .select("_id name year createdAt")
      .lean();

    return NextResponse.json(
      {
        success: true,
        parent: { _id: parent._id, name: (parent as any).name },
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
    console.error("[PUBLIC] GET categories error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
