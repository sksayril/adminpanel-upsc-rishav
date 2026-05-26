import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMainMainCategory extends Document {
  name: string;
  appLogo?: string;
  appText?: string;
  appUrl?: string;
  createdAt: Date;
}

const MainMainCategorySchema: Schema<IMainMainCategory> = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    appLogo: { type: String, trim: true, default: "" },
    appText: { type: String, trim: true, default: "" },
    appUrl: { type: String, trim: true, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const MainMainCategory: Model<IMainMainCategory> =
  mongoose.models.MainMainCategory || mongoose.model<IMainMainCategory>("MainMainCategory", MainMainCategorySchema);

export default MainMainCategory;
