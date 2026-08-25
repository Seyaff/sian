import { z } from "zod"

export const userQuerySchema = z.object({
    query: z.string().trim()
})