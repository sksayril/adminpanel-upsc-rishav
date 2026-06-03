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

    const mainMainCategories = await MainMainCategory.find({}).sort({ name: 1 });
    const categories = await Category.find({}).sort({ name: 1 });
    const subcategories = await Subcategory.find({}).sort({ name: 1 });
    const subSubcategories = await SubSubcategory.find({}).sort({ name: 1 });
    const documents = await DocumentModel.find({}).sort({ title: 1 });

    // Assemble the nested catalog tree in memory
    const tree = mainMainCategories.map((mm) => {
      const mmCats = categories
        .filter((cat) => cat.mainMainCategory && cat.mainMainCategory.toString() === mm._id.toString())
        .map((cat) => {
          const catSubs = subcategories
            .filter((sub) => sub.category && sub.category.toString() === cat._id.toString())
            .map((sub) => {
              const subSubSubs = subSubcategories
                .filter((subSub) => subSub.subcategory && subSub.subcategory.toString() === sub._id.toString())
                .map((subSub) => {
                  const subSubDocs = documents.filter(
                    (doc) => doc.subSubcategory && doc.subSubcategory.toString() === subSub._id.toString()
                  );
                  return {
                    _id: subSub._id,
                    name: subSub.name,
                    documents: subSubDocs,
                  };
                });
              return {
                _id: sub._id,
                name: sub.name,
                subSubcategories: subSubSubs,
              };
            });
          return {
            _id: cat._id,
            name: cat.name,
            year: cat.year,
            subcategories: catSubs,
          };
        });
      return {
        _id: mm._id,
        name: mm.name,
        categories: mmCats,
      };
    });

    return NextResponse.json({ success: true, tree }, { status: 200 });
  } catch (error: any) {
    console.error("GET categories tree error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, year, mainMainCategoryId } = await req.json();

    if (!name || year === undefined || !mainMainCategoryId) {
      return NextResponse.json(
        { error: "Category name, year, and parent Main Main Category ID are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Verify parent Main Main Category exists
    const parent = await MainMainCategory.findById(mainMainCategoryId);
    if (!parent) {
      return NextResponse.json(
        { error: "Parent Main Main Category does not exist." },
        { status: 400 }
      );
    }

    // 2. Check duplicate name & year under the same Main Main Category
    const existingCategory = await Category.findOne({ name, year, mainMainCategory: mainMainCategoryId });
    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name and year already exists under this parent." },
        { status: 400 }
      );
    }

    const category = await Category.create({ name, year, mainMainCategory: mainMainCategoryId });
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    console.error("POST category error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, year } = await req.json();
    if (!id || !name || year === undefined) {
      return NextResponse.json(
        { error: "ID, name, and year are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 }
      );
    }

    const duplicate = await Category.findOne({
      name,
      year,
      mainMainCategory: category.mainMainCategory,
      _id: { $ne: id },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "Category with this name and year already exists under the same parent." },
        { status: 400 }
      );
    }

    category.name = name;
    category.year = year;
    await category.save();

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("PUT category error:", error);
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
        { error: "Category ID is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 }
      );
    }

    // Cascade delete in MongoDB
    const subs = await Subcategory.find({ category: id });
    const subIds = subs.map((s) => s._id);

    const subSubs = await SubSubcategory.find({ subcategory: { $in: subIds } });
    const subSubIds = subSubs.map((ss) => ss._id);

    // Delete documents under subSubcategories (MongoDB only)
    await DocumentModel.deleteMany({ subSubcategory: { $in: subSubIds } });

    // Delete sub-subcategories
    await SubSubcategory.deleteMany({ subcategory: { $in: subIds } });

    // Delete subcategories
    await Subcategory.deleteMany({ category: id });

    // Delete category
    await Category.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Category and all associated sub-items deleted from MongoDB." });
  } catch (error: any) {
    console.error("DELETE category error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
