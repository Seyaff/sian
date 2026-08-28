import { z } from "zod";

export const restaurantContextSchema = z.object({
  restaurantId: z.string().trim().min(1),
  customerPhone: z.string().trim().min(1),
});

export const placeOrderInputSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        quantity: z.number().int().positive(),
        price: z.number().nonnegative().optional(),
        notes: z.string().trim().optional(),
      })
    )
    .min(1),
  orderType: z.enum(["pickup", "delivery"]).default("pickup"),
  deliveryAddress: z.string().trim().optional(),
  specialInstructions: z.string().trim().optional(),
  estimatedPrepMinutes: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Estimated preparation time in minutes, e.g. 30"),
});

export const reserveTableInputSchema = z.object({
  date: z.string().trim().min(1).describe("Reservation date, e.g. 2026-08-28"),
  time: z.string().trim().min(1).describe("Reservation time, e.g. 7:30 PM"),
  partySize: z.number().int().positive(),
  specialRequests: z.string().trim().optional(),
});

export const createRestaurantSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  whatsappPhoneNumberId: z.string().trim().min(1),
  pineconeNamespace: z.string().trim().min(1),
  greetingMessage: z.string().trim().optional(),
  isActive: z.boolean().optional().default(true),
});

export const ingestRestaurantSchema = z.object({
  filePath: z.string().trim().min(1),
});
