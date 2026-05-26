import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubcategory extends Document {
  name: string;
  category: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SubcategorySchema: Schema<ISubcategory> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SubcategorySchema.index({ name: 1, category: 1 }, { unique: true });

const Subcategory: Model<ISubcategory> =
  mongoose.models.Subcategory || mongoose.model<ISubcategory>("Subcategory", SubcategorySchema);

export default Subcategory;
