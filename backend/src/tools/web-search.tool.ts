import "dotenv/config"

import { tool } from "ai"
import { tavilyInputSchema } from "../validators/tool.validation"
import { tavily, } from "@tavily/core"
import { Env } from "../config/app.config"


const tavilInit = tavily({ apiKey:  "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" })


export const tavilyWebSearchTool = tool({
    description: "Search the web for current events, factual information, and detailed content.",
    inputSchema: tavilyInputSchema,
    execute: async ({ query, searchDepth }) => {
        try {
            const response = await tavilInit.search(query, {
                searchDepth,
                maxResults: 10,
                includeAnswer: false,
            })
            return response.results
        } catch (error) {
            console.error("Tavily search error:", error);
            return { error: error || "Failed to fetch web results." };
        }
    }
})