import mongoose, { Document, Schema } from "mongoose";

export interface IMenuItem extends Document {
  restaurantId: string;
  name: string;
  category: string;
  price?: number;
  priceLabel?: string;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    price: { type: Number },
    priceLabel: { type: String, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

menuItemSchema.index({ restaurantId: 1, category: 1 });
menuItemSchema.index({ restaurantId: 1, name: 1 });

const MenuItemModel = mongoose.model<IMenuItem>("MenuItem", menuItemSchema);
export default MenuItemModel;
