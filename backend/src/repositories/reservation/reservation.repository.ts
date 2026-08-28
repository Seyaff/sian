import ReservationModel, { IReservation } from "../../models/reservation.model";

export interface CreateReservationInput {
  restaurantId: string;
  customerPhone: string;
  customerName?: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
}

export class ReservationRepository {
  async create(data: CreateReservationInput): Promise<IReservation> {
    const reservation = new ReservationModel({
      ...data,
      status: "confirmed",
    });
    return reservation.save();
  }

  async findByCustomer(phone: string, restaurantId: string): Promise<IReservation[]> {
    return ReservationModel.find({ customerPhone: phone, restaurantId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
  }
}
