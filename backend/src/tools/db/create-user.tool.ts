import { tool } from "ai";
import { createUserSchema, userContextSchema } from "../../validators/user.validation";
import { UserRepository } from "../../repositories/user/user.repository";

const userRepo = new UserRepository();

export const createUserTool = tool({
  contextSchema: userContextSchema,
  description: ({ context, experimental_sandbox }) => {
    return `Create a new user account in the database` +
      (context.userAccessToken !== undefined ? "Create the account for user and return the data . if thers any error cleanly pass it to the user" : "throw error asking the user about their access token")
  },
  inputSchema: createUserSchema,
  inputExamples: [
    { input: { name: 'Siyaf', email: "seyaffxh@gmail.com", password: "yobro123" } },
    { input: { name: 'Sian', email: "sian@gmail.com", password: "sian123" } },

  ],

  execute: async ({ name, email, password }, { context, toolCallId, abortSignal, messages }) => {


    console.log(`The context is : ${context}`)
    console.log(`The tool call Id is : ${toolCallId}`),
      console.log(`This is the abortsignal . Im just loggin to see how it looks : ${abortSignal}`)
    console.log(`The messages : ${messages}`)

    try {
      const user = await userRepo.createUser({ name, email, password });
      return { success: true, user }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
});