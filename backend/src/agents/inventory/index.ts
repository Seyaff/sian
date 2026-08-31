import { ToolLoopAgent } from "ai";
import { resolveAgentModel } from "../resolve-model";
import { INVENTORY_AGENT_SYSTEM_PROMPT } from "../prompts/inventory.prompt";


const inventoryAgent = new ToolLoopAgent({
    model  : resolveAgentModel(),
    instructions : INVENTORY_AGENT_SYSTEM_PROMPT
})