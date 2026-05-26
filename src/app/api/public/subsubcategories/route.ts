import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import SubSubcategory from "@/models/SubSubcategory";
import Subcategory from "@/models/Subcategory";

/**
 * PUBLIC — No authentication required.
 * GET /api/public/subsubcategories?subcategoryId=<id>
 *
 * Returns all Sub-Subcategories under the given Subcategory.
 * Query Params:
 *   subcategoryId (required) — ObjectId of the Subcategory
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subcategoryId = searchParams.get("subcategoryId");

    if (!subcategoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Query parameter 'subcategoryId' is required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify parent subcategory exists
    const parent = await Subcategory.findById(subcategoryId)
      .select("_id name")
      .lean();

    if (!parent) {
      return NextResponse.json(
        {
          success: false,
          error: "Subcategory not found.",
        },
        { status: 404 }
      );
    }

    const data = await SubSubcategory.find({ subcategory: subcategoryId })
      .sort({ name: 1 })
      .select("_id name createdAt")
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
    console.error("[PUBLIC] GET subsubcategories error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
