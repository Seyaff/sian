import mongoose, { Document, Schema } from "mongoose";

export interface IOrderItem {
  name: string;
  quantity: number;
  price?: number;
  notes?: string;
}

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "cancelled";

export interface IOrder extends Document {
  restaurantId: string;
  customerPhone: string;
  customerName?: string;
  items: IOrderItem[];
  orderType: "pickup" | "delivery";
  deliveryAddress?: string;
  specialInstructions?: string;
  status: OrderStatus;
  totalAmount?: number;
  estimatedPrepMinutes: number;
  estimatedReadyAt: Date;
  readyAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number },
    notes: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    restaurantId: { type: String, required: true, index: true },
    customerPhone: { type: String, required: true, index: true },
    customerName: { type: String },
    items: { type: [orderItemSchema], required: true },
    orderType: { type: String, enum: ["pickup", "delivery"], default: "pickup" },
    deliveryAddress: { type: String },
    specialInstructions: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "cancelled"],
      default: "confirmed",
      index: true,
    },
    totalAmount: { type: Number },
    estimatedPrepMinutes: { type: Number, default: 30 },
    estimatedReadyAt: { type: Date, required: true },
    readyAt: { type: Date },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model<IOrder>("Order", orderSchema);
export default OrderModel;
