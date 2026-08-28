import mongoose, { Document, Schema } from "mongoose";

export interface IReservation extends Document {
  restaurantId: string;
  customerPhone: string;
  customerName?: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    restaurantId: { type: String, required: true, index: true },
    customerPhone: { type: String, required: true, index: true },
    customerName: { type: String },
    date: { type: String, required: true },
    time: { type: String, required: true },
    partySize: { type: Number, required: true },
    specialRequests: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const ReservationModel = mongoose.model<IReservation>("Reservation", reservationSchema);
export default ReservationModel;
