import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDocument extends Document {
  title: string;
  description?: string;
  pdfUrl: string;
  subSubcategory: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DocumentSchema: Schema<IDocument> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    pdfUrl: { type: String, required: true },
    subSubcategory: { type: Schema.Types.ObjectId, ref: "SubSubcategory", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const DocumentModel: Model<IDocument> =
  mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);

export default DocumentModel;
