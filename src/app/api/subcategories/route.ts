import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";
import Subcategory from "@/models/Subcategory";
import SubSubcategory from "@/models/SubSubcategory";
import DocumentModel from "@/models/Document";

export async function POST(req: Request) {
  try {
    const { name, categoryId } = await req.json();

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Subcategory name and parent Category ID are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Verify parent Category exists
    const parentCategory = await Category.findById(categoryId);
    if (!parentCategory) {
      return NextResponse.json(
        { error: "Parent category does not exist." },
        { status: 400 }
      );
    }

    // 2. Check duplicate name under the same Category
    const existingSub = await Subcategory.findOne({ name, category: categoryId });
    if (existingSub) {
      return NextResponse.json(
        { error: "Subcategory already exists under this parent category." },
        { status: 400 }
      );
    }

    // 3. Create subcategory
    const subcategory = await Subcategory.create({
      name,
      category: categoryId,
    });

    return NextResponse.json({ success: true, subcategory }, { status: 201 });
  } catch (error: any) {
    console.error("POST subcategory error:", error);
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

    const sub = await Subcategory.findById(id);
    if (!sub) {
      return NextResponse.json(
        { error: "Subcategory not found." },
        { status: 404 }
      );
    }

    const duplicate = await Subcategory.findOne({
      name,
      category: sub.category,
      _id: { $ne: id },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "Subcategory already exists under the same parent category." },
        { status: 400 }
      );
    }

    sub.name = name;
    await sub.save();

    return NextResponse.json({ success: true, subcategory: sub });
  } catch (error: any) {
    console.error("PUT subcategory error:", error);
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
        { error: "Subcategory ID is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const sub = await Subcategory.findById(id);
    if (!sub) {
      return NextResponse.json(
        { error: "Subcategory not found." },
        { status: 404 }
      );
    }

    // Cascade delete subsubcategories and documents (MongoDB only)
    const subSubs = await SubSubcategory.find({ subcategory: id });
    const subSubIds = subSubs.map((ss) => ss._id);

    await DocumentModel.deleteMany({ subSubcategory: { $in: subSubIds } });
    await SubSubcategory.deleteMany({ subcategory: id });
    await Subcategory.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Subcategory and associated items deleted from MongoDB." });
  } catch (error: any) {
    console.error("DELETE subcategory error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
