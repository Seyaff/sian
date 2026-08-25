import { z } from "zod"


export const tavilyInputSchema = z.object({
    query: z.string().describe("The search query to look up on the web."),
    searchDepth: z
        .enum(["basic", "advanced"])
        .optional()
        .default("basic")
        .describe("Use 'advanced' for deeper research queries."),
})