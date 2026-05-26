import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import MobileApp from "@/models/MobileApp";

export async function GET() {
  try {
    await connectToDatabase();
    const apps = await MobileApp.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, apps }, { status: 200 });
  } catch (error: any) {
    console.error("GET mobile apps error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, appLogo, appText, appUrl } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "App Name is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await MobileApp.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json(
        { error: "A mobile app with this name already exists." },
        { status: 400 }
      );
    }

    const app = await MobileApp.create({
      name: name.trim(),
      appLogo: appLogo || "",
      appText: appText || "",
      appUrl: appUrl || "",
    });

    return NextResponse.json({ success: true, app }, { status: 201 });
  } catch (error: any) {
    console.error("POST mobile app error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, appLogo, appText, appUrl } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "App ID is required." },
        { status: 400 }
      );
    }

    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: "App Name cannot be empty." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    if (name !== undefined) {
      const duplicate = await MobileApp.findOne({ name: name.trim(), _id: { $ne: id } });
      if (duplicate) {
        return NextResponse.json(
          { error: "Another mobile app with this name already exists." },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (appLogo !== undefined) updateData.appLogo = appLogo;
    if (appText !== undefined) updateData.appText = appText;
    if (appUrl !== undefined) updateData.appUrl = appUrl;

    const updated = await MobileApp.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json(
        { error: "Mobile app not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, app: updated });
  } catch (error: any) {
    console.error("PUT mobile app error:", error);
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
        { error: "App ID is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deleted = await MobileApp.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Mobile app not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Mobile app successfully deleted." }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE mobile app error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
