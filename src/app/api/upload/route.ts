import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

    if (!file) {
      return NextResponse.json(
        { error: "No file was uploaded." },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const bucketName = process.env.AWS_S3_BUCKET_NAME || "notes-market-bucket";
    const region = process.env.AWS_REGION || "eu-north-1";

    // Replace non-ascii or spaces in file name for safe S3 Key
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const key = `app-logos/${Date.now()}_${safeName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type || "image/png",
      })
    );

    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json({ success: true, url: fileUrl }, { status: 200 });
  } catch (error: any) {
    console.error("POST app logo upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload logo to S3" },
      { status: 500 }
    );
  }
}
