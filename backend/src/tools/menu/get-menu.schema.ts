import { z } from "zod";
import { nullableString } from "../../utils/zod-helpers";

export const getMenuInputSchema = z.object({
  category: nullableString().describe("Menu category e.g. BBQ, Starters. Null for all categories."),
});
