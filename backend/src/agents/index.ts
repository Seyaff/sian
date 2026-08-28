import { ToolLoopAgent, isStepCount } from "ai";
import { groq } from "@ai-sdk/groq";
import { Env } from "../config/app.config";
import { SystemPrompt, buildCustomerContext } from "./prompts/developer.prompt";
import { knowledgeBaseTool } from "../tools/rag/knowledge-base.tool";
import { getMenuTool } from "../tools/menu/get-menu.tool";
import { placeOrderTool } from "../tools/order/place-order.tool";
import { reserveTableTool } from "../tools/reservation/reserve-table.tool";
import { updateCustomerProfileTool } from "../tools/customer/update-customer-profile.tool";

export interface RestaurantAgentOptions {
  restaurantId: string;
  memoryBlock?: string;
  customer?: {
    name?: string;
    phone: string;
    preferences?: { dietary?: string[]; favorites?: string[] };
    isReturning: boolean;
  };
}

export function createRestaurantAgent(options: RestaurantAgentOptions) {
  const customerContext = buildCustomerContext(options.customer);
  const instructions = [
    SystemPrompt,
    options.memoryBlock,
    customerContext,
  ]
    .filter(Boolean)
    .join("\n\n");

  const customerPhone = options.customer?.phone ?? "";

  return new ToolLoopAgent({
    model: groq("openai/gpt-oss-120b"),
    instructions,
    stopWhen: isStepCount(3),
    tools: {
      knowledgeBaseTool,
      getMenuTool,
      placeOrderTool,
      reserveTableTool,
      updateCustomerProfileTool,
    },
    toolApproval: {
      placeOrderTool: "user-approval",
    },
    toolsContext: {
      knowledgeBaseTool: { restaurantId: options.restaurantId },
      getMenuTool: { restaurantId: options.restaurantId },
      placeOrderTool: { restaurantId: options.restaurantId, customerPhone },
      reserveTableTool: { restaurantId: options.restaurantId, customerPhone },
      updateCustomerProfileTool: { restaurantId: options.restaurantId, customerPhone },
    },
  });
}

const defaultAgent = createRestaurantAgent({
  restaurantId: Env.DEFAULT_RESTAURANT_ID,
});

export default defaultAgent;
