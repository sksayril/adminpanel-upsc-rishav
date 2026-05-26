import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubSubcategory extends Document {
  name: string;
  subcategory: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SubSubcategorySchema: Schema<ISubSubcategory> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    subcategory: { type: Schema.Types.ObjectId, ref: "Subcategory", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SubSubcategorySchema.index({ name: 1, subcategory: 1 }, { unique: true });

const SubSubcategory: Model<ISubSubcategory> =
  mongoose.models.SubSubcategory || mongoose.model<ISubSubcategory>("SubSubcategory", SubSubcategorySchema);

export default SubSubcategory;
