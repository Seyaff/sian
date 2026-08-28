import mongoose, { Document, Schema } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  whatsappPhoneNumberId: string;
  pineconeNamespace: string;
  greetingMessage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    whatsappPhoneNumberId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    pineconeNamespace: {
      type: String,
      required: true,
      trim: true,
    },
    greetingMessage: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const RestaurantModel = mongoose.model<IRestaurant>("Restaurant", restaurantSchema);
export default RestaurantModel;
