import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Subcategory from "@/models/Subcategory";
import SubSubcategory from "@/models/SubSubcategory";
import DocumentModel from "@/models/Document";

export async function POST(req: Request) {
  try {
    const { name, subcategoryId } = await req.json();

    if (!name || !subcategoryId) {
      return NextResponse.json(
        { error: "Sub-subcategory name and parent Subcategory ID are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Verify parent Subcategory exists
    const parentSubcategory = await Subcategory.findById(subcategoryId);
    if (!parentSubcategory) {
      return NextResponse.json(
        { error: "Parent subcategory does not exist." },
        { status: 400 }
      );
    }

    // 2. Check duplicate name under the same Subcategory
    const existingSubSub = await SubSubcategory.findOne({ name, subcategory: subcategoryId });
    if (existingSubSub) {
      return NextResponse.json(
        { error: "Sub-subcategory already exists under this parent subcategory." },
        { status: 400 }
      );
    }

    // 3. Create sub-subcategory
    const subSubcategory = await SubSubcategory.create({
      name,
      subcategory: subcategoryId,
    });

    return NextResponse.json({ success: true, subSubcategory }, { status: 201 });
  } catch (error: any) {
    console.error("POST sub-subcategory error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name } = await req.json();
    if (!id || !name) {
      return NextResponse.json(
        { error: "ID and name are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const subSub = await SubSubcategory.findById(id);
    if (!subSub) {
      return NextResponse.json(
        { error: "Sub-subcategory not found." },
        { status: 404 }
      );
    }

    const duplicate = await SubSubcategory.findOne({
      name,
      subcategory: subSub.subcategory,
      _id: { $ne: id },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "Sub-subcategory already exists under the same parent subcategory." },
        { status: 400 }
      );
    }

    subSub.name = name;
    await subSub.save();

    return NextResponse.json({ success: true, subSubcategory: subSub });
  } catch (error: any) {
    console.error("PUT sub-subcategory error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Sub-subcategory ID is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const subSub = await SubSubcategory.findById(id);
    if (!subSub) {
      return NextResponse.json(
        { error: "Sub-subcategory not found." },
        { status: 404 }
      );
    }

    // Cascade delete documents (MongoDB only, preserve S3 PDFs)
    await DocumentModel.deleteMany({ subSubcategory: id });
    await SubSubcategory.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Sub-subcategory and associated documents deleted from MongoDB." });
  } catch (error: any) {
    console.error("DELETE sub-subcategory error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
