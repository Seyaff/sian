import { z } from "zod";
import { tool } from "ai";
import { CustomerRepository } from "../../repositories/customer/customer.repository";
import { cleanString, nullableString } from "../../utils/zod-helpers";
import { knowledgeBaseContextSchema } from "../../validators/rag.validation";

const customerRepo = new CustomerRepository();

export const updateCustomerProfileInputSchema = z.object({
  name: nullableString(),
  dietary: z.array(z.string().trim()).optional(),
  favorites: z.array(z.string().trim()).optional(),
});

export const updateCustomerProfileTool = tool({
  contextSchema: knowledgeBaseContextSchema.extend({
    customerPhone: z.string().trim().min(1),
  }),
  description:
    "Save customer name, dietary preferences, or favorite dishes when the customer shares them in conversation.",
  inputSchema: updateCustomerProfileInputSchema,
  execute: async (input, { context }) => {
    const name = cleanString(input.name);

    const customer = await customerRepo.updateProfile(context.customerPhone, context.restaurantId, {
      ...(name ? { name } : {}),
      ...(input.dietary ? { dietary: input.dietary } : {}),
      ...(input.favorites ? { favorites: input.favorites } : {}),
    });

    if (!customer) {
      return { success: false, message: "Customer not found" };
    }

    return {
      success: true,
      name: customer.name,
      preferences: customer.preferences,
    };
  },
});
