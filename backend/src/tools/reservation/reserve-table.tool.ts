import { tool } from "ai";
import { ReservationRepository } from "../../repositories/reservation/reservation.repository";
import { reserveTableInputSchema, restaurantContextSchema } from "../../validators/restaurant.validation";

const reservationRepo = new ReservationRepository();

export const reserveTableTool = tool({
  contextSchema: restaurantContextSchema,
  description:
    "Book a table for the customer. Collect date, time, and party size before calling this tool.",
  inputSchema: reserveTableInputSchema,
  execute: async (input, { context }) => {
    const reservation = await reservationRepo.create({
      restaurantId: context.restaurantId,
      customerPhone: context.customerPhone,
      date: input.date,
      time: input.time,
      partySize: input.partySize,
      ...(input.specialRequests ? { specialRequests: input.specialRequests } : {}),
    });

    return {
      success: true,
      reservationId: String(reservation._id),
      status: reservation.status,
      date: reservation.date,
      time: reservation.time,
      partySize: reservation.partySize,
      message: `Table reserved for ${input.partySize} on ${input.date} at ${input.time}. Reservation ID: ${reservation._id}`,
    };
  },
});
