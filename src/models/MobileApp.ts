import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMobileApp extends Document {
  name: string;
  appLogo?: string;
  appText?: string;
  appUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MobileAppSchema: Schema<IMobileApp> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    appLogo: { type: String, trim: true, default: "" },
    appText: { type: String, trim: true, default: "" },
    appUrl: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const MobileApp: Model<IMobileApp> =
  mongoose.models.MobileApp || mongoose.model<IMobileApp>("MobileApp", MobileAppSchema);

export default MobileApp;
