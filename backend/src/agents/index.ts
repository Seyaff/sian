import {  ToolLoopAgent } from 'ai';
import { groq } from "@ai-sdk/groq";
import { createUserTool } from '../tools/db/create-user.tool';
import { SystemPrompt } from './prompts/developer.prompt';
import { tavilyWebSearchTool } from '../tools/web-search.tool';



const createUserAgent = new ToolLoopAgent({
  model: groq("openai/gpt-oss-120b"),
  instructions: SystemPrompt,

  tools: {
    createUserTool,
    tavilyWebSearchTool
  },
  toolApproval: {
    createUserTool: "user-approval"
  },
  toolsContext: {
    createUserTool: {
      userAccessToken: "thisistheaccesstoken"
    }
  }
});

export default createUserAgent;