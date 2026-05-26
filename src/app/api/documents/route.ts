import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { connectToDatabase } from "@/lib/db";
import SubSubcategory from "@/models/SubSubcategory";
import DocumentModel from "@/models/Document";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const subSubcategoryId = formData.get("subSubcategoryId") as string;

    // 1. Validations
    if (!file || !title || !subSubcategoryId) {
      return NextResponse.json(
        { error: "File, Title, and Sub-subcategory ID are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 2. Verify sub-subcategory exists
    const subSub = await SubSubcategory.findById(subSubcategoryId);
    if (!subSub) {
      return NextResponse.json(
        { error: "Target Sub-subcategory does not exist." },
        { status: 400 }
      );
    }

    // 3. Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Upload to S3
    const bucketName = process.env.AWS_S3_BUCKET_NAME || "notes-market-bucket";
    const region = process.env.AWS_REGION || "eu-north-1";
    
    // Replace non-ascii or spaces in file name for safe S3 Key
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const key = `pdfs/${Date.now()}_${safeName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/pdf",
      })
    );

    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    // 5. Save Document metadata in MongoDB
    const document = await DocumentModel.create({
      title,
      description,
      pdfUrl: fileUrl,
      subSubcategory: subSubcategoryId,
    });

    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (error: any) {
    console.error("POST document upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload document" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, title, description } = await req.json();
    if (!id || !title) {
      return NextResponse.json(
        { error: "ID and Title are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updated = await DocumentModel.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, document: updated });
  } catch (error: any) {
    console.error("PUT document error:", error);
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
        { error: "Document ID is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    // Delete metadata from MongoDB only (preserves AWS S3 file)
    await DocumentModel.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Document registry deleted from MongoDB. S3 file remains intact." });
  } catch (error: any) {
    console.error("DELETE document error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
