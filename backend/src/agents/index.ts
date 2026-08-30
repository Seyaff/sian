import { ToolLoopAgent, isStepCount } from "ai";
import { Env } from "../config/app.config";
import { resolveAgentModel } from "./resolve-model";
import { SystemPrompt, buildCustomerContext } from "./prompts/developer.prompt";
import { knowledgeBaseTool } from "../tools/rag/knowledge-base.tool";
import { getMenuTool } from "../tools/menu/get-menu.tool";
import { searchMenuTool } from "../tools/menu/search-menu.tool";
import { proposeOrderTool } from "../tools/order/propose-order.tool";
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
    model: resolveAgentModel(),
    instructions,
    stopWhen: isStepCount(5),
    tools: {
      knowledgeBaseTool,
      searchMenuTool,
      getMenuTool,
      proposeOrderTool,
      reserveTableTool,
      updateCustomerProfileTool,
    },
    toolsContext: {
      knowledgeBaseTool: { restaurantId: options.restaurantId },
      searchMenuTool: { restaurantId: options.restaurantId },
      getMenuTool: { restaurantId: options.restaurantId },
      proposeOrderTool: { restaurantId: options.restaurantId, customerPhone },
      reserveTableTool: { restaurantId: options.restaurantId, customerPhone },
      updateCustomerProfileTool: { restaurantId: options.restaurantId, customerPhone },
    },
  });
}

const defaultAgent = createRestaurantAgent({
  restaurantId: Env.DEFAULT_RESTAURANT_ID,
});

export default defaultAgent;
