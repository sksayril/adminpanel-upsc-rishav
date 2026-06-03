import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  year: string;
  mainMainCategory: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    year: { type: String, default: "", trim: true },
    mainMainCategory: { type: Schema.Types.ObjectId, ref: "MainMainCategory", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CategorySchema.index({ name: 1, year: 1, mainMainCategory: 1 }, { unique: true });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
