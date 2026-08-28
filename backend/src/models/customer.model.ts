import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICustomerLastOrderItem {
  name: string;
  quantity: number;
}

export interface ICustomer extends Document {
  phone: string;
  name?: string;
  restaurantId: string;
  preferences?: {
    dietary?: string[];
    favorites?: string[];
    spiceLevel?: string;
    language?: string;
  };
  orderHistory: Types.ObjectId[];
  lastOrderAt?: Date;
  lastOrderItems: ICustomerLastOrderItem[];
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  conversationSummary?: string;
  summaryUpdatedAt?: Date;
  marketingOptIn: boolean;
  lastCampaignAt?: Date;
  tags: string[];
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    phone: { type: String, required: true, trim: true, index: true },
    name: { type: String, trim: true },
    restaurantId: { type: String, required: true, index: true },
    preferences: {
      dietary: [{ type: String }],
      favorites: [{ type: String }],
      spiceLevel: { type: String },
      language: { type: String },
    },
    orderHistory: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    lastOrderAt: { type: Date },
    lastOrderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    conversationSummary: { type: String },
    summaryUpdatedAt: { type: Date },
    marketingOptIn: { type: Boolean, default: true },
    lastCampaignAt: { type: Date },
    tags: [{ type: String }],
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

customerSchema.index({ phone: 1, restaurantId: 1 }, { unique: true });
customerSchema.index({ restaurantId: 1, lastOrderAt: 1 });
customerSchema.index({ restaurantId: 1, totalOrders: 1 });
customerSchema.index({ restaurantId: 1, marketingOptIn: 1 });

const CustomerModel = mongoose.model<ICustomer>("Customer", customerSchema);
export default CustomerModel;
