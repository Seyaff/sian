import { tool } from "ai";
import { checkInventorySchema } from "./check-stock.schema";

const checkAvailableInventoryTool = tool({
    description : "Checks whether something is low in stock such as tomatoes , potatoes and anything ",
    inputSchema : checkInventorySchema,
    execute : async () => {
        
    }
})