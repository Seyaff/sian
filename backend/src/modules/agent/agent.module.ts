import { AgentController } from "./agent.controller";
import { AgentService } from "./agent.service";

const agentService = new AgentService()
const agentController = new AgentController(agentService)

export {agentController, agentService}