import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Subcategory from "@/models/Subcategory";
import Category from "@/models/Category";

/**
 * PUBLIC — No authentication required.
 * GET /api/public/subcategories?categoryId=<id>
 *
 * Returns all Subcategories under the given Category.
 * Query Params:
 *   categoryId (required) — ObjectId of the Category
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Query parameter 'categoryId' is required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify parent category exists
    const parent = await Category.findById(categoryId)
      .select("_id name year")
      .lean();

    if (!parent) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found.",
        },
        { status: 404 }
      );
    }

    const data = await Subcategory.find({ category: categoryId })
      .sort({ createdAt: -1 })
      .select("_id name createdAt")
      .lean();

    return NextResponse.json(
      {
        success: true,
        parent: {
          _id: parent._id,
          name: (parent as any).name,
          year: (parent as any).year,
        },
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
    console.error("[PUBLIC] GET subcategories error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
