import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import DocumentModel from "@/models/Document";
import SubSubcategory from "@/models/SubSubcategory";

/**
 * PUBLIC — No authentication required.
 * GET /api/public/documents?subSubcategoryId=<id>
 *
 * Returns all Documents (with PDF URL) under the given Sub-Subcategory.
 * Query Params:
 *   subSubcategoryId (required) — ObjectId of the Sub-Subcategory
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subSubcategoryId = searchParams.get("subSubcategoryId");

    if (!subSubcategoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Query parameter 'subSubcategoryId' is required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify parent sub-subcategory exists
    const parent = await SubSubcategory.findById(subSubcategoryId)
      .select("_id name")
      .lean();

    if (!parent) {
      return NextResponse.json(
        {
          success: false,
          error: "Sub-Subcategory not found.",
        },
        { status: 404 }
      );
    }

    const data = await DocumentModel.find({ subSubcategory: subSubcategoryId })
      .sort({ createdAt: -1 })
      .select("_id title description pdfUrl createdAt")
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
    console.error("[PUBLIC] GET documents error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
