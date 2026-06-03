import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import MainMainCategory from "@/models/MainMainCategory";
import Category from "@/models/Category";
import Subcategory from "@/models/Subcategory";
import SubSubcategory from "@/models/SubSubcategory";
import DocumentModel from "@/models/Document";

export async function GET() {
  try {
    await connectToDatabase();
    const mainMainCategories = await MainMainCategory.find({}).sort({ createdAt: 1 });
    return NextResponse.json({ success: true, mainMainCategories }, { status: 200 });
  } catch (error: any) {
    console.error("GET mainmaincategories error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Main Main Category name is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await MainMainCategory.findOne({ name });
    if (existing) {
      return NextResponse.json(
        { error: "Main Main Category with this name already exists." },
        { status: 400 }
      );
    }

    const mainMain = await MainMainCategory.create({ name });
    return NextResponse.json({ success: true, mainMainCategory: mainMain }, { status: 201 });
  } catch (error: any) {
    console.error("POST mainmaincategory error:", error);
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

    const duplicate = await MainMainCategory.findOne({ name, _id: { $ne: id } });
    if (duplicate) {
      return NextResponse.json(
        { error: "Main Main Category with this name already exists." },
        { status: 400 }
      );
    }

    const updated = await MainMainCategory.findByIdAndUpdate(id, { name }, { new: true });
    if (!updated) {
      return NextResponse.json(
        { error: "Main Main Category not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, mainMainCategory: updated });
  } catch (error: any) {
    console.error("PUT mainmaincategory error:", error);
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
        { error: "Main Main Category ID is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const mainMain = await MainMainCategory.findById(id);
    if (!mainMain) {
      return NextResponse.json(
        { error: "Main Main Category not found." },
        { status: 404 }
      );
    }

    // 1. Find all Category children of this MainMainCategory
    const categories = await Category.find({ mainMainCategory: id });
    const catIds = categories.map((c) => c._id);

    // 2. Find all Subcategory children of those Categories
    const subcategories = await Subcategory.find({ category: { $in: catIds } });
    const subIds = subcategories.map((s) => s._id);

    // 3. Find all SubSubcategory children of those Subcategories
    const subSubcategories = await SubSubcategory.find({ subcategory: { $in: subIds } });
    const subSubIds = subSubcategories.map((ss) => ss._id);

    // 4. Delete documents under those SubSubcategories
    await DocumentModel.deleteMany({ subSubcategory: { $in: subSubIds } });

    // 5. Delete sub-subcategories
    await SubSubcategory.deleteMany({ subcategory: { $in: subIds } });

    // 6. Delete subcategories
    await Subcategory.deleteMany({ category: { $in: catIds } });

    // 7. Delete categories
    await Category.deleteMany({ mainMainCategory: id });

    // 8. Delete main-main category
    await MainMainCategory.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Main Main Category and all associated sub-items deleted from MongoDB.",
    });
  } catch (error: any) {
    console.error("DELETE mainmaincategory error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
