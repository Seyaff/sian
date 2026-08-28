import mongoose, { Document, Schema, Types } from "mongoose";

export type CustomerEventType =
  | "order_placed"
  | "reservation_made"
  | "campaign_sent"
  | "campaign_opened"
  | "opted_out"
  | "name_updated"
  | "preference_updated"
  | "summary_updated";

export interface ICustomerEvent extends Document {
  customerId?: Types.ObjectId;
  phone: string;
  restaurantId: string;
  type: CustomerEventType;
  payload?: Record<string, unknown>;
  createdAt: Date;
}

const customerEventSchema = new Schema<ICustomerEvent>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    phone: { type: String, required: true, index: true },
    restaurantId: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const CustomerEventModel = mongoose.model<ICustomerEvent>("CustomerEvent", customerEventSchema);
export default CustomerEventModel;
